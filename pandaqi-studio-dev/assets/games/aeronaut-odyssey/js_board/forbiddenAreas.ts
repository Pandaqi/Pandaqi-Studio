import lineIntersectsShape from "js/pq_games/tools/geometry/intersection/lineIntersectsShape";
import { pointIsInsideRectangle } from "js/pq_games/tools/geometry/intersection/pointInsideShape";
import Line from "js/pq_games/tools/geometry/line";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import CONFIG from "./config";

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

    pointIsInside(p:Point)
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
        newRect.grow(CONFIG.generation.forbiddenAreaGrowFactor);
        return newRect;
    }

}