import { CONFIG } from "../shared/config";
import { DRAWINGS } from "../shared/dict";
import Drawing from "./drawing";

export const drawingPicker = () : Drawing[] =>
{
    const drawings = [];
    if(!CONFIG._settings.sets.includeDrawings.value) { return; }

    const drawingsToInclude = Object.keys(DRAWINGS);
    for(const key of drawingsToInclude)
    {
        const newDrawing = new Drawing(key);
        drawings.push(newDrawing);
    }
    return drawings;
}