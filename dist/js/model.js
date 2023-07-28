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
const model = document.querySelector(".model");
const source = new EventSource("/capitube/events");
const modelConfig = fetch("http://localhost:1425/capitube/m/std/model.json")
    .then((response) => __awaiter(this, void 0, void 0, function* () { return yield response.json(); }))
    .catch((error) => {
    console.error(error);
});
source.addEventListener("message", (e) => __awaiter(this, void 0, void 0, function* () {
    const data = JSON.parse(e.data);
    const expr = (yield modelConfig).expressions;
    const currentFrame = expr[data.pose].frames[data.state];
    model.src = `m/${data.model}/${currentFrame}`;
    model.style.scale = `${data.transform.scale[0]}% ${data.transform.scale[1]}%`;
    model.style.left = `${data.transform.position[0]}px`;
    model.style.top = `${data.transform.position[1]}px`;
    model.style.rotate = `${data.transform.rotation}deg`;
}));
