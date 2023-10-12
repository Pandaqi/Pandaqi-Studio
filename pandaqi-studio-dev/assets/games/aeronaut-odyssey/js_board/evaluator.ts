import countElementsInArray from "js/pq_games/tools/collections/countElementsInArray";
import BoardState from "./boardState";
import CONFIG from "./config"
import Route from "./route";
import pathIntersectsPath from "js/pq_games/tools/geometry/intersection/pathIntersectsPath";
import distToPath from "js/pq_games/tools/geometry/distance/distToPath";
import Point from "js/pq_games/tools/geometry/point";
import { rectIntersectsRect } from "js/pq_games/tools/geometry/intersection/shapeIntersectsShape";

export default class Evaluator
{
    isValid(board:BoardState) : boolean
    {
        if(!CONFIG.evaluator.enable) { return true; }
        if(board.failed) { return false; }
        return true;
    }

    removeInvalidGraphParts(board:BoardState)
    {
        if(!CONFIG.evaluator.enable) { return true; }
        if(!CONFIG.evaluator.performGraphRemovals) { return true; }

        // @TODO: sometimes a route has no pathSimple ... figure out why, instead of brute forcing removing
        const routes = board.getRoutes();
        for(let i = routes.length - 1; i >= 0; i--)
        {
            if(routes[i].pathSimple) { continue; }
            board.routesManager.remove(routes[i]);
        }

        // check nasty situations that occur infrequently, then just REMOVE the troublemakers
        this.removeRoutesOverlappingForbiddenRectangles(board);
        this.removeRoutesOverlappingRoutes(board);
        this.removePointsOverlappingRoute(board); 

        const points = board.getPoints();
        for(let i = points.length - 1; i >= 0; i--)
        {
            if(points[i].countConnections() > 0) { continue; }
            board.pointsManager.remove(points[i]);
        }
    }

    areRoutesValid(board:BoardState)
    {
        if(!CONFIG.evaluator.enable) { return true; }

        // @DEBUGGING
        //return true;

        if(!this.enoughPoints(board)) { return false; }
        if(!this.enoughRoutes(board)) { return false; }

        // check if we use as much of the paper as possible
        if(this.boardTooSmall(board)) { return false; }

        // check type distribution (very cheap, do first)
        if(!this.typesFairlyDistributed(board)) { return false; }
        if(this.typesClumpedUp(board)) { return false; }

        // check graph connectedness (more expensive)
        if(this.pointsWithBadConnections(board)) { return false; }
        if(!this.allPointsConnected(board)) { return false; }
        if(!this.allPointsAdequatelyConnected(board)) { return false; }

        return true;
    }

    enoughPoints(board:BoardState)
    {
        const numPoints = board.pointsManager.count();
        const minimum = CONFIG.generation.numCityBounds.min - 1; // slight margin to allow some error/variety
        return numPoints >= minimum;
    }

    enoughRoutes(board:BoardState)
    {
        const numPoints = board.pointsManager.count();
        const numRoutes = board.routesManager.count();
        const minimum = Math.floor(CONFIG.generation.connectionBounds.min * numPoints * 0.925); // slight margin again
        return numRoutes >= minimum;
    }

    areTrajectoriesValid(board:BoardState)
    {
        if(!CONFIG.evaluator.enable) { return true; }
        return true; // @TODO: no specific checks for trajectories at this moment
    }

    boardTooSmall(board:BoardState)
    {
        let topLeft = new Point(Infinity, Infinity);
        let bottomRight = new Point(-Infinity, -Infinity);
        for(const point of board.getPoints())
        {
            topLeft.x = Math.min(topLeft.x, point.x);
            topLeft.y = Math.min(topLeft.y, point.y);
            bottomRight.x = Math.max(bottomRight.x, point.y);
            bottomRight.y = Math.max(bottomRight.y, point.y);
        }

        const minSpan = CONFIG.generation.minBoardSpan.lerp(CONFIG.boardClarityNumber);

        const dims = board.dims;
        const margin = 0.5*(1.0 - minSpan);
        if(topLeft.x < margin || topLeft.y < margin) { return true; }
        if(dims.x - bottomRight.x < margin || dims.y - bottomRight.y < margin) { return true; }
        return false;
    }

