import CanvasPowerups from "./canvasPowerups";

export default class CanvasTurn {
    constructor(canvasDrawable)
    {
        this.canvasDrawable = canvasDrawable;
        this.lines = [];
        this.powerups = new CanvasPowerups(canvasDrawable);
    }

    getLines() { return this.lines; }
    addLine(l) { 
        this.lines.push(l); 
        this.powerups.registerLine(l);
    }
    clear() { this.lines = []; }
    reset() { this.lines = []; this.powerups.reset(); }
    count() { return this.lines.length; }
    getPowerups() { return this.powerups; }
}
