import GraphSmoother from "../../tools/graphSmoother"
import Point from "../../shapes/point";
import { Line, range, rangeInteger, shuffle, Vector2 } from "lib/pq-games";

export default class PhotomoneGenerator
{
    visualType: string;
    points: Point[];
    lines: Line[];
    
    constructor() 
    { 
        this.visualType = "photomone"
        this.points = [];
        this.lines = [];
    }

    getPoints() { return this.points; }
    getLines() { return this.lines; }
    generate(config)
    {
        this.reducePoints(config);
        this.randomizePoints(config);
        this.relaxPoints(config);
        this.connectPoints(config);
    }

    reducePoints(config)
    {
        const allPoints = config.gridPoints.slice();
        shuffle(allPoints);
        const numBounds = config.photomone.numPoints;

        const edgePoints = this.getEdgePointsWithIndex(allPoints, 0).concat(this.getEdgePointsWithIndex(allPoints, 2));
        const pointsToKeep = edgePoints;
        const numPoints = rangeInteger(numBounds.min, numBounds.max) + pointsToKeep.length;

        while(pointsToKeep.length < numPoints)
        {
            const newElem = allPoints.pop();
            if(newElem.isOnEdge()) { continue; }
            if(pointsToKeep.includes(newElem)) { continue; }

            const maxDistToCenter = 0.5*0.75*config.sizeGeneratorSquare;
            const distToCenter = newElem.clone().distTo(config.size.clone().scaleFactor(0.5));
            if(distToCenter >= maxDistToCenter) { continue; }
            
            pointsToKeep.push(newElem);
        }

        this.points = pointsToKeep;
    }

    getEdgePointsWithIndex(points, idx)
    {
        const arr = [];
        for(const point of points)
        {
            if(!point.isOnEdge()) { continue; }
            if(point.lineIndex != idx) { continue; }
            arr.push(point);
        }
        return arr;
    }

    randomizePoints(config)
    {
        const minSize = config.sizeGeneratorSquare;
        const bounds = config.photomone.maxRandomization;
        const arr = [];
        for(const p of this.points)
        {
            const newPoint = p.clone();
            arr.push(newPoint);
            if(newPoint.isOnEdge()) { continue; }
            if(newPoint.lineIndex == 0 || newPoint.lineIndex == 2) { continue; }

            let varX = range(bounds.min * minSize, bounds.max * minSize);
            if(Math.random() <= 0.5) { varX *= -1; }
            let varY = range(bounds.min * minSize, bounds.max * minSize);
            if(Math.random() <= 0.5) { varY *= -1; }

            newPoint.x += varX;
            newPoint.y += varY;            
        }
        this.points = arr;
        shuffle(this.points);
    }

    relaxPoints(config)
    {
        const smoother = new GraphSmoother();
        const smoothParams = {
            numSmoothSteps: 30,
            influenceRadius: 0.4,
            excludeProperties: ["edge"],
            clipShape: config.shape,
        }
        smoother.apply(this.points, smoothParams);
    }

    connectPoints(config)
    {
        const numBounds = config.photomone.numConnectionsPerPoint;
        const numConnections = rangeInteger(numBounds.min, numBounds.max);
        const allLines = [];
        for(const point of this.points)
        {
            const otherPoints = this.getPointsSortedByDistance(point);
            const nbs = otherPoints.slice(0, numConnections);
            for(const nbData of nbs)
            {
                point.addConnection(nbData.point);
                nbData.point.addConnection(point);

                const newLine = new Line().setPoints(new Vector2(point.x, point.y), nbData.point);
                if(this.lineIntersectsAnother(newLine, allLines)) { continue; }
                allLines.push(newLine);
            }
        }
        this.lines = allLines;
    }

    lineIntersectsAnother(needle, haystack)
    {
        for(const elem of haystack)
        {
            if(needle.intersectsLine(elem, 0.25)) { return true; }
        }
        return false;
    }

    getPointsSortedByDistance(p)
    {
        const arr = [];
        for(const point of this.points)
        {
            if(point == p) { continue; }
            if(p.isOnEdge() && point.isOnEdge()) { continue; } // no direct connections between two edge points
            if(point.isConnectedTo(p)) { continue; } // don't connect to points to which we're already connected
            if(point.countConnections() >= 2) { continue; }
            const dist = p.distTo(point);
            arr.push({ point: Point, dist: dist });
        }

        arr.sort((a,b) => { return a.dist - b.dist; })
        return arr;
    }
}