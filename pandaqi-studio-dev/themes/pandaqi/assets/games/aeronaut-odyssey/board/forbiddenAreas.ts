import { Rectangle, Line, lineIntersectsShape, pointIsInsideRectangle, Vector2 } from "lib/pq-games";
import { CONFIG } from "./config";

export default class ForbiddenAreas
{
    rectangles: Rectangle[]

    constructor()
    {
        this.rectangles = [];
    }

    get() { return this.rectangles; }
    add(r:Rectangle)
    {
        this.rectangles.push(r);
    }

    lineIsInside(l:Line)
    {
        for(const rect of this.rectangles)
        {
            if(lineIntersectsShape(l, this.growRect(rect))) { return true; }
        }
        return false;
    }

    pointIsInside(p:Vector2)
    {
        for(const rect of this.rectangles)
        {
            if(pointIsInsideRectangle(p, this.growRect(rect))) { return true; }
        }
        return false;
    }

    growRect(rect:Rectangle)
    {
        const newRect = rect.clone(true);
        const factor = CONFIG.generation.forbiddenAreaGrowFactor.lerp(CONFIG.boardClarityNumber);
        newRect.grow(factor);
        return newRect;
    }

}