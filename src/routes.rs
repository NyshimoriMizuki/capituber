/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::fs::read_to_string;

use futures::lock::Mutex;
use rocket::{
    response::stream::{Event, EventStream},
    serde::json::{self, Json},
    tokio::time::{interval, Duration},
    State,
};
use rocket_dyn_templates::{context, Template};

use crate::{
    model::{ModelConfig, ModelState, MouthState},
    transform::Transform,
};

#[get("/")]
pub fn home() -> Template {
    Template::render(
        "home",
        context! {
            title: "home"
        },
    )
}

#[get("/model")]
pub fn model() -> Template {
    Template::render(
        "model",
        context! {
            title: "model"
        },
    )
}

#[get("/capitube/api")]
pub async fn api<'a>(model: &'a State<Mutex<ModelState>>) -> Json<ModelState> {
    let model_ref = model.lock().await.clone();
    Json(model_ref)
}

#[get("/capitube/events")]
pub fn events<'a>(model: &'a State<Mutex<ModelState>>) -> EventStream![Event + 'a] {
    EventStream! {
        let mut delay = interval(Duration::from_millis(50));
        let mut blink_counter = 0;

        loop {
            blink_counter += 1;
            let (model_ref, reset_counter) = model.lock().await.clone().blink(blink_counter);
            if reset_counter { blink_counter = 0;}

            yield Event::json(&model_ref);
            delay.tick().await;
        }
    }
}

#[get("/capitube/config")]
pub async fn config_model(model: &State<Mutex<ModelState>>) -> Template {
    let _model_ref = model.lock().await.clone();

    Template::render(
        "config",
        context! {
            title: "configuration",
            link: format!("http://{}:{}/model", crate::get_link(), crate::PORT)
        },
    )
}

#[post("/capitube/model/post-update", data = "<req>")]
pub async fn update_model(req: Json<ModelState>, model: &State<Mutex<ModelState>>) {
    let mut model_ref = model.lock().await;

    model_ref.set_blink_config_from(&req);

    if !req.have_model() && model_ref.is_name_different(&req) {
        model_ref.reset();
        model_ref.change_model_from(&req);
        return;
    }
    model_ref.set_pose_from(&req);
}

#[post("/capitube/model/post-transform", data = "<req>")]
pub async fn update_transform(req: Json<Transform>, model: &State<Mutex<ModelState>>) {
    let mut model_ref = model.lock().await;
    model_ref.set_transform(&req);
}

#[post("/capitube/model/post-state", data = "<req>")]
pub async fn update_state(req: Json<MouthState>, model: &State<Mutex<ModelState>>) {
    let mut model_ref = model.lock().await;
    model_ref.set_state(&req);
}

#[get("/capitube/m/<modelname>/model.json")]
pub async fn get_model_config(modelname: String) -> Option<Json<ModelConfig>> {
    let content = match read_to_string(format!("models/{modelname}/model.json")) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[Error]: {}", e);
            return None;
        }
    };

    match json::from_str::<ModelConfig>(&content) {
        Ok(j) => return Some(Json(j)),
        Err(e) => {
            eprintln!("[Error]: {}", e);
            return None;
        }
    }
}
