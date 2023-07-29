extern crate winresource;

fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").unwrap() == "windows" {
        let win = winresource::WindowsResource::new();

        // win.set_icon("assets/icon/icon.ico");
        win.compile().unwrap();
    }
}
