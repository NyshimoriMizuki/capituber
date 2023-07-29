# CapiTuber
CapiTuber is a lite PNGtuber app inspirend on [VeadoTube](https://veado.tube), but with a lot more features.

***

## Features
For now, CapiTube will by inplemented, but the features that it will certainly have are:

1. Real-time Reactive PNGmodel
2. Shared output
3. Very lite and fast

## Associated repositories
 - [CapiTube (old)](https://github.com/NyshimoriMizuki/capitube-web)
 - [Capitube-Tests](https://github.com/NyshimoriMizuki/capitube-tests)

## Compile by yourself.
If you want to compile the CapiTube yourself, you will need:
 - [Node.js](https://nodejs.org/en)
 - [RustLang](https://www.rust-lang.org/)

After you install all the prerequisites, to compile you will this commands on the terminal:
 - `cd client` and ` npm run build` to build the client code.
 - `cargo build --release` at the root directory will compile as release. The binaries will be in `/target/release`.
 
***
## Current To-do list:
- [x] Configure model (with files)
    - [x] Set frames
    - [x] Set expression
    - [x] Change model
- [x] Working PNG model
    - [x] Model frames load
    - [x] Change on user talking
    - [x] Sync OBS and Config sides
- [ ] Front-end Layout
    - [ ] Configure side layout
        - [ ] Model configuration (with front-end)
        - [ ] Settings menu
    - [ ] OBS font layout


***

## License
CapiTube is under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/), you can read some FAQs at [MPL 2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)

You are free to:
 - Study the CapiTube code
 - Modify the code
 - Distribute CapiTube
 - Distribute changed versions of CapiTube

A important point, you are free to do any of this things **if you comply with the Mozilla Public License**, I recommend you to read at least the FAQs if you want to do something bisides using.