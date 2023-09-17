import Circle from "../circle";
import Path from "../paths/path";
import Point from "../point";
import Polygon from "../polygon";
import Rectangle from "../rectangle";
import Shape from "../shape";
import Triangle from "../triangle";

const triangleSign = (p1:Point, p2:Point, p3:Point) => 
{ 
    return (p1.x-p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

const pointIsInsideTriangle = (p:Point, triangle:Triangle, epsilon = 0.001) =>
{
    const points = triangle.points;
    const b1 = triangleSign(p, points[0], points[1]) <= epsilon;
    const b2 = triangleSign(p, points[1], points[2]) <= epsilon;
    const b3 = triangleSign(p, points[2], points[0]) <= epsilon;
    return (b1 == b2) && (b2 == b3);
}

const pointIsInsideRectangle = (p:Point, rect:Rectangle) =>
{
    const c = rect.center
    const e = rect.extents;
    return p.x >= (c.x - 0.5*e.x) && p.x <= (c.x + 0.5*e.x) && 
            p.y >= (c.y - 0.5*e.y) && p.y <= (c.y + 0.5*e.y)
}

const pointIsInsideHexagon = (p:Point, hexagon:Polygon, epsilon = 0.001) =>
{
    if(hexagon.corners != 6) { return console.error(hexagon, " is not a hexagon"); }

    const c = hexagon.center;
    const r = hexagon.radius;
    const x = Math.abs(p.x - c.x);
    const y = Math.abs(p.y - c.y);
    const s = r + epsilon;
    return y < (Math.sqrt(3) * Math.min(s - x, 0.5 * s));
}

const pointIsInsideCircle = (p:Point, circle:Circle) =>
{
    const c = circle.center;
    const r = circle.radius;
    return p.distSquaredTo(c) <= Math.pow(r, 2);
}

const pointIsInsidePolygon = (p:Point, poly:Shape) =>
{
    // @TODO: implement that standard algorithm for checking if point inside polygon
    return false
}

const pointIsInsideShape = (p:Point, shape:Shape) =>
{
    if(shape instanceof Circle) { return pointIsInsideCircle(p, shape); }
    else if(shape instanceof Rectangle) { return pointIsInsideRectangle(p, shape); }
    else if(shape instanceof Triangle) { return pointIsInsideTriangle(p, shape); }
    else if(shape instanceof Polygon || shape instanceof Path) 
    { 
        return pointIsInsidePolygon(p, shape);
    }
    return false;
}

export { pointIsInsideCircle, pointIsInsideRectangle, pointIsInsideTriangle, pointIsInsideHexagon, pointIsInsidePolygon, pointIsInsideShape }