import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import BoardState from "../boardState";
import CONFIG from "../config";
import Point from "js/pq_games/tools/geometry/point";
import range from "js/pq_games/tools/random/range";
// @ts-ignore
import * as d3 from "js/pq_games/tools/geometry/d3-delaunay@6"
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import shuffle from "js/pq_games/tools/random/shuffle";
import Route from "../route";
import fromArray from "js/pq_games/tools/random/fromArray";

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

    getRandomPointInside(realDims:Point) : Point
    {
        return new Point(
            range(this.xMin, this.xMax) * realDims.x,
            range(this.yMin, this.yMax) * realDims.y
        )
    }
}

export default class GeneratorDelaunay
{
    boardState: BoardState;
    points: PointGraph[];
    routes: Route[];

    constructor(bs:BoardState)
    {
        this.boardState = bs;
    }

    generate()
    {
        const cities = this.placeCities();
        const citiesGraph = this.triangulate(cities);
        const pointsRelaxed = this.relaxPoints(citiesGraph);
        const routes = this.createRoutesFromPoints(pointsRelaxed);
        const routesColored = this.assignTypesToRoutes(routes);
        this.points = pointsRelaxed;
        this.routes = routesColored;
    }

    placeCities()
    {
        const numCities = rangeInteger(CONFIG.generation.numCityBounds);
        const m = 0.33;
        const requiredAreas = [
            new RequiredArea(0, 0, m, m),
            new RequiredArea(1.0 - m, 0, 1.0, m),
            new RequiredArea(1.0 - m, 1.0 - m, 1.0, 1.0),
            new RequiredArea(0, 1.0 - m, m, 1.0),
            new RequiredArea(0.5 - 0.5*m, 0.5 - 0.5*m, 0.5 + 0.5*m, 0.5 + 0.5*m)
        ];
        shuffle(requiredAreas);

        const cities = [];
        const dims = this.boardState.dims; // @TODO; probably want a cleaner location for this reference?
        for(let i = 0; i < numCities; i++)
        {
            const useRequiredArea = (i < requiredAreas.length);
            let pos:Point;
            if(useRequiredArea) { pos = requiredAreas[i].getRandomPointInside(dims); }
            else { pos = this.getValidPoint(cities, dims) }
            cities.push(pos);
        }
        
        return cities;
    }

    getValidPoint(list:Point[], dims:Point)
    {
        let pos:Point;
        let badPos = false;
        let numTries = 0;
        do {
            pos = new Point(Math.random(), Math.random()).scale(dims);
            badPos = this.getDistToClosest(pos, list) < this.getMinDistance();
            numTries++;
        } while(badPos && numTries <= 100);
        return pos;
    }

    getDistToClosest(pos:Point, list:Point[])
    {
        let closestDist = Infinity;
        for(const point of list)
        {
            const dist = pos.distTo(point);
            closestDist = Math.min(closestDist, dist);
        }
        return closestDist;
    }

    triangulate(cities:Point[])
    {
        // delaunay library needs points in [x,y],[x,y] format
        const delaunayList = [];
        const citiesGraph : PointGraph[] = [];
        for(const city of cities)
        {
            delaunayList.push([city.x, city.y]);
            citiesGraph.push(new PointGraph(city.x, city.y));
        }

        const delaunay = d3.Delaunay.from(delaunayList);
        console.log(delaunay);

        // reconstruct connections from delaunay results
        let numConnections = 0;
        for(let i = 0; i < citiesGraph.length; i++)
        {
            const c1 = citiesGraph[i];

            for(const nbIndex of delaunay.neighbors(i))
            {
                const c2 = citiesGraph[nbIndex];
                if(!this.connectionIsValid(c1, c2)) { continue; }

                c1.addConnection(c2);
                c2.addConnection(c1);
                numConnections++;
            }
        }

        // filter this list
        // take away connections from those that have the most
        // but never leave anything with too few connections
        const connsToRemove = Math.floor(CONFIG.generation.connRemovePercentage * numConnections);
        const minConns = CONFIG.generation.minConnectionsPerPoint;
        let connsRemoved = 0;
        let numTries = 0;
        while(connsRemoved < connsToRemove)
        {
            numTries++;
            citiesGraph.sort((a,b) => {
                return b.getConnections().length - a.getConnections().length
            })

            let randIdx = rangeInteger(0, 5);
            if(numTries >= 100) { randIdx = rangeInteger(0, citiesGraph.length-1); }

            const city = citiesGraph[randIdx];
            if(city.countConnections() <= 0) { break; } // @TODO: should really stop generation entirely because everything needs a connection, right?

            const randConnIdx = rangeInteger(0, city.countConnections()-1);
            const conn = city.getConnectionByIndex(randConnIdx);
            if(conn.countConnections() <= minConns || city.countConnections() <= minConns) { continue; }

            city.removeConnectionByIndex(randConnIdx);
            connsRemoved++;
        }

        return citiesGraph;
    }

