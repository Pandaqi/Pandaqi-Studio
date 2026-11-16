import { getSetting } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { DRAWINGS } from "../shared/dict";
import Drawing from "./drawing";

export const drawingPicker = () : Drawing[] =>
{
    const drawings = [];
    if(!getSetting("sets.includeDrawings", CONFIG)) { return; }

    const drawingsToInclude = Object.keys(DRAWINGS);
    for(const key of drawingsToInclude)
    {
        const newDrawing = new Drawing(key);
        drawings.push(newDrawing);
    }
    return drawings;
}