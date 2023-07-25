/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use crate::transform::Transform;
use rocket::{
    fairing::{Fairing, Info, Kind},
    http::Header,
    serde::{Deserialize, Serialize},
    Request, Response,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct ModelState {
    model: String,
    pose: u8,
    state: u8,
    transform: Transform,
    blink_config: Vec<u8>,
}

impl ModelState {
    pub fn get_model(&self) -> String {
        self.model.clone()
    }

    pub fn unpack(&self) -> (u8, u8, Vec<u8>, Transform) {
        (
            self.pose,
            self.state,
            self.blink_config.clone(),
            self.transform.clone(),
        )
    }

    pub fn update(&mut self, pose: u8, blink_config: Vec<u8>, transform: &Transform) {
        self.pose = pose;
        self.blink_config = blink_config;
        self.transform = transform.clone();
    }

    pub fn update_state(&mut self, state: u8) {
        self.state = state;
    }

    pub fn change_model(&mut self, model: &str) {
        self.model = model.to_string();
    }

    pub fn blink(&mut self, blink_counter: u8) -> (ModelState, bool) {
        if blink_counter < self.blink_config[1] {
            self.state += 1;
        }
        (self.clone(), blink_counter >= self.blink_config[0])
    }

    pub fn reset(&mut self) {
        self.pose = ModelState::default().pose;
        self.state = ModelState::default().state;
        self.transform = ModelState::default().transform;
        self.blink_config = ModelState::default().blink_config;
    }

    pub fn fairing(port: u16) -> ModelFairing {
        println!("{}", port);
        ModelFairing { port }
    }
}

impl Default for ModelState {
    fn default() -> Self {
        Self {
            model: String::from("std"),
            pose: 0,
            state: 0,
            transform: Transform::default(),
            blink_config: vec![25, 5],
        }
    }
}

pub struct ModelFairing {
    port: u16,
}

#[rocket::async_trait]
impl Fairing for ModelFairing {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS response headers to ModelState",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        let allowed_methods = vec!["GET", "POST"].join(", ");
        let link = format!("http://localhost:{}", self.port);

        response.set_header(Header::new("Access-Control-Allow-Origin", link.clone()));
        response.set_header(Header::new("Access-Control-Allow-Methods", allowed_methods));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("x-frame-options", format!("ALLOW-FROM {link}")));
    }
}