    getMinDistance()
    {
        return 2*CONFIG.generation.cityRadius + 1;
    }

    getMaxDistance()
    {
        return 2*CONFIG.generation.cityRadius + CONFIG.generation.maxBlocksPerRoute
    }

    connectionIsValid(p1:PointGraph, p2:PointGraph)
    {
        if(p1.isConnectedTo(p2) || p2.isConnectedTo(p1)) { return false; }

        const dist = p1.distTo(p2);
        if(dist > this.getMaxDistance()) { return false; }

        const vec = p1.vecTo(p2).normalize();

        const DOT_PROD_THRESHOLD = 0.875;
        for(const conn of p1.getConnections())
        {
            const vec2 = p1.vecTo(conn).normalize();
            const dot = vec.dot(vec2);
            if(dot >= DOT_PROD_THRESHOLD) { return false; }
        }

        for(const conn of p2.getConnections())
        {
            const vec2 = conn.vecTo(p2).normalize();
            const dot = vec.dot(vec2);
            if(dot >= DOT_PROD_THRESHOLD) { return false; }
        }

        return true;
    }
    
    relaxPoints(points:PointGraph[])
    {
        const arr = points.slice();
        const numIterations = CONFIG.generation.numRelaxIterations;

        for(let i = 0; i < numIterations; i++)
        {
            const iterationDampingAuto = (1.0 - (i / numIterations));
            const iterationDampingFactor = CONFIG.generation.influenceDamping * iterationDampingAuto;

            // intialize all points to not move
            for(const p1 of arr)
            {
                p1.metadata.offset = new Point();
            }

            // now check influence on (and from) surroundings
            for(const p1 of arr)
            {
                for(const p2 of p1.getConnections())
                {
                    const vecTo = p1.vecTo(p2);
                    const dist = vecTo.length();
                    const vecNorm = vecTo.clone().normalize();

                    const rawLength = dist - 2*CONFIG.generation.cityRadius;
                    const idealLength = Math.round(rawLength) + 2*CONFIG.generation.cityRadius;
                    let change = 0.5 * (dist - idealLength);
                    change *= iterationDampingFactor;

                    p1.metadata.offset.move(vecNorm.clone().scaleFactor(change));
                    p2.metadata.offset.move(vecNorm.clone().negate().scaleFactor(change));
                }
            }

            // now apply all those offsets at the same time
            for(const p1 of arr)
            {
                const off = p1.metadata.offset;
                p1.move(off);
                p1.clamp(new Point(), this.boardState.dims);
            }
        }

        return arr;
    }

    routeAlreadyRegistered(needle:Route, haystack:Route[])
    {
        for(const route of haystack)
        {
            if(route.matches(needle)) { return true; }
        }
        return false;
    }

    createRoutesFromPoints(points:PointGraph[])
    {
        const routes = [];
        for(const point of points)
        {
            for(const conn of point.getConnections())
            {
                const r = new Route(point, conn);
                if(this.routeAlreadyRegistered(r, routes)) { continue; }
                routes.push(r);
            }
        }
        return routes;
    }

    assignTypesToRoutes(routes:Route[])
    {
        const numTypes = CONFIG.generation.numBlockTypes;
        const numTypeUsed = new Array(numTypes).fill(0);
        const routesSorted = routes.slice();

        routesSorted.sort((a,b) => {
            return b.getBlockLength() - a.getBlockLength()
        })

        for(const route of routesSorted)
        {
            const type = this.pickLeastUsedType(numTypeUsed);
            route.type = type;
            numTypeUsed[type] += route.getBlockLength();
        }

        return routesSorted;
    }

    pickLeastUsedType(stats:number[])
    {
        let lowestNumber = Infinity;
        for(let i = 0; i < stats.length; i++)
        {
            lowestNumber = Math.min(lowestNumber, stats[i]);
        }

        const options = [];
        for(let i = 0; i < stats.length; i++)
        {
            if(stats[i] != lowestNumber) { continue; }
            options.push(i);
        }

        return fromArray(options);
    }
}