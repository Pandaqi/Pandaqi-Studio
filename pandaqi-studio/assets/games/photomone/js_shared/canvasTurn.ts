import CanvasPowerups from "./canvasPowerups";
import CanvasDrawable from "./canvasDrawable";
import Line from "./line";

export default class CanvasTurn {
    canvasDrawable: CanvasDrawable;
    lines: Line[];
    powerups: CanvasPowerups;

    constructor(canvasDrawable: CanvasDrawable)
    {
        this.canvasDrawable = canvasDrawable;
        this.lines = [];
        this.powerups = new CanvasPowerups(canvasDrawable);
    }

    getLines() { return this.lines; }
    addLine(l: Line) { 
        this.lines.push(l); 
        this.powerups.registerLine(l);
    }
    clear() { this.lines = []; }
    reset() { this.lines = []; this.powerups.reset(); }
    count() { return this.lines.length; }
    getPowerups() { return this.powerups; }
}
