import type { Path } from "../path";
import { Vector2 } from "../vector2";
import { PathCommand, PointPath } from "./pointPath";
import { getFirstPathElement, getLastPathElement } from "./tools";

export const pointListToPathPoints = (points:Vector2[]|PointPath[]) : PointPath[] =>
{
    if(points.length <= 0) { return []; }
    if(points[0] instanceof PointPath) { return points as PointPath[]; }
    const arr = [];
    for(let i = 0; i < points.length; i++)
    {
        const command = (i == 0) ? PathCommand.START : PathCommand.LINE; 
        const p = new PointPath({ point: points[i] as Vector2, command: command });
        arr.push(p);
    }
    return arr;
}

export const mergePaths = (pathList:Path[]) : Vector2[] =>
{
    const arr = [];
    let prevPath:Path = null;
    for(const path of pathList)
    {
        let newPath = path.toPathArray();
        if(prevPath && getLastPathElement(prevPath) == getFirstPathElement(path)) { newPath.shift(); } // no duplicates
        arr.push(newPath);
        prevPath = path;
    }
    return arr.flat();
}