import Route from "./route";
import BoardState from "./boardState";
import { CONFIG } from "./config";
import RouteSet from "./routeSet";
import { Vector2Graph, Line, range, getWeightedByIndex, rangeInteger, shuffle, fromArray, getWeighted } from "lib/pq-games";
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
    generate(points:Vector2Graph[])
    {
        const routes = this.createRoutesFromPoints(points);
        this.routes = routes;
        this.addCurveToRoutes(routes);
        this.removeFailedRoutes(); // curving can be impossible in rare instances, so remove any failed routes right after it

        this.cacheRouteStats(routes);
        this.assignMultiRoute(routes);
        this.assignTypesToRoutes(routes);
        this.assignBonusToRoutes(routes);
        return routes;
    }

    cacheRouteStats(routes:Route[])
    {
        let sum = 0;
        for(const r of routes)
        {
            sum += r.getBlockLength();
        }
        this.numTotalBlocks = sum;
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

    createRouteBetween(a:Vector2Graph, b:Vector2Graph, list:Route[])
    {
        const r = new Route(a,b);
        if(this.routeAlreadyRegistered(r, list)) { return null; }

        list.push(r);
        if(!a.isConnectedTo(b)) { a.addConnectionByPoint(b); }

        a.metadata.routes.push(r);
        b.metadata.routes.push(r);
        return r;
    }

    createRoutesFromPoints(points:Vector2Graph[])
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
        for(const point of points)
        {
            for(const conn of point.getConnectionsByPoint())
            {
                this.createRouteBetween(point, conn, routes);
            }
        }

        // a huge improvement that simply tries quick routes to nearby points
        // (which are removed anyway if they overlap/don't fit)
        // adds more routes + more variation for little cost
        this.trySneakConnections(points, routes);

        // then turn some of them into double routes
        // (feels cleaner to assemble them all first and _then_ add them all to routes)
        let numDoubleRoutes = Math.round(range(CONFIG.generation.doubleRouteBounds) * routes.length);
        if(!CONFIG.generation.doubleRoutesInclude) { numDoubleRoutes = 0; }

        routes.sort((a,b) => {
            return a.getBlockLength() - b.getBlockLength();
        });

        const doubleRoutes = [];
        let numTries = 0;
        const maxTries = 300;
        while(doubleRoutes.length < numDoubleRoutes)
        {
            numTries++;
            if(numTries >= maxTries) { break; }

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
        }

        return routes;
    }

    countUniqueRoutes(point:Vector2Graph)
    {
        const routes = point.metadata.routes;
        let sets = [];
        let sum = 0;
        for(const route of routes)
        {
            if(!route.set) { sum += 1; continue; }
            if(sets.includes(route.set)) { continue; }
            sum += 1;
            sets.push(route.set);
        }
        return sum;
    }

    trySneakConnections(points:Vector2Graph[], routes:Route[])
    {
        if(!CONFIG.generation.trySneakConnections) { return; }

        const maxSneakConnections = CONFIG.generation.maxSneakConnections;
        for(const p1 of points)
        {
            let conns = this.countUniqueRoutes(p1);
            if(conns >= 3) { continue; }

            let candidates = [];
            for(const p2 of points)
            {
                if(p1 == p2) { continue; }
                if(p1.isConnectedTo(p2)) { continue; }

                const line = new Line(p1, p2)
                if(this.boardState.forbiddenAreas.lineIsInside(line)) { continue; }

                candidates.push({ point: p2, dist: p1.distTo(p2) });
            }

            if(candidates.length <= 0) { continue; }

            const candidatesToTry = Math.min(rangeInteger(1,maxSneakConnections), candidates.length);
            candidates.sort((a,b) => { return a.dist - b.dist; });

            for(let c = 0; c < candidatesToTry; c++)
            {
                const candidate = candidates[c].point;
                const r = this.createRouteBetween(p1, candidate, routes);
                // r.conservative = true; => too ugly
            }
        }
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
        let numTries = 0;
        const maxTries = 300;
        while(multiBlocksPlaced < numMultiBlocks)
        {
            numTries++;
            if(numTries >= maxTries) { break; }

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
            const forbiddenTypes = route.multi ? [] : route.getForbiddenTypes();
            for(let i = 0; i < numTypesWanted; i++)
            {
                const type = this.pickLeastUsedType(numTypeUsed, forbiddenTypes);
                route.addType(type);
                numTypeUsed[type]++;
            }
        }
    }

    pickLeastUsedType(stats:number[], exclude:number[])
    {
        let lowestNumber = Infinity;
        for(let i = 0; i < stats.length; i++)
        {
            if(exclude.includes(i)) { continue; }
            lowestNumber = Math.min(lowestNumber, stats[i]);
        }

        const options = [];
        for(let i = 0; i < stats.length; i++)
        {
            if(exclude.includes(i)) { continue; }
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
        let numTries = 0;
        const maxTries = 300;
        while(bonuses.length > 0)
        {
            numTries++;
            if(numTries >= maxTries) { break; }

            counter = (counter + 1) % routes.length;
            const curRoute = routes[counter];
            if(curRoute.getBlockLength() < minLength) { continue; }
            curRoute.placeBonus(bonuses.pop());
        }
    }
}