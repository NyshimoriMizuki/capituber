const model = document.querySelector(".model");
const source = new EventSource("/capitube/events");

const modelConfig = fetch("http://localhost:1425/capitube/m/std/model.json")
    .then(async (response) => { return await response.json() })
    .catch((error) => {
        console.error(error);
    });

source.addEventListener("message", async (e) => {
    const data = JSON.parse(e.data);
    const expr = (await modelConfig).expressions;
    const currentFrame = expr[data.pose].frames[data.state];

    model.src = `m/${data.model}/${currentFrame}`;
    model.style.scale = `${data.transform.scale[0]}% ${data.transform.scale[1]}%`;
    model.style.left = `${data.transform.position[0]}px`;
    model.style.top = `${data.transform.position[1]}px`
    model.style.rotate = `${data.transform.rotation}deg`;
});