import countElementsInArray from "js/pq_games/tools/collections/countElementsInArray";
import BoardState from "./boardState";
import CONFIG from "./config"
import Route from "./route";
import pathIntersectsPath from "js/pq_games/tools/geometry/intersection/pathIntersectsPath";
import distToPath from "js/pq_games/tools/geometry/distance/distToPath";

export default class Evaluator
{
    isValid(board:BoardState) : boolean
    {
        if(!CONFIG.evaluator.enable) { return true; }
        if(board.failed) { return false; }
        return true;
    }

    areRoutesValid(board:BoardState)
    {
        // check type distribution (very cheap, do first)
        if(!this.typesFairlyDistributed(board)) { return false; }
        if(this.typesClumpedUp(board)) { return false; }

        // check nasty situations that occur 1/10 times
        // @TODO: actually make these REMOVE the problematic ones, instead of cancelling outright?
        if(this.pointOverlapsRoute(board)) { return false; }
        if(this.routesOverlap(board)) { return false; }

        // check graph connectedness (more expensive)
        if(this.pointsWithBadConnections(board)) { return false; }
        if(!this.allPointsConnected(board)) { return false; }
        if(!this.allPointsAdequatelyConnected(board)) { return false; }

        return true;
    }

    areTrajectoriesValid(board:BoardState)
    {
        return true; // @TODO: no specific checks for trajectories at this moment
    }

    typesFairlyDistributed(board:BoardState)
    {
        const numTypeUsed = new Array(CONFIG.generation.numBlockTypes).fill(0);
        for(const route of board.getRoutes())
        {
            const arr = route.getTypes();
            for(const type of arr)
            {
                numTypeUsed[type]++;
            }
        }

        let mostUsed = -Infinity;
        let leastUsed = Infinity;
        for(const numUsed of numTypeUsed)
        {
            mostUsed = Math.max(mostUsed, numUsed);
            leastUsed = Math.min(leastUsed, numUsed);
        }

        const dist = (mostUsed - leastUsed)
        return dist <= CONFIG.evaluator.maxDifferenceTypeFrequency;
    }

    typesClumpedUp(board:BoardState)
    {
        const maxRoutesOfSameType = CONFIG.evaluator.maxRoutesOfSameTypeAtPoint;
        for(const point of board.getPoints())
        {
            const routeTypes = [];
            const routesHere : Route[] = point.metadata.routes;
            for(const route of routesHere)
            {
                if(route.multi) { continue; }
                routeTypes.push(route.getMainType());
            }

            const counts = countElementsInArray(routeTypes);
            const maxCount = Math.max(...Object.values(counts));
            if(maxCount > maxRoutesOfSameType) { return true; }
        }
        return false;
    }

    pointsWithBadConnections(board:BoardState)
    {
        const minConnections = CONFIG.generation.minConnectionsPerPoint;
        for(const point of board.getPoints())
        {
            if(point.countConnections() < minConnections) { return true; }
        }
        return false;
    }

    allPointsConnected(board:BoardState)
    {
        const points = board.getPoints();
        const startingPoint = points[0];
        const checked = [];
        const unchecked = [startingPoint]; 

        console.log(startingPoint);

        while(unchecked.length > 0)
        {
            const p = unchecked.pop();
            const alreadyChecked = checked.includes(p);
            if(alreadyChecked) { continue; }

            checked.push(p);
            const myRoutes : Route[] = p.metadata.routes;
            for(const route of myRoutes)
            {
                if(route.disabled) { continue; }
                const conn = route.getOther(p);
                unchecked.push(conn);
            }
        }

        console.log(checked.length);
        console.log(points.length);

        return checked.length == points.length;
    }

    allPointsAdequatelyConnected(board:BoardState)
    {
        // This is an extremely expensive check, so not sure if this should be enabled
        if(!CONFIG.evaluator.performTakeRouteAwayCheck) { return true; }

        // For each route, it takes it away (temporarily), then checks if everything is still connected
        // If not, this one route is way too important and would block the game if allowed
        for(const r of board.getRoutes())
        {
            r.disabled = true;
            if(!this.allPointsConnected(board)) { return false; }
            r.disabled = false;
        }

        return true;
    }

    routesOverlap(board:BoardState)
    {
        const routes = board.getRoutes();
        for(const route1 of routes)
        {
            for(const route2 of routes)
            {
                const sameRoute = route1 == route2;
                const sameSet = route1.set && route1.set.has(route2);
                if(sameRoute || sameSet) { continue; }

                // pathSimple is just a rough approximation of the path with fewer points
                // for performance reasons
                if(pathIntersectsPath(route1.pathSimple, route2.pathSimple)) { return true; }
            }
        }
        return false;
    }

    pointOverlapsRoute(board:BoardState)
    {
        const minDistToUnconnectedRoute = 2*CONFIG.generation.cityRadius;
        const cities = board.getPoints();
        const routes = board.getRoutes();
        for(const city of cities)
        {
            const myRoutes = city.metadata.routes;
            for(const route of routes)
            {
                const connectedToThisRoute = myRoutes.includes(route);
                if(connectedToThisRoute) { continue; } // if we're connected, we're obviously allowed to overlap the route

                // rough check against the line, not the curved path
                const dist = distToPath(city, route.pathSimple);
                if(dist > minDistToUnconnectedRoute) { continue; }
                return true;
            }
        }
        return false;
    }
}