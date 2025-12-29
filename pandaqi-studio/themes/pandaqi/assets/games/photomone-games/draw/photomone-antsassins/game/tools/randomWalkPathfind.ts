import Vector2 from "../shapes/point"
import Line from "../shapes/line"
import { shuffle, rangeInteger } from "lib/pq-games";
import Point from "../shapes/point";

export default class RandomWalkPathfind 
{
    points: Vector2[];
    failed: boolean;
    halved: boolean;
    tooLong: boolean;
    // @TODO
    pathfinder: PathFinder;
    dotsBetween: any[];
    hairs: any[];
    shapesAttached: any[];

    constructor(config, points)
    {
        this.points = [];
        this.failed = false;
        this.halved = false;
        this.tooLong = false;
        this.pathfinder = new PathFinder();
        this.dotsBetween = [];
        this.hairs = [];
        this.shapesAttached = [];

        this.generate(config, points);
        if(this.hasFailed()) { return; }

        this.addDotsBetween(config);
        this.addHairs(config);
        this.addShapesAttached(config);
    }

    getLength() { return this.points.length; }
    getPoints() { return this.points; }
    getHairs() { return this.hairs; }
    getDotsBetween() { return this.dotsBetween; }
    getShapesAttached() { return this.shapesAttached; }
    hasFailed() { return this.failed; }
    wasHalved() { return this.halved; }
    getStart() { return this.points[0]; }
    getEnd() { return this.points[this.points.length - 1]; }
    generate(config, points)
    {
        const options = this.getPossibleEndPoints(config, points);
        shuffle(options);
        let start = options.pop();
        let end = options.pop();

        if(config.randomWalk.forcedExtremes)
        {
            start = config.randomWalk.forcedExtremes.start || start;
            end = config.randomWalk.forcedExtremes.end || end;
        }

        let costMap = null;
        if(config.randomWalk.useSharedCostMap) {
            costMap = config.randomWalk.costMap
        } else {
            costMap = this.pathfinder.assignRandomWeights({ points: Vector2s });
        }
        
        const forbiddenPoints = this.getForbiddenEdgePoints(config, points);
        const forbiddenLines = this.getForbiddenLines(config, points);
        const pathfindConfig = {
            costMap: costMap,
            forbiddenPoints: forbiddenPoints,
            forbiddenLines: forbiddenLines,
            connectionFunction: (point) => { return point.getNeighbors() }
        }
        this.pathfinder.setConfig(pathfindConfig);

        const params = { start: start, end: end }
        const path = this.pathfinder.getPath(params) as Point[];
        this.points = path;

        const noValidPath = !path;
        if(noValidPath) { this.failed = true; return; }

        const halfLineProbability = config.randomWalk.enhancements_v2.halfLineProbability;
        if(config.randomWalk.enhancements_v2.halfLines)
        {
            const halfLine = Math.random() <= halfLineProbability;
            if(halfLine) { this.cutInHalf(); }
        }

        this.tooLong = path.length > config.randomWalk.maxLength;
        if(this.tooLong) { this.failed = true; return; }

        for(let i = 0; i < path.length-1; i++)
        {
            const p1 = path[i];
            const p2 = path[i+1];
            p1.addConnection(p2);
            p2.addConnection(p1);
        }
    }

    cutInHalf()
    {
        const cutStart = Math.random() <= 0.5;
        const halfIndex = Math.floor(0.5*this.points.length);
        if(cutStart) { this.points.splice(halfIndex); }
        else { this.points.splice(0, halfIndex); }
        this.halved = true;
    }

    getForbiddenLines(config, points)
    {
        const list = [];
        for(const p of points)
        {
            for(const conn of p.getConnections())
            {
                const id = this.pathfinder.getConnectionID(p, conn);
                list.push(id)
            }
        }
        return list;
    }

