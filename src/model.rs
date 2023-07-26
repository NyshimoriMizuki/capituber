/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use std::collections::HashMap;

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
    blink_config: Vec<u32>,
}

impl ModelState {
    pub fn get_model(&self) -> String {
        self.model.clone()
    }

    pub fn get_blink_config(&self) -> Vec<u32> {
        self.blink_config.clone()
    }

    pub fn get_pose(&self) -> u8 {
        self.pose.clone()
    }

    pub fn unpack(&self) -> (u8, u8, Vec<u32>, Transform) {
        (
            self.pose,
            self.state,
            self.blink_config.clone(),
            self.transform.clone(),
        )
    }

    pub fn set_transform(&mut self, transform: &Transform) {
        let (position, scale, rotation) = transform.unpack();

        self.transform.positionate(position[0], position[1]);
        self.transform.scale(scale[0], scale[1]);
        self.transform.rotate(rotation);
    }

    pub fn set_state(&mut self, state: u8) {
        self.state = state;
    }

    pub fn set_pose(&mut self, pose_id: u8) {
        self.pose = pose_id;
    }

    pub fn set_blink_config(&mut self, config: Vec<u32>) {
        self.blink_config = config;
    }

    pub fn change_model(&mut self, model: &str) {
        self.model = model.to_string();
    }

    pub fn blink(&mut self, blink_counter: u32) -> (ModelState, bool) {
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
        // response.set_header(Header::new("x-frame-options", format!("ALLOW-FROM {link}")));
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct ModelConfig {
    name: String,
    about: HashMap<String, String>,
    expressions: Vec<Expressions>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Expressions {
    config: ExpressionsConfig,
    frames: [String; 4],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct ExpressionsConfig {
    idle_vibration: u8,
    talk_vibration: u8,
    blink_tick: [u32; 2],
    hotkey: String,
}
