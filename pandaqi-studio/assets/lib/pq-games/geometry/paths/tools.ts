import type { Vector2 } from "../vector2";
import type { PathLike } from "../path";

export const pointListToPath2D = (points:Vector2[]) =>
{
    const path = new Path2D();
    for(const point of points)
    {
        path.lineTo(point.x, point.y);
    }
    return path;
}

export const pointListToPathString = (points:Vector2[], close = false) =>
{
    const newPoints = [];
    for(let i = 0; i < points.length; i++)
    {
        const prefix = (i == 0) ? "M" : "L";
        const point = points[i].x + "," + points[i].y;
        newPoints.push(`${prefix}${point}`);
    }
    if(close) { newPoints.push("Z"); }
    return newPoints.join(" ");
}

export const closePath = (path:PathLike) =>
{
    if(!Array.isArray(path)) { path = path.toPathArray(); }
    const firstPoint = path[0];
    const lastPoint = path[path.length - 1];
    if(firstPoint == lastPoint) { return path; }
    path.push(firstPoint);
    return path;
}

export const removeDuplicatesFromPath = (points:Vector2[]) => 
{
    const arr = [];
    for(let i = 1; i < points.length; i++)
    {
        if(points[i].matches(points[i-1])) { continue; }
        arr.push(points[i]);
    }
    return arr;
}

export const reversePath = (path:PathLike) =>
{
    if(Array.isArray(path)) { return path.slice().reverse(); }
    return path.toPathArray().reverse();
}

export const getFirstPathElement = (path:PathLike) => 
{ 
    if(Array.isArray(path)) { return path[0]; }
    if(Array.isArray(path.points)) { return path.points[0]; }
    return path.toPathArray()[0];
}
    
export const getLastPathElement = (path:PathLike) => 
{ 
    if(Array.isArray(path)) { return path[path.length-1]; }
    if(Array.isArray(path.points)) { return path.points[path.points.length-1]; }
    const pathElements = path.toPathArray();
    return pathElements[pathElements.length - 1];
}