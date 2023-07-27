/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Microphone from "./microphone.js";
import Sensor from "./sensor.js";
const modelname = document.querySelector(".model-name");
const pose = document.querySelector(".pose");
const scaleText = document.querySelector(".scale");
const sensibility = document.querySelector(".sensibility");
const submitBtn = document.querySelector(".submit");
const sleep = (ms) => __awaiter(void 0, void 0, void 0, function* () { return new Promise(resolve => setTimeout(resolve, ms)); });
const getModelConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch("http://localhost:1425/capitube/m/std/model.json")
        .catch((error) => {
            console.error(error);
        });
    return yield response.json();
});
const clip = (x, min, max) => {
    x = Math.min(x, max);
    return Math.max(x, min);
};
const transform = {
    position: [0, 0],
    scale: [100, 100],
    rotation: 0
};
const steps = {
    angle: 5,
    move: 20,
    scale: 10
};
let scale = 100;
window.addEventListener("keydown", (e) => __awaiter(void 0, void 0, void 0, function* () {
    if (e.shiftKey && (e.key == "ArrowLeft" || e.key == "ArrowRight")) {
        const angle = e.key == "ArrowLeft" ? +steps.angle : -steps.angle;
        transform.rotation = transform.rotation % 360 + angle;
    }
    else if (e.key.includes("Arrow")) {
        e.preventDefault();
        steps.move = Math.round(1 + (parseInt(sensibility.value) | 1) / 3);
        const p = {
            "ArrowLeft": [-10 * steps.move, 0],
            "ArrowRight": [10 * steps.move, 0],
            "ArrowUp": [0, -10 * steps.move],
            "ArrowDown": [0, 10 * steps.move]
        };
        transform.position[0] += p[e.key][0];
        transform.position[1] += p[e.key][1];
    }
    else if (e.key == "+" || e.key == "-") {
        scale += e.key == "+" ? steps.scale : -steps.scale;
        scale = clip(scale, 1, 5000);
        if (e.shiftKey)
            transform.scale[0] = scale;
        else if (e.altKey)
            transform.scale[1] = scale;
        else {
            transform.scale = [scale, scale];
        }
        scaleText.innerHTML = `${transform.scale[0]}×${transform.scale[1]}`;
    }
    else
        return;
    yield update("post-transform", {
        position: transform.position,
        scale: transform.scale,
        rotation: transform.rotation
    });
}));
submitBtn.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const poseId = parseInt(pose.value) | 0;
    const expr = (yield getModelConfig()).expressions[poseId];
    yield update("post-update", {
        model: modelname.value,
        pose: poseId,
        state: 5,
        transform: {
            position: [0, 0],
            scale: [0, 0],
            rotation: 0
        },
        blink_config: expr.config.blink_tick
    });
}));
function update(name, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:1425/capitube/model/" + name, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        response.json()
            .catch((err) => {
                // very common false positive error in my tests.
                if (err.toString().includes("unexpected end of data at line 1 column 1 of the JSON data"))
                    return;
                console.error(err);
            });
    });
}
const mic = new Microphone(512);
const sensor = new Sensor([0, 0], [350, 20], "black");
const soundSlider = document.querySelector(".sound-slider");
const soundBar = document.querySelector(".sound-bar");
const bar_ctx = soundBar === null || soundBar === void 0 ? void 0 : soundBar.getContext("2d");
soundBar.height = sensor.height();
soundBar.width = sensor.width();
const sendMicrophoneInput = () => __awaiter(void 0, void 0, void 0, function* () {
    bar_ctx.clearRect(0, 0, soundBar.width, soundBar.height);
    if (mic.initialized) {
        const volumeHeight = Math.round(mic.getVolume() * soundBar.width / 255);
        sensor.update((bar) => {
            bar.y = 0;
            bar.width = volumeHeight;
        });
        sensor.draw(bar_ctx);
        yield update("post-state", {
            mouth_open: mic.getVolume() > parseInt(soundSlider.value),
        });
    }
    yield sleep(50);
    sendMicrophoneInput();
});
sendMicrophoneInput().then();
