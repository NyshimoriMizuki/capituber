/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

#[macro_use]
extern crate rocket;

use std::net::IpAddr;

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

pub(crate) const ADDRESS: &'static str = "0.0.0.0";
pub(crate) const PORT: u16 = 1425;

pub(crate) fn get_link() -> IpAddr {
    match local_ip() {
        Ok(i) => i,
        Err(e) => {
            println!("Failed to get local ip");
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

#[launch]
fn rocket() -> _ {
    let ip = get_link();

    println!(" —— [Launching CapiTube-web] —— ");
    println!("Open the link in browser to play with CapiTube!");
    println!("link 1: [ http://localhost:{PORT} ]");
    println!("link 2: [ http://{ip}:{PORT} ]\n");
    println!("(link 2 cannot access the microphone, be cause it requires a https)");

    println!("You dont need to really care about the logs that here\nin the terminal.\n");

    let config = Config::figment()
        .merge(("address", ADDRESS))
        .merge(("port", PORT));

    rocket::build()
        .configure(config)
        .attach(model::ModelState::fairing(PORT))
        .attach(Template::fairing())
        .manage(Mutex::new(model::ModelState::default()))
        .mount("/", routes![routes::home])
        .mount("/", routes![routes::model])
        .mount(
            "/",
            routes![
                routes::config_model,
                routes::update_model,
                routes::update_transform,
                routes::update_state,
                routes::events,
                routes::api,
                routes::get_model_config
            ],
        )
        .mount("/d", FileServer::from(relative!("dist/")))
        .mount("/m", FileServer::from(relative!("models/")))
}
