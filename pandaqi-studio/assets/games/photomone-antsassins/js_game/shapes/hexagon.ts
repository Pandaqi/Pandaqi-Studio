import Point from "./point"
import Helpers from "../tools/helpers"

export default class Hexagon 
{
    pos: Point;
    radius: number;
    edgePoints: Point[];
    team: string;
    type: string;
    action: string;
    gridPos: Point;
    hexRatio: number;

    constructor(pos, radius)
    {
        this.pos = pos;
        this.radius = radius;
        this.edgePoints = this.getPoints();
        this.team = null;
        this.type = null;
        this.action = null;
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
    
    getEdgePoints() { return this.edgePoints; }
    getPoints()
    {
        const a = 2 * Math.PI / 6;
        const r = this.radius;

        const arr = [];
        for (let i = 0; i < 6; i++) {
            const p = new Point(this.pos.x + r * Math.cos(a * i), this.pos.y + r * Math.sin(a * i))
            arr.push(p);
        }
        return arr;
    }

    getDistToNeighbour(resolution)
    {
        const offset = new Point(this.radius / resolution, this.hexRatio * this.radius / resolution);
        return offset.x;
    }

    getGridPoints(resolution)
    {
        const arr = [];
        const hexRatio = Math.sqrt(3)/2.0;
        const offset = new Point(this.radius / resolution, hexRatio * this.radius / resolution);
        const fullSize = this.radius*2;
        const numPoints = new Point(Math.round(fullSize/offset.x) + 1, Math.round( (fullSize/hexRatio)/offset.y ) - 1);

        const radiusY = hexRatio * this.radius;
        const start = new Point(this.pos.x - this.radius, this.pos.y - radiusY);
       
        const epsilon = 0.5;
        const epsilonEdge = 1.0;

        for(let x = 0; x < numPoints.x; x++)
        {
            for(let y = 0; y < numPoints.y; y++)
            {
                const extraOffsetX = (y % 2 == 1) ? 0.5*offset.x : 0;
                const realX = start.x + extraOffsetX + x*offset.x;
                const realY = start.y + y*offset.y;

                const p = new Point(realX, realY);
                const gridPoint = new Point(x,y);
                p.gridPos = gridPoint;
                if(!this.isInside(p, epsilon)) { continue; }

                const distToEdge = this.getDistToEdge(p);
                const onTheEdge = Math.abs(distToEdge) <= epsilonEdge;
                if(onTheEdge) 
                { 
                    p.setEdge(true); 
                    p.setLineIndex(this.getLineIndex(gridPoint, numPoints));
                }

                arr.push(p);
            }
        }

        Helpers.registerNeighbours(arr, offset.x);
        return arr;
    }

    getLineIndex(p, dims)
    {
        const horizontalEdge = p.y == 0 || p.y == (dims.y-2);
        const pointsHidden = 0.5*Math.floor(dims.x*0.5);
        if(horizontalEdge) 
        { 
            const relativeX = p.x - pointsHidden;
            return relativeX % Math.floor(0.5*dims.x);
        } 

        const center = Math.floor(0.5*(dims.y-1))
        const relativeY = p.y % center; // counting restarts at center line, after the bend
        return relativeY;
    }

    // @SOURCE: https://stackoverflow.com/questions/42903609/function-to-determine-if-point-is-inside-hexagon
    isInside(p, epsilon = 0.03)
    {
        const x = Math.abs(p.x - this.pos.x);
        const y = Math.abs(p.y - this.pos.y);
        const s = this.radius + epsilon;
        return y < (Math.sqrt(3) * Math.min(s - x, 0.5 * s));
    }

    getDistToEdge(p) { return Helpers.distToSetOfLines(p, this.edgePoints); }

    getNeighbors()
    {
        const p = this.gridPos
        const evenColumn = p.x % 2 == 0;
        if(evenColumn)
        {
            return [
                p.clone().move({ x: 1, y: 0 }), 
                p.clone().move({ x: 1, y: -1 }), 
                p.clone().move({ x: 1, y: -1 }), 
                p.clone().move({ x: -1, y: -1 }), 
                p.clone().move({ x: -1, y: 0 }), 
                p.clone().move({ x: 1, y: 1 }), 
            ];
        }

        return [
            p.clone().move({ x: 1, y: 1 }),
            p.clone().move({ x: 1, y: 0 }),
            p.clone().move({ x: 0, y: -1 }),
            p.clone().move({ x: -1, y: 0 }),
            p.clone().move({ x: -1, y: 1 }),
            p.clone().move({ x: 0, y: 1 }),
        ]
    }
}