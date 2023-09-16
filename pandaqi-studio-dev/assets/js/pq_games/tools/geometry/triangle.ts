import Line from "./line";
import Point from "./point"
import Shape from "./shape";

interface TriangleParams
{
    edges?:Line[]
    points?:Point[]
}

// @TODO: this class is pretty useless if it just uses a set of points and behaves exactly like a polygon
// Instead, allow setting a base + extension + which direction the (pointy bit of the) triangle points
export { Triangle, TriangleParams }
export default class Triangle extends Shape
{
    edges: Line[]
    points: Point[]

    constructor(t:TriangleParams = {}) 
    {
        super()
        this.edges = t.edges ?? [];
    }

    toPath()
    {
        return [];
    }

    toSVG()
    {
        const elem = document.createElementNS(null, 'polygon');
        const points = [];
        for(const point of this.points)
        {
            points.push(point.x + "," + point.y);
        }

        const pointsString = points.join(" ");
        elem.setAttribute("points", pointsString);
        return elem;
    }
}