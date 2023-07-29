/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

export default class Microphone {
    initialized: boolean;
    audioCtx: AudioContext | undefined;
    microphone: MediaStreamAudioSourceNode | undefined;
    analyser: AnalyserNode | undefined;
    dataArray: Uint8Array;

    constructor(fftSize: number, media: MediaDevices) {
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


    getSamples(): Uint8Array {
        this.analyser?.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    getVolume(): number {
        let sum = 0;
        for (const amplitude of this.getSamples()) {
            sum += amplitude ** 2;
        }
        return Math.sqrt(sum / this.dataArray.length);
    }
}