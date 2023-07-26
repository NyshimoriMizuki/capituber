/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

const modelname = document.querySelector(".model-name");
const pose = document.querySelector(".pose");
const state = document.querySelector(".mouth-state");
const scaleText = document.querySelector(".scale");
const sensibility = document.querySelector(".sensibility");

const submitBtn = document.querySelector(".submit");

const transform = {
    position: [0, 0],
    scale: [100, 100],
    rotation: 0
};

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
}

let scale = 100;
const step = 10;

window.addEventListener("keydown", async e => {

    if (e.shiftKey && (e.key == "ArrowLeft" || e.key == "ArrowRight")) {
        let angle = e.key == "ArrowLeft" ? + 5 : -5;
        transform.rotation = transform.rotation % 360 + angle;

    } else if (e.key.includes("Arrow")) {
        e.preventDefault();
        e.preventDefault();

        let goodSensi = sensibility.value ? sensibility.value : 1;
        let step = Math.round(1 + goodSensi / 3);

        let p = {
            "ArrowLeft": [-10 * step, 0],
            "ArrowRight": [10 * step, 0],
            "ArrowUp": [0, -10 * step],
            "ArrowDown": [0, 10 * step]
        };

        transform.position[0] += p[e.key][0];
        transform.position[1] += p[e.key][1];

    } else if (e.key == "+" || e.key == "-") {
        scale += (e.key == "+" ? step : -step);
        scale = clip(scale, 1, 5000);

        if (e.shiftKey) transform.scale[0] = scale;
        else if (e.altKey) transform.scale[1] = scale;
        else {
            transform.scale[0] = scale;
            transform.scale[1] = scale;
        }
        scaleText.innerHTML = `${transform.scale[0]}×${transform.scale[1]}`;
    } else return

    await update("post-transform", {
        position: transform.position,
        scale: transform.scale,
        rotation: transform.rotation
    }).catch((err) => {
        // very common false positive error in my tests.
        if (err.toString().includes("unexpected end of data at line 1 column 1 of the JSON data"))
            return
        console.error(err)
    });
});

submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const poseId = parseInt(pose.value) ? parseInt(pose.value) : 0;

    const expr = (await getModelConfig()).expressions[poseId];

    await update("post-update", {
        model: modelname.value,
        pose: poseId,
        state: state.checked ? 2 : 0,
        transform: {
            position: [0, 0],
            scale: [0, 0],
            rotation: 0
        },
        blink_config: expr.config.blink_tick
    }).catch((err) => {
        // very common false positive error in my tests.
        if (err.toString().includes("unexpected end of data at line 1 column 1 of the JSON data"))
            return
        console.error(err)
    })
});

async function update(name, data) {
    const response = await fetch("http://localhost:1425/capitube/model/" + name, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response.json();
}