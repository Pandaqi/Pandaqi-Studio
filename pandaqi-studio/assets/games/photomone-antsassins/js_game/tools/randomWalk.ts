import Random from "js/pq_games/tools/random/main"

export default class RandomWalk 
{
    points: any[];
    numIntersections: number;
    numEdgePoints: number;
    maxIntersections: number;
    closedShape: boolean;
    failed: boolean;

    constructor(config, points)
    {
        this.points = [];
        this.numIntersections = 0;
        this.numEdgePoints = 0;
        this.maxIntersections = config.randomWalk.maxIntersections;
        this.closedShape = false;
        this.failed = false;
        this.pickRandomStartingPoint(config, points);
        this.generate(config);
        if(this.failed) { this.undo(); }
    }

    undo()
    {
        if(this.hasNoPoints()) { return; }
        for(let i = 0; i < this.points.length-1; i++)
        {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            p1.removeConnection(p2);
            p2.removeConnection(p1);
        }

        this.points = [];
    }

    hasFailed() { return this.failed; }
    fail() { this.failed = true; }
    hasNoPoints() { return this.countPoints() <= 0; }
    getPoints() { return this.points; }
    countPoints() { return this.points.length; }
    getLength() { return (this.points.length - 1); } // it's LINES, not POINTS, hence -1
    getFirstPoint() { if(this.points.length <= 0) { return null; } return this.points[0]; }
    getLastPoint() 
    { 
        if(this.points.length <= 0) { return null; } 
        return this.points[this.points.length - 1]; 
    }
    getLastAngle() 
    { 
        if(this.points.length < 2) { return null; }
        const p1 = this.getLastPoint();
        const p2 = this.points[this.points.length - 2];
        return Math.atan2(p2.y - p1.y, p2.x - p1.x)
    }

    addPoint(p) 
    { 
        const lastPoint = this.getLastPoint();
        this.points.push(p);

        if(p.hasConnections()) { this.numIntersections++; }
        if(p.isOnEdge()) { this.numEdgePoints++; }
        
        if(!lastPoint) { return; }        
        lastPoint.addConnection(p);
        p.addConnection(lastPoint);
    }

    pickRandomStartingPoint(config, points)
    {
        if(config.randomWalk.simple)
        {
            const p = points[Math.floor(Math.random() * points.length)];
            this.addPoint(p);
            return true;
        }

        let validStartingPoints = points;
        validStartingPoints = this.checkBoundedArea(config, validStartingPoints);
        validStartingPoints = this.checkForceStart(config, validStartingPoints);
        validStartingPoints = this.checkMaxConnections(config, validStartingPoints);

        const requireNonEmptyPoint = Math.random() <= config.randomWalk.startOnNonEmptyPointProb;
        validStartingPoints = this.removeEmptyPoints(validStartingPoints, requireNonEmptyPoint);
        
        if(validStartingPoints.length <= 0) { return false; }
        const p = validStartingPoints[Math.floor(Math.random() * validStartingPoints.length)];
        this.addPoint(p);
        return true;
    }

    generate(config)
    {
        if(this.hasNoPoints()) { return this.fail(); }

        let min = config.randomWalk.length.min;
        let max = config.randomWalk.length.max;
        const rawDesiredPathLength = Random.rangeInteger(min, max);

        const average = 0.5*(min+max);
        const prevWalk = config.randomWalk.linesPreviousWalk;
        if(prevWalk && config.randomWalk.varyWalkLengths)
        {
            if(prevWalk < average) { min = average; }
            if(prevWalk > average) { max = average; }
        }

        let desiredPathLength = Random.rangeInteger(min, max);
        if(config.randomWalk.simple) { desiredPathLength = rawDesiredPathLength; }
        const pathLength = Math.min(desiredPathLength, config.randomWalk.linesLeft);

        for(let i = 0; i < pathLength; i++)
        {
            const success = this.walk(config);
            if(!success) { break; }
        }

        if(this.getLength() < pathLength /*&& !this.closedShape*/) { return this.fail(); }
    }

