/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/
export default class Microphone {
    constructor(fftSize, media) {
        this.initialized = false;
        this.dataArray = new Uint8Array([]);
        media.getUserMedia({ audio: true, video: false })
            .then(stream => {
            this.audioCtx = new AudioContext();
            this.microphone = this.audioCtx.createMediaStreamSource(stream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = fftSize;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.microphone.connect(this.analyser);
            this.initialized = true;
        })
            .catch(err => {
            alert(err.message);
        });
    }
    getSamples() {
        var _a;
        (_a = this.analyser) === null || _a === void 0 ? void 0 : _a.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }
    getVolume() {
        let total = 0;
        const sample = this.getSamples();
        const size = sample.length > 10 ? 10 : sample.length;
        sample.sort((a, b) => (a < b) ? 1 : -1)
            .slice(0, size)
            .forEach(i => {
            total += i;
        });
        return total / size;
    }
}
