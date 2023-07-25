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

    await update({
        model: "",
        pose: 0,
        state: 0,
        transform: {
            position: [...transform.position],
            scale: [...transform.scale],
            rotation: transform.rotation
        },
        blink_config: [0, 0]
    }).catch((err) => {
        // very common false positive error in my tests.
        if (err.toString().includes("unexpected end of data at line 1 column 1 of the JSON data"))
            return
        console.error(err)
    });
});

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    console.log({
        model: modelname.value,
        pose: pose.value,
        state: state.checked ? 2 : 1
    });
});

async function update(data) {
    const response = await fetch("http://localhost:1425/capitube/model/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response.json();
}

function useSensibility(input, sensibility) {
    return input * (1 + sensibility / 4)
}