    typesFairlyDistributed(board:BoardState)
    {
        const numTypeUsed = new Array(board.numBlockTypes).fill(0);
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

        const maxDist = CONFIG.evaluator.maxDifferenceTypeFrequency.lerp(CONFIG.boardClarityNumber);
        const dist = (mostUsed - leastUsed)
        return dist <= maxDist;
    }

    typesClumpedUp(board:BoardState)
    {
        const maxRoutesOfSameType = Math.round(CONFIG.evaluator.maxRoutesOfSameTypeAtPoint.lerp(CONFIG.boardClarityNumber));

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
        const minConnections = Math.round(CONFIG.generation.minConnectionsPerPoint.lerp(CONFIG.boardClarityNumber));
        for(const point of board.getPoints())
        {
            if(point.countConnections() < minConnections) { return true; }
        }
        return false;
    }

    allPointsConnected(board:BoardState)
    {
        if(!CONFIG.evaluator.performConnectivenessCheck) { return true; }

        const points = board.getPoints();
        const startingPoint = points[0];
        const checked = [];
        const unchecked = [startingPoint]; 

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

        return checked.length == points.length;
    }

    allPointsAdequatelyConnected(board:BoardState)
    {
        // This is an extremely expensive check, so not sure if this should be enabled
        if(!CONFIG.evaluator.performTakeRouteAwayCheck) { return true; }
        if(CONFIG.boardClarityNumber <= 0.2) { return true; }

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

    removeRoutesOverlappingForbiddenRectangles(board:BoardState)
    {
        const routes = board.getRoutes();
        for(let i = routes.length-1; i >= 0; i--)
        {
            const route1 = routes[i];
            for(const rect of board.forbiddenAreas.get())
            {
                if(!rectIntersectsRect(route1.pathBoundingBox, rect)) { continue; }
                if(pathIntersectsPath(route1.pathSimple, rect.toPath()))
                {
                    board.routesManager.remove(route1);
                    break;
                }
            }
        }
    }

    removeRoutesOverlappingRoutes(board:BoardState)
    {
        const routes = board.getRoutes();
        for(let i = routes.length-1; i >= 0; i--)
        {
            const route1 = routes[i];
            for(const route2 of routes)
            {
                const sameRoute = route1 == route2;
                const sameSet = route1.set && route1.set.has(route2);
                if(sameRoute || sameSet) { continue; }

                // pathSimple is just a rough approximation of the path with fewer points
                // for performance reasons
                if(!rectIntersectsRect(route1.pathBoundingBox, route2.pathBoundingBox)) { continue; }
                if(pathIntersectsPath(route1.pathSimple, route2.pathSimple)) 
                {
                    board.routesManager.remove(route1);
                    break;
                }
            }
        }
    }

    removePointsOverlappingRoute(board:BoardState)
    {
        const minDistToUnconnectedRoute = 2*CONFIG.generation.cityRadius;
        const cities = board.getPoints();
        const routes = board.getRoutes();
        for(let i = cities.length-1; i >= 0; i--)
        {
            const city = cities[i];
            const myRoutes = city.metadata.routes;
            for(const route of routes)
            {
                const connectedToThisRoute = myRoutes.includes(route);
                if(connectedToThisRoute) { continue; } // if we're connected, we're obviously allowed to overlap the route

                // rough check against the line, not the curved path
                const dist = distToPath(city, route.pathSimple);
                if(dist > minDistToUnconnectedRoute) { continue; }
                
                board.pointsManager.remove(city);
                break;
            }
        }
    }
}