import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import Route from "./route";
import BoardState from "./boardState";
import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "./config";
import range from "js/pq_games/tools/random/range";
import shuffle from "js/pq_games/tools/random/shuffle";
import RouteSet from "./routeSet";

export default class Routes
{
    routes: Route[];
    numTotalBlocks: number;
    boardState: BoardState;

    constructor(bs:BoardState)
    {
        this.boardState = bs;
    }
    
    count() { return this.routes.length; }
    generate(points:PointGraph[])
    {
        const routes = this.createRoutesFromPoints(points);
        const routesMulti = this.assignMultiRoute(routes);
        const routesColored = this.assignTypesToRoutes(routesMulti);
        const routesWithBonus = this.assignBonusToRoutes(routesColored);
        this.routes = routesWithBonus;
        return this.routes;
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

        // first create the initial routes
        const routes : Route[] = [];
        let sum = 0;
        for(const point of points)
        {
            for(const conn of point.getConnections())
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
        shuffle(routes)

        let numDoubleRoutes = Math.round(range(CONFIG.generation.doubleRouteBounds) * routes.length);
        if(!CONFIG.generation.doubleRoutesInclude) { numDoubleRoutes = 0; }

        const maxBlocks = CONFIG.generation.maxBlocksPerRoute;
        const doubleRoutes = [];
        let counter = -1;
        while(doubleRoutes.length < numDoubleRoutes)
        {
            counter = (counter + 1) % routes.length;
            const r = routes[counter];
            const alreadyDoubled = r.set != null;
            if(alreadyDoubled) { continue; }

            // the longer the route, the less likely it is to be doubled
            const prob = 1.0 - r.getBlockLength() / (maxBlocks + 1);
            if(Math.random() > prob) { continue; }

            const set = new RouteSet();
            set.add(r);

            const doubled = new Route(r.start, r.end);
            set.add(doubled);

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

    assignMultiRoute(routes:Route[])
    {
        if(!CONFIG.expansions.multiRoutes) { return routes; }

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
            const numTypesWanted = route.multi ? route.getBlockLength() : 1;
            for(let i = 0; i < numTypesWanted; i++)
            {
                const type = this.pickLeastUsedType(numTypeUsed);
                route.addType(type);
                numTypeUsed[type]++;
            }
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

    generateRandomBonuses(num:number)
    {
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push("train"); // @TODO: draw actual bonus, weighted, perhaps with more control
        }
        return arr;
    }

    assignBonusToRoutes(routes:Route[])
    {
        if(!CONFIG.expansions.bonusBalloons) { return routes; }

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

        return routes;
    }
}