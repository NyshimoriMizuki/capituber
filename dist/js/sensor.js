class Bar {
    constructor(x, y, width, height, colour) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
    }
    update() { }
    draw(context) {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
class Sensor {
    constructor(origin, limit, colour) {
        this.sensorBar = new Bar(origin[0], origin[1], limit[0], limit[1], colour);
    }
    width() {
        return this.sensorBar.width;
    }
    height() {
        return this.sensorBar.height;
    }
    update(process) {
        process(this.sensorBar);
    }
    draw(context) {
        this.sensorBar.draw(context);
    }
}
export default Sensor;