import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import Route from "./route";
import BoardState from "./boardState";
import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "./config";
import range from "js/pq_games/tools/random/range";
import shuffle from "js/pq_games/tools/random/shuffle";
import RouteSet from "./routeSet";
import lineIntersectsShape from "js/pq_games/tools/geometry/intersection/lineIntersectsShape";
import Line from "js/pq_games/tools/geometry/line";
import getWeightedByIndex from "js/pq_games/tools/random/getWeightedByIndex";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import { BONUSES } from "./dict";

export default class Routes
{
    routes: Route[];
    numTotalBlocks: number;
    boardState: BoardState;

    constructor(bs:BoardState)
    {
        this.boardState = bs;
    }
    
    get() { return this.routes; }
    count() { return this.routes.length; }
    generate(points:PointGraph[])
    {
        const routes = this.createRoutesFromPoints(points);
        this.routes = routes;
        this.addCurveToRoutes(routes);
        this.removeFailedRoutes(); // curving can be impossible in rare instances, so remove any failed routes right after it

        this.assignMultiRoute(routes);
        this.assignTypesToRoutes(routes);
        this.assignBonusToRoutes(routes);
        return routes;
    }

    remove(route:Route)
    {
        //console.log("Should remove route ", route);
        
        route.removeFromPoints();
        if(route.set) { route.set.remove(route); }

        this.routes.splice(this.routes.indexOf(route), 1);
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
        for(const point of points)
        {
            point.metadata.routes = [];
        }

        // remove any connections overlapping forbidden rectangles outright
        for(const point of points)
        {
            for(const conn of point.getConnectionsByPoint())
            {
                const line = new Line(point, conn)
                if(!this.boardState.forbiddenAreas.lineIsInside(line)) { continue; }
                point.removeConnectionByPoint(conn);
            }
        }

        // remove any points with a single connection to start with
        for(let i = points.length-1; i >= 0; i--)
        {
            const numConns = points[i].countConnections();
            if(numConns > 1) { continue; }
            this.boardState.pointsManager.remove(points[i]);
        }

        // first create the initial routes
        const routes : Route[] = [];
        let sum = 0;
        for(const point of points)
        {
            for(const conn of point.getConnectionsByPoint())
            {
                const r = new Route(point, conn);
                if(this.routeAlreadyRegistered(r, routes)) { continue; }
                routes.push(r);

                point.metadata.routes.push(r);
                conn.metadata.routes.push(r);
                sum += r.getBlockLength();
            }
        }

        // then turn some of them into double routes
        // (feels cleaner to assemble them all first and _then_ add them all to routes)
        let numDoubleRoutes = Math.round(range(CONFIG.generation.doubleRouteBounds) * routes.length);
        if(!CONFIG.generation.doubleRoutesInclude) { numDoubleRoutes = 0; }

        routes.sort((a,b) => {
            return a.getBlockLength() - b.getBlockLength();
        });

        const doubleRoutes = [];
        while(doubleRoutes.length < numDoubleRoutes)
        {
            // descending => the longer the route, the less likely it is to be doubled
            const r = routes[getWeightedByIndex(routes, true, 0.1)];
            const alreadyDoubled = r.set != null;
            if(alreadyDoubled) { continue; }

            const set = new RouteSet();
            set.add(r);

            const doubled = new Route(r.start, r.end);
            set.add(doubled);

            doubleRoutes.push(doubled);
            r.start.metadata.routes.push(doubled);
            r.end.metadata.routes.push(doubled);
        }

        for(const doubleRoute of doubleRoutes)
        {
            routes.push(doubleRoute);
            sum += doubleRoute.getBlockLength();
        }

        this.numTotalBlocks = sum;

        return routes;
    }

    addCurveToRoutes(routes:Route[])
    {
        for(const route of routes)
        {
            route.calculateCurvedPath();
        }
    }

    removeFailedRoutes()
    {
        for(const route of this.routes)
        {
            if(route.failed || !route.pathSimple) { this.remove(route); }
        }
    }

    assignMultiRoute(routes:Route[])
    {
        if(!CONFIG.expansions.multiRoutes) { return; }

        shuffle(routes);

        const minLength = CONFIG.generation.minRouteLengthForMulti;
        const numMultiBlocks = Math.round( range(CONFIG.generation.numMultiRouteBlocks) * this.numTotalBlocks );

        let counter = -1;
        let multiBlocksPlaced = 0;
        while(multiBlocksPlaced < numMultiBlocks)
        {
            counter = (counter + 1) % routes.length;
            const route = routes[counter];
            if(route.getBlockLength() < minLength) { continue; }

            route.multi = true;
            multiBlocksPlaced += route.getBlockLength();
        }
    }

    assignTypesToRoutes(routes:Route[])
    {
        const numTypes = this.boardState.numBlockTypes;
        const numTypeUsed = new Array(numTypes).fill(0);

        routes.sort((a,b) => {
            return b.getBlockLength() - a.getBlockLength()
        })

        for(const route of routes)
        {
            const numTypesWanted = route.multi ? route.getBlockLength() : 1;
            for(let i = 0; i < numTypesWanted; i++)
            {
                const type = this.pickLeastUsedType(numTypeUsed);
                route.addType(type);
                numTypeUsed[type]++;
            }
        }
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

    generateRandomBonuses(num:number)
    {
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            const randBonus = getWeighted(BONUSES);
            arr.push(randBonus);
        }
        return arr;
    }

    assignBonusToRoutes(routes:Route[])
    {
        if(!CONFIG.expansions.bonusBalloons) { return; }
        if(CONFIG.useRealMaterial) { return; }

        shuffle(routes);

        const minLength = CONFIG.generation.minRouteLengthForBonus;

        const numBonuses = Math.round(range(CONFIG.generation.numBonusBounds) * this.numTotalBlocks);
        const bonuses = this.generateRandomBonuses(numBonuses);

        let counter = -1;
        while(bonuses.length > 0)
        {
            counter = (counter + 1) % routes.length;
            const curRoute = routes[counter];
            if(curRoute.getBlockLength() < minLength) { continue; }
            curRoute.placeBonus(bonuses.pop());
        }
    }
}