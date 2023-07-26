async function getModelConfig() {
    let response = await fetch("http://localhost:1425/capitube/m/std/model.json")
        .catch((error) => {
            console.error(error);
        });
    let data = await response.json();
};

export default { getModelConfig };