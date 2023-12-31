/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import Microphone from "./microphone.js";
import Sensor from "./sensor.js";

const modelname = document.querySelector<HTMLInputElement>(".model-name");
const pose = document.querySelector<HTMLInputElement>(".pose");
const scaleText = document.querySelector<HTMLDivElement>(".scale");
const sensibility = document.querySelector<HTMLInputElement>(".sensibility");

const submitBtn = document.querySelector(".submit");

const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getModelConfig = async () => {
    const response = await fetch("http://localhost:1425/capitube/m/std/model.json")
        .catch((error) => {
            console.error(error);
        }) as Response;
    return await response.json()
};

const clip = (x: number, min: number, max: number) => {
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

window.addEventListener("keydown", async (e) => {
    if (e.shiftKey && (e.key == "ArrowLeft" || e.key == "ArrowRight")) {
        const angle = e.key == "ArrowLeft" ? + steps.angle : -steps.angle;
        transform.rotation = transform.rotation % 360 + angle;

    } else if (e.key.includes("Arrow")) {
        e.preventDefault();
        steps.move = Math.round(1 + (parseInt(sensibility.value) | 1) / 3);
        const p = {
            "ArrowLeft": [-10 * steps.move, 0],
            "ArrowRight": [10 * steps.move, 0],
            "ArrowUp": [0, -10 * steps.move],
            "ArrowDown": [0, 10 * steps.move]
        };
        transform.position[0] += p[e.key as keyof typeof p][0];
        transform.position[1] += p[e.key as keyof typeof p][1];

    } else if (e.key == "+" || e.key == "-") {
        scale += e.key == "+" ? steps.scale : -steps.scale;
        scale = clip(scale, 1, 5000);

        if (e.shiftKey) transform.scale[0] = scale;
        else if (e.altKey) transform.scale[1] = scale;
        else {
            transform.scale = [scale, scale];
        }
        scaleText.innerHTML = `${transform.scale[0]}×${transform.scale[1]}`;
    } else return

    await update("post-transform", {
        position: transform.position,
        scale: transform.scale,
        rotation: transform.rotation
    });
});

submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const poseId = parseInt(pose.value) | 0;
    const expr = (await getModelConfig()).expressions[poseId];

    await update("post-update", {
        model: modelname.value,
        pose: poseId,
        state: 5,
        transform: {
            position: [0, 0],
            scale: [0, 0],
            rotation: 0
        },
        blink_config: expr.config.blink_tick
    })
});

async function update(name: string, data: object) {
    const response = await fetch("http://localhost:1425/capitube/model/" + name, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    response.json()
        .catch((err) => {
            // very common false positive error in my tests.
            if (err.toString().includes("unexpected end of data at line 1 column 1 of the JSON data"))
                return
            console.error(err)
        });
}

const mic = new Microphone(512, navigator.mediaDevices);
const sensor = new Sensor([0, 0], [350, 20], "black");
const soundSlider = document.querySelector<HTMLInputElement>(".sound-slider")!;
const soundBar = document.querySelector<HTMLCanvasElement>(".sound-bar")!;
const bar_ctx = soundBar?.getContext("2d")!;

soundBar.height = sensor.height();
soundSlider.style.width = sensor.width() + 'px';

const sendMicrophoneInput = async () => {
    bar_ctx.clearRect(0, 0, soundBar.width, soundBar.height);
    if (mic.initialized) {
        const volume = mic.getVolume();

        sensor.update((bar) => {
            bar.y = 0;
            bar.width = Math.round(volume * soundBar.width / 120);
        })
        sensor.draw(bar_ctx);

        await update("post-state", {
            mouth_open: volume > parseInt(soundSlider.value),
        });
    }

    await sleep(25);
    sendMicrophoneInput();
}

sendMicrophoneInput().then();