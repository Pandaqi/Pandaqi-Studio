import Point from "./point"
import Helpers from "../tools/helpers"

export default class Rectangle {
    constructor(pos, extents)
    {
        this.pos = pos;
        this.extents = extents;
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
        const a = 2 * Math.PI / 4;
        const arr = [];
        const diagonalSize = this.extents.length();

        for(let i = 0; i < 4; i++)
        {
            const ang = i * a + 0.25 * Math.PI;
            const p = new Point(
                this.pos.x + 0.5 * diagonalSize * Math.cos(ang), 
                this.pos.y + 0.5 * diagonalSize * Math.sin(ang)
            );
            arr.push(p);
        }
        return arr;
    }

    getDistToNeighbour(resolution)
    {
        const numPoints = new Point(1 + resolution, 1 + resolution);
        const offset = new Point(this.extents.x / (numPoints.x - 1), this.extents.y / (numPoints.y - 1));
        return offset.length();
    }

    getGridPoints(resolution)
    {
        const numPoints = new Point(1 + resolution, 1 + resolution);
        const offset = new Point(this.extents.x / (numPoints.x - 1), this.extents.y / (numPoints.y - 1));
        const start = new Point(this.pos.x - 0.5*this.extents.x, this.pos.y - 0.5*this.extents.y);

        const arr = [];
        for(let x = 0; x < numPoints.x; x++)
        {
            for(let y = 0; y < numPoints.y; y++)
            {
                const realX = start.x + offset.x * x;
                const realY = start.y + offset.y * y;
                const gridPoint = new Point(x,y);
                const p = new Point(realX, realY);
                p.gridPos = gridPoint;
                arr.push(p);
                if(this.isOnEdge(gridPoint, numPoints)) { p.setEdge(true); }
                p.setLineIndex(this.getLineIndex(gridPoint, numPoints));
            }
        }

        const maxDistForNeighbour = offset.length();
        Helpers.registerNeighbours(arr, maxDistForNeighbour);
        return arr;
    }

    isOnEdge(p, dims)
    {
        return (p.x == 0 || p.x == (dims.x-1) || p.y == 0 || p.y == (dims.y-1));
    }

    getLineIndex(p, dims)
    {
        const horizontalEdge = p.y == 0 || p.y == (dims.y-1);
        if(horizontalEdge) { return p.x % (dims.x-1); }

        const verticalEdge = p.x == 0 || p.x == (dims.x-1);
        if(verticalEdge) { return p.y % (dims.y-1); }

        return -1;
    }

    isInside(p)
    {
        return p.x >= this.pos.x - 0.5*this.extents.x &&
               p.x <= this.pos.x + 0.5*this.extents.x &&
               p.y >= this.pos.y - 0.5*this.extents.y &&
               p.y <= this.pos.y + 0.5*this.extents.y
    }

    getNeighbors()
    {
        const p = this.gridPos
        return [
            p.clone().move({ x: -1, y: 0 }),
            p.clone().move({ x: 1, y: 0 }),
            p.clone().move({ x: 0, y: -1 }),
            p.clone().move({ x: 0, y: 1 })
        ]
    }
}