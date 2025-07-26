import isBetween from "../../numbers/isBetween";
import isZero from "../../numbers/isZero";
import Line from "../line";
import Point from "../point";

const getLineIntersectionFromPoints = (a:Point, b:Point, x:Point, y:Point) =>
{
    return getLineIntersection(new Line(a,b), new Line(x,y));
}

const getLineIntersectionFromVectors = (a:Point, b:Point) =>
{
    return getLineIntersection(new Line(new Point(), a), new Line(new Point(), b));
}

const getLineIntersection = (a:Line, b:Line) =>
{
    const vec1 = a.vector();
    const vec2 = b.vector();
    var rxs = vec1.cross(vec2);
    var qminp = a.start.clone().sub(b.start);
    var qpxr = qminp.cross(vec1);

    if(isZero(rxs)) { return null; }

    const t = qminp.cross(vec2) / rxs;
    const u = qminp.cross(vec1) / rxs;

    if(!isZero(rxs) && isBetween(t, 0, 1) && isBetween(u, 0, 1))
    {
        return a.start.clone().add( vec1.scaleFactor(t) );
    }

    return null;
}

export { getLineIntersectionFromPoints, getLineIntersection, getLineIntersectionFromVectors }