    walk(config)
    {
        const lastPoint = this.getLastPoint();
        let nbs = lastPoint.getNeighbors();
        nbs = this.removeDoubleLines(lastPoint, nbs);
        nbs = this.forbidEdgeLines(lastPoint, nbs);
        nbs = this.checkMaxConnections(config, nbs);
        nbs = this.checkPointsAlreadyUsed(config, nbs);
       
        // if we check this on edge points, it fights against the rule "no lines on edge" and breaks
        if(!this.getFirstPoint().isOnEdge()) { nbs = this.checkForceStart(config, nbs); }

        if(nbs.length <= 0) { return false; }

        const lastAngle = this.getLastAngle();
        const nbWeighted = [];
        for(const nb of nbs)
        {
            const angle = Math.atan2(nb.y - lastPoint.y, nb.x - lastPoint.x);
            const angleDiff = Math.abs(angle - lastAngle) % (Math.PI);
            const probFraction = (Math.PI - angleDiff)/Math.PI;
            const prob = 1 + probFraction*(7-1); // lerp(1,7)
            nbWeighted.push({ point: nb, prob: prob });
        }

        const randomNb = nbWeighted[Random.getWeighted(nbWeighted, "prob")].point;
        const intersected = randomNb.hasConnections();
        if(intersected) { this.closedShape = true; }
        let shouldStop = intersected;

        this.addPoint(randomNb);
        if(shouldStop) { return false; }

        const maxConnections = config.randomWalk.maxConnections;
        const reachedMaximumForPoint = (randomNb.countConnections() >= maxConnections);
        if(reachedMaximumForPoint) { return false; }

        return true;
    }

    removeDoubleLines(p, nbs)
    {
        const arr = [];
        for(const nb of nbs)
        {
            if(p.isConnectedTo(nb)) { continue; }
            arr.push(nb)
        }
        return arr;
    }

    removeEmptyPoints(pts, invert = false)
    {
        const arr = [];
        for(const p of pts)
        {
            if(p.hasConnections() != invert) { continue; }
            arr.push(p);
        }

        const noNonEmptyPointsYet = invert && arr.length <= 0;
        if(noNonEmptyPointsYet) { return pts; }

        return arr;
    }

    forbidEdgeLines(p, nbs)
    {
        if(!p.isOnEdge()) { return nbs; }

        const arr = [];
        for(const nb of nbs)
        {
            if(nb.isOnEdge()) { continue; }
            arr.push(nb);
        }
        return arr;
    }

    checkMaxConnections(config, nbs)
    {
        const reachedMaxEdges = (this.numEdgePoints >= config.randomWalk.maxEdgePoints);
        const maxConnections = config.randomWalk.maxConnections;

        const arr = [];
        for(const nb of nbs)
        {
            if(nb.countConnections() >= maxConnections) { continue; }
            if(nb.isOnEdge() && reachedMaxEdges) { continue; }
            arr.push(nb);
        }
        return arr;
    }

    checkBoundedArea(config, pts)
    {
        const area = config.randomWalk.boundedArea;
        const numAreas = config.randomWalk.numBoundedAreas;
        if(numAreas <= 1) { return pts; }

        const centerPos = config.tiles.tileCenter;
        const arr = [];
        for(const p of pts)
        {
            const minAngle = (2*Math.PI) / numAreas * area;
            const maxAngle = (2*Math.PI) / numAreas * (area + 1);
            const angle = (Math.atan2(p.y - centerPos.y, p.x - centerPos.x) + 2*Math.PI) % (2*Math.PI);
            if(angle < minAngle || angle > maxAngle) { continue; }

            arr.push(p);
        }
        return arr;
    }

    checkPointsAlreadyUsed(config, nbs)
    {
        if(config.randomWalk.simple) { return nbs; }

        const allowIntersectCounter = this.numIntersections < this.maxIntersections;
        const allowIntersectProb = Math.random() <= config.randomWalk.intersectProb;
        if(allowIntersectCounter && allowIntersectProb) { return nbs; }

        const arr = [];
        for(const nb of nbs)
        {
            const alreadyUsed = this.points.includes(nb);
            if(alreadyUsed) { continue; }
            arr.push(nb);
        }
        return arr;
    }

    checkForceStart(config, pts)
    {
        const forceStart = config.randomWalk.forceStart;
        if(!forceStart) { return pts; }
        if(config.randomWalk.simple) { return pts; }

        const arr = [];
        const size = config.tiles.tileSize;
        const squareSize = Math.min(size.x, size.y);
        const centerPos = config.tiles.tileCenter;
        const maxDistToCenter = config.randomWalk.insidePointMaxDistFromCenter*squareSize;

        for(const p of pts)
        {
            if(forceStart == "edge" && !p.isOnEdge()) { continue; }
            if(forceStart == "inside") { 
                const distToCenter = p.distTo(centerPos);
                if(distToCenter > maxDistToCenter) { continue; } 
            }
            arr.push(p);
        }
        return arr;
    }
}