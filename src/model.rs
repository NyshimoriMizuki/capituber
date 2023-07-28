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
    pub fn set_pose_from(&mut self, model: &ModelState) {
        if model.pose != self.pose {
            self.pose = model.pose.clone();
        }
    }

    pub fn set_blink_config_from(&mut self, model: &ModelState) {
        if model.blink_config != self.blink_config {
            self.blink_config = model.blink_config.clone();
        }
    }

    pub fn set_transform(&mut self, transform: &Transform) {
        let (position, scale, rotation) = transform.unpack();

        self.transform.positionate(position[0], position[1]);
        self.transform.scale(scale[0], scale[1]);
        self.transform.rotate(rotation);
    }

    pub fn set_state(&mut self, mouth_state: &MouthState) {
        if mouth_state.is_open() {
            self.state = 2;
        } else {
            self.state = 0;
        }
    }

    pub fn change_model_from(&mut self, model: &ModelState) {
        self.model = model.model.clone();
    }

    pub fn have_model(&self) -> bool {
        self.model.is_empty()
    }

    pub fn is_name_different(&self, model: &ModelState) -> bool {
        self.model != model.model
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

        let link = format!("http://{}:{}", crate::get_link(), self.port);

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

#[derive(Debug, Clone, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct MouthState {
    mouth_open: bool,
}

impl MouthState {
    pub fn is_open(&self) -> bool {
        self.mouth_open
    }
}
