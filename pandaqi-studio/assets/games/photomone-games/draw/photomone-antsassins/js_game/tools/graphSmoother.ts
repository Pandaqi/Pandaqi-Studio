import Point from "../shapes/point"

export default class GraphSmoother
{
    numSmoothSteps: number;
    points: Point[];
    smoothVectors: any[];
    excludeProperties: any[];
    mapBounds: { min: Point; max: Point; };
    squareSize: number;
    influenceRadius: any;
    influenceRadiusSquared: number;
    clipShape: any;

    constructor() 
    {
        this.numSmoothSteps = 10;
        this.points = null;
        this.smoothVectors = [];
        this.excludeProperties = [];
    }

    apply(map:Point[] = [], params:Record<string,any> = {})
    {
        this.mapBounds = this.calculateBounds(map);
        this.squareSize = Math.min(this.mapBounds.max.x - this.mapBounds.min.x, this.mapBounds.max.y - this.mapBounds.min.y);
        this.excludeProperties = params.excludeProperties || [];

        this.numSmoothSteps = params.numSmoothSteps || this.numSmoothSteps;
        this.influenceRadius = params.influenceRadius || 0.25; // this is RELATIVE to total (squared-off) size
        this.influenceRadius *= this.squareSize;
        this.influenceRadiusSquared = Math.pow(this.influenceRadius, 2);

        this.clipShape = params.clipShape || null;

        this.points = map;
        this.smoothVectors = [];

        for(let i = 0; i < this.numSmoothSteps; i++)
        {
            this.calculateSmoothVectors(i);
            this.smoothPointStep();
        }
    }

    calculateBounds(points)
    {
        const min = new Point(Infinity, Infinity);
        const max = new Point(-Infinity, -Infinity);

        for(const point of points)
        {
            min.x = Math.min(point.x, min.x);
            min.y = Math.min(point.y, min.y);

            max.x = Math.max(point.x, max.x);
            max.y = Math.max(point.y, max.y);
        }

        return {
            min: min,
            max: max
        }
    }

    calculateSmoothVectors(iteration)
    {
        for(let i = 0; i < this.points.length; i++)
        {
            const point = this.points[i];
            const neighbors = this.getNeighborsInRange(point);
            const vector = this.sumPushAwayVectors(point, neighbors, iteration);
            this.smoothVectors[i] = vector;
        }
    }

    smoothPointStep()
    {
        for(let i = 0; i < this.points.length; i++)
        {
            const change = this.smoothVectors[i];
            this.smoothVectors[i] = null;
            if(!change) { continue; }

            const point = this.points[i];
            const targetPoint = point.clone().move(change);
            if(this.clipShape && !this.clipShape.isInside(targetPoint)) { continue; }

            point.move(change);
            point.clamp(this.mapBounds.min, this.mapBounds.max);
        }
    }

    getNeighborsInRange(p1)
    {
        const arr = [];
        for(const p2 of this.points)
        {
            const itsUs = p1 == p2;
            if(itsUs) { continue; }

            const dist = p1.distSquaredTo(p2);
            if(dist > this.influenceRadiusSquared) { continue; }

            arr.push(p2);
        }
        return arr;
    }

    excludePoint(p)
    {
        for(const prop of this.excludeProperties)
        {
            if(p[prop]) { return true; }
        }
        return false;
    }

    sumPushAwayVectors(anchor, nbs, iteration)
    {
        const change = new Point();
        if(nbs.length <= 0) { return change; }

        if(this.excludePoint(anchor)) { return change; }

        const maxDist = this.influenceRadius;
        for(const nb of nbs)
        {
            const dist = anchor.distTo(nb);
            const vec = anchor.vecTo(nb);
            vec.normalize();
            vec.negate();

            // the _further_ away, the _lower_ this should be, so we invert
            // however, it's still proportional to distance
            // and because it's applied to both points, halve it
            const distanceScalar = 0.5 * (1.0 - dist / maxDist) * maxDist;
            vec.scaleFactor(distanceScalar);
            change.move(vec);
        }

        const averagingFactor = 1.0 / nbs.length;
        const iterationFactor = Math.pow( 1.0 / (iteration + 1) , 0.25);
        change.scale(averagingFactor * iterationFactor);
        return change;
    }
}