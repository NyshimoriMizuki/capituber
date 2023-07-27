/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

class Bar {
    x: number;
    y: number;
    width: number;
    height: number;
    colour: string;

    constructor(x: number, y: number, width: number, height: number, colour: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
    }

    update() { }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Sensor {
    sensorBar: Bar

    constructor(origin: [number, number], limit: [number, number], colour: string) {
        this.sensorBar = new Bar(origin[0], origin[1], limit[0], limit[1], colour);
    }

    width(): number {
        return this.sensorBar.width
    }
    height(): number {
        return this.sensorBar.height
    }

    update(process: (b: Bar) => void) {
        process(this.sensorBar)
    }

    draw(context: CanvasRenderingContext2D) {
        this.sensorBar.draw(context);
    }
}

export default Sensor;