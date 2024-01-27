import CONFIG from "../js_shared/config";
import { DRAWINGS } from "../js_shared/dict";
import Drawing from "./drawing";

export default class DrawingPicker
{
    drawings: Drawing[]

    constructor() {}
    get() { return this.drawings; }
    generate()
    {
        this.drawings = [];
        if(!CONFIG.includeDrawings) { return; }

        // @TODO: split out in case I ever want to add "advanced" drawings or another optional set or something
        const drawingsToInclude = Object.keys(DRAWINGS);
        for(const key of drawingsToInclude)
        {
            const newDrawing = new Drawing(key);
            this.drawings.push(newDrawing);
        }
    }
}