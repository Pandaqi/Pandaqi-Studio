import { Vector2, range, Vector2Graph, shuffle, rangeInteger, getWeightedByIndex, d3 } from "lib/pq-games";
import BoardState from "../boardState";
import CONFIG from "../config";

class RequiredArea
{
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;

    constructor(xMin:number = 0, yMin:number = 0, xMax:number = Infinity, yMax:number = Infinity)
    {
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
    }

    getRandomVector2Inside(marginBoard:Vector2, realDims:Vector2) : Vector2
    {
        return new Vector2(
            marginBoard.x + range(this.xMin, this.xMax) * realDims.x,
            marginBoard.y + range(this.yMin, this.yMax) * realDims.y
        )
    }
}

export default class GeneratorDelaunay
{
    boardState: BoardState;
    points: Vector2Graph[];
    sizeUsable: Vector2;
    marginBoard: Vector2;

    constructor(bs:BoardState)
    {
        this.boardState = bs;
    }

    generate()
    {
        const cities = this.placeCities();
        const points = this.triangulate(cities);
        this.points = points;
        this.relaxVector2s(points);
        return points;
    }

    placeCities()
    {
        const numCityFactor = CONFIG.generation.numCityMultipliers[CONFIG.boardSize];
        const numCitiesMax = CONFIG.generation.numCityBounds.max; // we expect some cities to fail/be removed, so always start at max
        const numCities = Math.ceil(numCitiesMax * numCityFactor);
        const m = CONFIG.generation.requiredAreaSize; // relative to full dimensions
        const requiredAreas = [
            new RequiredArea(0, 0, m, m),
            new RequiredArea(1.0 - m, 0, 1.0, m),
            new RequiredArea(1.0 - m, 1.0 - m, 1.0, 1.0),
            new RequiredArea(0, 1.0 - m, m, 1.0),
            new RequiredArea(0.5 - 0.5*m, 0.5 - 0.5*m, 0.5 + 0.5*m, 0.5 + 0.5*m)
        ];
        shuffle(requiredAreas);

        const cities = [];
        const size = this.boardState.size;
        const marginBoard = new Vector2(CONFIG.generation.outerMarginBoard);
        const sizeUsable = new Vector2(size.x-2*marginBoard.x, size.y-2*marginBoard.y);

        this.marginBoard = marginBoard;
        this.sizeUsable = sizeUsable;
        
        for(let i = 0; i < numCities; i++)
        {
            const useRequiredArea = (i < requiredAreas.length);
            let pos:Vector2;
            if(useRequiredArea) { pos = requiredAreas[i].getRandomVector2Inside(marginBoard, sizeUsable); }
            else { pos = this.getValidVector2(cities, marginBoard, sizeUsable) }
            
            if(this.boardState.forbiddenAreas.pointIsInside(pos)) { i--; continue; }
            
            cities.push(pos);
        }
        
        return cities;
    }

    getValidVector2(list:Vector2[], marginBoard: Vector2, sizeUsable:Vector2)
    {
        let pos:Vector2;
        let badPos = false;
        let numTries = 0;
        const maxTries = 100;
        do {
            pos = marginBoard.clone().add(new Vector2(Math.random(), Math.random()).scale(sizeUsable));
            badPos = this.getDistToClosest(pos, list) < this.getMinDistance();
            numTries++;
        } while(badPos && numTries <= maxTries);
        return pos;
    }

    getDistToClosest(pos:Vector2, list:Vector2[])
    {
        let closestDist = Infinity;
        for(const point of list)
        {
            const dist = pos.distTo(point);
            closestDist = Math.min(closestDist, dist);
        }
        return closestDist;
    }

    triangulate(cities:Vector2[])
    {
        // delaunay library needs points in [x,y],[x,y] format
        const delaunayList = [];
        const citiesGraph : Vector2Graph[] = [];
        for(const city of cities)
        {
            delaunayList.push([city.x, city.y]);
            citiesGraph.push(new Vector2Graph(city.x, city.y));
        }

        const delaunay = d3.Delaunay.from(delaunayList);

        // reconstruct connections from delaunay results
        let numConnections = 0;
        const numCities = citiesGraph.length;
        for(let i = 0; i < citiesGraph.length; i++)
        {
            const c1 = citiesGraph[i];

            for(const nbIndex of delaunay.neighbors(i))
            {
                const c2 = citiesGraph[nbIndex];
                if(!this.connectionIsValid(c1, c2)) { continue; }

                c1.addConnectionByPoint(c2);
                numConnections++;
            }
        }

        // filter this list
        // take away connections from those that have the most
        // but never leave anything with too few connections
        const connBounds = CONFIG.generation.connectionBounds
        const connBoundsClamped = { 
            min: connBounds.min * numCities,
            max: connBounds.max * numCities
        }
        const numIdealConnections = rangeInteger(connBoundsClamped);

        // multiply by 2 to count connections BOTH WAYS
        let connsToRemove = 2*numConnections - numIdealConnections;
        if(!CONFIG.generation.reduceConnectivityAfterTriangulation) { connsToRemove = 0; }

        const minConnsPerVector2 = Math.round(CONFIG.generation.minConnectionsPerVector2.lerp(CONFIG.boardClarityNumber));
        const citiesThatCanLoseConnections = [];
        for(let i = citiesGraph.length-1; i >= 0; i--)
        {
            const city = citiesGraph[i];
            const numConns = city.countConnections();
            if(numConns == 0) { citiesGraph.splice(i, 1); continue; }
            if(numConns <= minConnsPerVector2) { continue; }
            if(this.cityNearCenter(city)) { continue; }

            citiesThatCanLoseConnections.push(city);
        }

        let connsRemoved = 0;
        let numTries = 0;
        const maxTries = 200;
        while(connsRemoved < connsToRemove)
        {
            numTries++;
            if(numTries >= maxTries) { break; }
            if(citiesThatCanLoseConnections.length <= 0) { break; }

            citiesThatCanLoseConnections.sort((a,b) => {
                return b.getConnectionsByVector2().length - a.getConnectionsByVector2().length
            })

            let randIdx = getWeightedByIndex(citiesThatCanLoseConnections, true);

            const city = citiesThatCanLoseConnections[randIdx];
            const randConnIdx = rangeInteger(0, city.countConnections()-1);
            const conn = city.getConnectionVector2ByIndex(randConnIdx);
            if(conn.countConnections() <= minConnsPerVector2) { continue; }

            city.removeConnectionByIndex(randConnIdx);
            connsRemoved++;

            // ugly boards usually remove too many points from one city
            // so just remove use from the list once we get low
            if(city.countConnections() <= minConnsPerVector2 + 2) 
            {
                citiesThatCanLoseConnections.splice(citiesThatCanLoseConnections.indexOf(city), 1);
            }
        }

        return citiesGraph;
    }

