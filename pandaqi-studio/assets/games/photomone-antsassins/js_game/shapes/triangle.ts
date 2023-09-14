import Point from "./point"
import Helpers from "../tools/helpers"

export default class Triangle 
{
    pos: Point;
    radius: number;
    pointyTop: boolean;
    edgePoints: Point[];
    team: string;
    type: string;
    action: string;
    gridPos: Point;

    constructor(pos, radius, pointyTop)
    {
        this.pos = pos.clone();
        this.radius = radius;
        this.pointyTop = pointyTop;
        this.edgePoints = this.getPoints();
        this.team = null;
        this.type = null;
        this.action = null;
        this.center();
    }

    setGrid(p) { this.gridPos = p; }
    getCenter() { return this.pos; }
    setTeam(t) { this.team = t; }
    getTeam() { return this.team; }
    setType(t) { this.type = t; }
    getType(){ return this.type; }
    setAction(a) { this.action = a; }
    getAction(){ return this.action; }
    getBoundingBox()
    {
        const min = new Point(Infinity, Infinity);
        const max = new Point(-Infinity, -Infinity);
        for(const p of this.edgePoints)
        {
            min.x = Math.min(p.x, min.x);
            min.y = Math.min(p.y, min.y);
            max.x = Math.max(p.x, max.x);
            max.y = Math.max(p.y, max.y);
        }

        return { min: min, max: max, width: (max.x - min.x), height: (max.y - min.y) };
    }

    center()
    {
        const b = this.getBoundingBox();
        const wantedCenter = this.pos;
        const realCenter = new Point(0.5*(b.min.x + b.max.x), 0.5*(b.min.y + b.max.y));
        const offset = realCenter.vecTo(wantedCenter); 

        for(const p of this.edgePoints)
        {
            p.move(offset);
        }

        this.pos.move(offset);
    }

    getEdgePoints() { return this.edgePoints; }
    getPoints()
    {
        const a = 2 * Math.PI / 3;
        const angleOffset = this.pointyTop ? 1.5*Math.PI : 0.5*Math.PI;
        const arr = [];
        for(let i = 0; i < 3; i++)
        {
            const ang = angleOffset + a*i;
            const p = new Point(
                this.pos.x + this.radius * Math.cos(ang), 
                this.pos.y + this.radius * Math.sin(ang)
            );
            arr.push(p);
        }
        return arr;
    }

    getDistToNeighbour(resolution)
    {
        const b = this.getBoundingBox();
        const offset = new Point(b.width / resolution, b.height / resolution);
        return offset.x;
    }

    getGridPoints(resolution)
    {
        const b = this.getBoundingBox();
        const numPoints = new Point(resolution + 1, resolution + 1);
        const offset = new Point(b.width / resolution, b.height / resolution);
        const start = b.min;
       
        const arr = [];
        for(let x = 0; x < numPoints.x; x++)
        {
            for(let y = 0; y < numPoints.y; y++)
            {
                const extraOffsetX = (y % 2 == 1) ? 0.5*offset.x : 0;
                const realX = start.x + extraOffsetX + offset.x * x;
                const realY = start.y + offset.y * y;
                const p = new Point(realX, realY);
                const gridPoint = new Point(x,y);

                p.gridPos = gridPoint;
                const onEdge = this.isOnEdge(p);
                if(onEdge) 
                { 
                    p.setEdge(true); 
                    p.setLineIndex(this.getLineIndex(gridPoint, numPoints)) 
                }

                const isInside = this.isInside(p);
                if(!isInside && !onEdge) { continue; }

                arr.push(p);
            }
        }

        const maxDistToNeighbour = offset.x;
        Helpers.registerNeighbours(arr, maxDistToNeighbour);
        return arr;
    }

    getLineIndex(p, dims)
    {
        const topEdge = p.y == 0;
        const bottomEdge = p.y == (dims.y-1)
        if(topEdge && this.pointyTop) { return 0; }
        if(bottomEdge && !this.pointyTop) { return 0; }
        if(topEdge || bottomEdge)
        {
            return p.x % (dims.x - 1); 
        }

        return p.y % (dims.y - 1);
    }

    // @SOURCE (simplified): https://stackoverflow.com/questions/20248076/how-do-i-check-if-a-point-is-inside-a-triangle-on-the-line-is-ok-too
    sign(p1, p2, p3) { return (p1.x-p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y); }
    isInside(p, epsilon = 0.5)
    {
        const b1 = this.sign(p, this.edgePoints[0], this.edgePoints[1]) <= epsilon;
        const b2 = this.sign(p, this.edgePoints[1], this.edgePoints[2]) <= epsilon;
        const b3 = this.sign(p, this.edgePoints[2], this.edgePoints[0]) <= epsilon;
        return (b1 == b2) && (b2 == b3);
    }

    isOnEdge(p, epsilon = 0.5) { const dist = Math.abs(this.getDistToEdge(p)); return dist <= epsilon; }
    getDistToEdge(p) { return Helpers.distToSetOfLines(p, this.edgePoints); }

    getNeighbors()
    {
        const p = this.gridPos
        const nbs = [
            p.clone().move({ x: -1, y: 0 }),
            p.clone().move({ x: 1, y: 0 }),
        ]

        if(this.pointyTop) {
            nbs.push(p.clone().move({ x: 0, y: 1 }));
        } else {
            nbs.push(p.clone().move({ x: 0, y: -1 }));
        }

        return nbs;
    }
}