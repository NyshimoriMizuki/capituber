/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import test from "./utilities.js";

test.test("texto")

const modelname = document.querySelector(".model-name");
const pose = document.querySelector(".pose");
const state = document.querySelector(".mouth-state");
const scaleText = document.querySelector(".scale");
const sensibility = document.querySelector(".sensibility");

const submitBtn = document.querySelector(".submit");

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getModelConfig = async () => {
    const response = await fetch("http://localhost:1425/capitube/m/std/model.json")
        .catch((error) => {
            console.error(error);
        });
    return await response.json()
};

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

window.addEventListener("keydown", async (e) => {
    if (e.shiftKey && (e.key == "ArrowLeft" || e.key == "ArrowRight")) {
        const angle = e.key == "ArrowLeft" ? + steps.angle : -steps.angle;
        transform.rotation = transform.rotation % 360 + angle;

    } else if (e.key.includes("Arrow")) {
        e.preventDefault();
        steps.move = Math.round(1 + (sensibility.value | 1) / 3);
        const p = {
            "ArrowLeft": [-10 * steps.move, 0],
            "ArrowRight": [10 * steps.move, 0],
            "ArrowUp": [0, -10 * steps.move],
            "ArrowDown": [0, 10 * steps.move]
        };
        transform.position[0] += p[e.key][0];
        transform.position[1] += p[e.key][1];

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

async function update(name, data) {
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


const sendMicrophoneInput = async () => {
    console.log('Testing');

    await sleep(1000);
    sendMicrophoneInput();
}

//sendMicrophoneInput().then();