    cityNearCenter(city:Vector2Graph, factor = 1.0)
    {
        const size = this.boardState.size;
        const halfDims = size.clone().scale(0.5);
        const maxDist = size.clone().scale(CONFIG.generation.centerBoxScale);
        const manhattanDist = new Vector2(city.x - halfDims.x, city.y - halfDims.y).abs();
        if(manhattanDist.x < maxDist.x && manhattanDist.y < maxDist.y) { return true; }
        return false;
    }

    getMinDistance()
    {
        return 2*CONFIG.generation.cityRadius + 1;
    }

    getMaxDistance()
    {
        return 2*CONFIG.generation.cityRadius + this.boardState.maxBlocksPerRoute;
    }

    connectionIsValid(p1:Vector2Graph, p2:Vector2Graph)
    {
        if(p1.isConnectedTo(p2) || p2.isConnectedTo(p1)) { return false; }

        const distBuffer = CONFIG.generation.maxBlocksOverflowBeforeRelaxation;

        const dist = p1.distTo(p2);
        if(dist > (this.getMaxDistance()+distBuffer)) { return false; }

        const vec = p1.vecTo(p2).normalize();

        const DOT_PROD_THRESHOLD = 0.875;
        for(const conn of p1.getConnectionsByPoint())
        {
            const vec2 = p1.vecTo(conn).normalize();
            const dot = vec.dot(vec2);
            if(dot >= DOT_PROD_THRESHOLD) { return false; }
        }

        for(const conn of p2.getConnectionsByPoint())
        {
            const vec2 = conn.vecTo(p2).normalize();
            const dot = vec.dot(vec2);
            if(dot >= DOT_PROD_THRESHOLD) { return false; }
        }

        return true;
    }
    
    relaxVector2s(points:Vector2Graph[])
    {
        if(!CONFIG.generation.relaxVector2s) { return points; }

        const numIterations = CONFIG.generation.numRelaxIterations;

        const minBounds = this.marginBoard;
        const maxBounds = minBounds.clone().add(this.sizeUsable);

        for(let i = 0; i < numIterations; i++)
        {
            const iterationDampingAuto = (1.0 - (i / numIterations));
            const iterationDampingFactor = CONFIG.generation.influenceDamping * iterationDampingAuto;

            // intialize all points to not move
            for(const p1 of points)
            {
                p1.metadata.offset = new Vector2();
            }

            // now check influence on (and from) surroundings
            for(const p1 of points)
            {
                for(const p2 of p1.getConnectionsByPoint())
                {
                    const vecTo = p1.vecTo(p2);
                    const dist = vecTo.length();
                    const vecNorm = vecTo.clone().normalize();

                    const rawLength = dist - 2*CONFIG.generation.cityRadius;
                    let idealLength = Math.min(Math.round(rawLength) + 2*CONFIG.generation.cityRadius, this.getMaxDistance());

                    let change = 0.5 * (dist - idealLength);
                    change *= iterationDampingFactor;

                    p1.metadata.offset.move(vecNorm.clone().scaleFactor(change));
                    p2.metadata.offset.move(vecNorm.clone().negate().scaleFactor(change));
                }
            }

            // now apply all those offsets at the same time
            for(const p1 of points)
            {
                const off = p1.metadata.offset;
                const posNew = p1.clone();
                posNew.move(off);
                posNew.clamp(minBounds, maxBounds);

                if(this.boardState.forbiddenAreas.pointIsInside(posNew)) { continue; }
                p1.set(posNew);
            }
        }

        // now that we know the final location of all points, we can cache some more data on them
        for(const p of points)
        {
            p.metadata.nearCenter = this.cityNearCenter(p);
        }
    }
}