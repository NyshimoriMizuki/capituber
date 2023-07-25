/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use futures::lock::Mutex;
use rocket::{
    response::stream::{Event, EventStream},
    serde::json::Json,
    tokio::time::{interval, Duration},
    State,
};
use rocket_dyn_templates::{context, Template};

use crate::model::ModelState;

#[get("/")]
pub fn home() -> String {
    "Home".to_owned()
}

#[get("/")]
pub fn model() -> Template {
    Template::render(
        "model",
        context! {
            title: "test"
        },
    )
}

#[get("/events")]
pub fn events<'a>(model: &'a State<Mutex<ModelState>>) -> EventStream![Event + 'a] {
    EventStream! {
        let mut delay = interval(Duration::from_millis(50));
        let mut blink_counter = 0;

        loop {
            blink_counter += 1;
            let (model_ref, reset_counter) = model.lock().await.clone().blink(blink_counter as u8);
            if reset_counter { blink_counter = 0;}

            yield Event::json(&model_ref);
            delay.tick().await;
        }
    }
}

#[get("/user-model")]
pub async fn config_model(model: &State<Mutex<ModelState>>) -> Json<ModelState> {
    let model_ref = model.lock().await.clone();
    Json(model_ref)
}

#[post("/user-model", data = "<req>")]
pub async fn update_model(req: Json<ModelState>, model: &State<Mutex<ModelState>>) {
    let mut model_ref = model.lock().await;

    if !req.get_model().is_empty() {
        model_ref.reset();
        model_ref.change_model(&req.get_model());
        return;
    }

    // state should contain only if is speaking or not (2 speaking, 0 not speak)
    let (pose, _state, position, transform) = req.unpack();
    model_ref.update(pose, position, &transform);
    model_ref.update_state(0);
}
