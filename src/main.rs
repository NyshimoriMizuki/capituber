/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

#[macro_use]
extern crate rocket;

use futures::lock::Mutex;

use rocket::{
    config::Config,
    fs::{relative, FileServer},
};

use rocket_dyn_templates::Template;

use local_ip_address::local_ip;

mod model;
mod routes;
mod transform;

const ADDRESS: &'static str = "127.0.0.1";
const PORT: u16 = 6000;

#[launch]
fn rocket() -> _ {
    let ip = match local_ip() {
        Ok(i) => i,
        Err(e) => {
            println!("Failed to get local ip");
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    };

    println!("Launching CapiTube-web");
    println!("Open [ http://{ip}:{PORT} ] in the browser to play with CapiTube!\n",);

    let config = Config::figment()
        .merge(("address", ADDRESS))
        .merge(("port", PORT));

    rocket::build()
        .configure(config)
        .attach(model::ModelState::fairing(PORT))
        .attach(Template::fairing())
        .manage(Mutex::new(model::ModelState::default()))
        .mount("/", FileServer::from(relative!("client/dist")))
        .mount("/", FileServer::from(relative!("../models")))
        .mount("/", routes![routes::home])
        .mount("/capitube", routes![routes::model, routes::events])
        .mount("/api", routes![routes::config_model, routes::update_model])
}