    getForbiddenEdgePoints(config, points)
    {
        const list = [];

        // complete edge walks allow ONLY all edge points, nothing else
        if(config.randomWalk.completeEdgeWalk)
        {
            for(const p of points)
            {
                if(p.isOnEdge()) { continue; }
                list.push(p);
            }
            return list;
        }

        for(const p of points)
        {
            if(!p.isOnEdge()) { continue; }
            if(p.getLineIndex() == config.randomWalk.targetLineIndex) { continue; }
            list.push(p);
        }
        return list;
    }

    getPossibleEndPoints(config, points)
    {
        const list = [];
        for(const p of points)
        {
            if(!p.isOnEdge()) { continue; }
            if(p.getLineIndex() != config.randomWalk.targetLineIndex) { continue; }
            list.push(p)
        }
        return list;
    }

    getRandomPoint()
    {
        return this.points[Math.floor(Math.random() * this.points.length)];
    }

    getRandomLine()
    {
        const index = Math.floor(Math.random() * (this.points.length - 1));
        const p1 = this.points[index];
        const p2 = this.points[index+1];
        return new Line(p1, p2);
    }

    getRandomBetweenAngle(config)
    {
        const angles = config.tileShape == "rectangle" ? 4 : 6;
        const deltaAngle = (2*Math.PI) / angles;
        const offsetAngle = config.tileShape == "rectangle" ? 0.25*Math.PI : 0;
        return offsetAngle + deltaAngle * Math.floor(Math.random() * angles); 
    }

    addDotsBetween(config)
    {
        if(!config.randomWalk.enhancements_v2.dotsBetween) { return; }

        const bounds = config.randomWalk.enhancements_v2.dotsBetweenBounds;
        const numDots = rangeInteger(bounds.min, bounds.max);

        for(let i = 0; i < numDots; i++)
        {
            const p = this.getRandomPoint();
            const ang = this.getRandomBetweenAngle(config);
            const dist = 0.5 * config.randomWalk.dotsBetweenDist;
            const offset = new Vector2(
                Math.cos(ang) * dist,
                Math.sin(ang) * dist
            )

            const pos = p.clone().add(offset);
            this.dotsBetween.push(pos);
        }
    }

    addHairs(config)
    {
        if(!config.randomWalk.enhancements_v2.hairs) { return; }

        const bounds = config.randomWalk.enhancements_v2.hairBounds;
        const numHairs = rangeInteger(bounds.min, bounds.max);
        for(let i = 0; i < numHairs; i++)
        {
            const p = this.getRandomPoint();
            const nb = p.getRandomNeighbour();
            const alreadyConnected = p.isConnectedTo(nb);
            if(alreadyConnected) { continue; }

            p.addConnection(nb);
            nb.addConnection(p);

            const line = new Line(p, nb);
            this.hairs.push(line);
        }
    }

    addShapesAttached(config)
    {
        if(!config.randomWalk.enhancements_v2.shapesAttached) { return; }

        const shapeTypes = config.randomWalk.enhancements_v2.shapeTypes;
        const shapeBounds = config.randomWalk.enhancements_v2.shapeBounds;
        const numShapes = rangeInteger(shapeBounds.min, shapeBounds.max);
        for(let i = 0; i < numShapes; i++)
        {
            const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            const obj = { type: type, pos: null, angleStart: 0, angleEnd: 0, points: [] }
            const l = this.getRandomLine();
            if(!l.start || !l.end) { continue; }

            if(type == "circle") {
                obj.pos = l.center();
                obj.angleStart = l.angle();
                obj.angleEnd = obj.angleStart + Math.PI;
            } else if(type == "triangle") {
                const params = { dist: 1, anchor: l.start }
                const p2 = l.end.getRandomNeighbourGrid(params);
                if(!p2) { continue; }
                obj.points = [l.start, l.end, p2, l.start];
            } else if(type == "rectangle") {
                const params = { dist: 1, anchor: l.start }
                const p2 = l.end.getRandomNeighbourGrid(params);
                if(!p2) { continue; }

                if(config.tileShape != "rectangle") { params.dist = 2; }
                const p3 = p2.getRandomNeighbourGrid(params);
                if(!p3) { continue; }
                obj.points = [l.start, l.end, p2, p3, l.start];
            }

            this.shapesAttached.push(obj);
        }
    }
}