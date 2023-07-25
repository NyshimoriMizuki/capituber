/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

use rocket::serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Transform {
    position: [i32; 2],
    scale: [u8; 2],
    rotation: f32,
}

#[allow(dead_code)]
impl Transform {
    pub fn positionate(&mut self, x: i32, y: i32) {
        self.position[0] = x;
        self.position[1] = y;
    }

    pub fn scale(&mut self, x: u8, y: u8) {
        self.scale[0] = x;
        self.scale[1] = y;
    }

    pub fn rotate(&mut self, angle: f32) {
        self.rotation = angle;
    }
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: [0, 0],
            scale: [100, 100],
            rotation: 0.,
        }
    }
}
