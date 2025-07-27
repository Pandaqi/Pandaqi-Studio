import { Vector2, countElementsInArray, rectIntersectsRect, pathIntersectsPath, distToPath } from "lib/pq-games";
import BoardState from "./boardState";
import CONFIG from "./config"
import Route from "./route";

export default class Evaluator
{
    log(valid:boolean, str:string, val:any = "")
    {
        if(!CONFIG.evaluator.log) { return; }
        if(valid) { return; }
        console.log("[REJECTED] " + str, val);
    }

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
        if(!this.averageRouteLengthAdequate(board)) { return false; }
        if(!this.expectedRouteLengthFulfilled(board)) { return false; }

        // check if we use as much of the paper as possible
        if(!this.boardLargeEnough(board)) { return false; }

        // check type distribution (very cheap, do first)
        if(!this.typesFairlyDistributed(board)) { return false; }
        if(!this.typesProperlySpreadOut(board)) { return false; }
        if(!this.noLongChainsOfSameType(board)) { return false; }

        // check graph connectedness (more expensive)
        if(!this.allPointsHaveProperConnections(board)) { return false; }
        if(!this.allPointsConnected(board)) { return false; }
        if(!this.allPointsAdequatelyConnected(board)) { return false; }

        return true;
    }

    expectedRouteLengthFulfilled(board:BoardState)
    {
        const lengths = [];
        const expLength = CONFIG.generation.expectedRouteLength[CONFIG.boardSize];
        for(let i = 1; i <= expLength; i++)
        {
            lengths.push(i);   
        }

        const routes = board.routesManager.get();
        for(const route of routes)
        {
            const length = route.getBlockLength();
            const idx = lengths.indexOf(length);
            if(idx < 0) { continue; }
            lengths.splice(idx, 1);

            const allLengthsFound = (lengths.length <= 0);
            if(allLengthsFound) { break; }
        }

        let valid = lengths.length <= 0;
        this.log(valid, "Didn't find routes of length: ", lengths);
        return valid;
    }

    averageRouteLengthAdequate(board:BoardState)
    {
        const routes = board.routesManager.get();
        let sum = 0;
        for(const route of routes)
        {
            sum += route.getBlockLength();
        }
        sum /= routes.length;

        const valid = CONFIG.generation.averageRouteLength.contains(sum);
        this.log(valid, "Average route length: " + sum + " vs ", CONFIG.generation.averageRouteLength);
        return valid;
    }

    enoughPoints(board:BoardState)
    {
        if(CONFIG.boardClarityNumber <= 0.15) { return true; }

        const numPoints = board.pointsManager.count();
        const multiplier = CONFIG.generation.numCityMultipliers[CONFIG.boardSize];
        const margin = CONFIG.generation.numCityMargins[CONFIG.boardSize];
        const minimum = Math.floor(CONFIG.generation.numCityBounds.min * multiplier * margin); // slight margin to allow some error/variety
        const valid = numPoints >= minimum;
        this.log(valid, "#Cities: " + numPoints + " vs " + minimum);
        return valid;
    }

    enoughRoutes(board:BoardState)
    {
        if(CONFIG.boardClarityNumber <= 0.15) { return true; }

        const numPoints = board.pointsManager.count();
        const numRoutes = board.routesManager.count() * 2; // routes go both ways!
        const margin = CONFIG.evaluator.connectionBoundsMargin;
        const minimum = Math.floor(CONFIG.generation.connectionBounds.min * numPoints * margin.min); // slight margin again
        const maximum = Math.ceil(CONFIG.generation.connectionBounds.max * numPoints * margin.max);

        const valid = numRoutes >= minimum && numRoutes <= maximum;
        this.log(valid, "#Routes: " + numRoutes + " vs interval (" + minimum + "," + maximum + ")");
        return valid;
    }

    areTrajectoriesValid(board:BoardState)
    {
        if(!CONFIG.evaluator.enable) { return true; }
        return true; // @TODO: no specific checks for trajectories at this moment
    }

    boardLargeEnough(board:BoardState)
    {
        let topLeft = new Vector2(Infinity, Infinity);
        let bottomRight = new Vector2(-Infinity, -Infinity);
        for(const point of board.getPoints())
        {
            topLeft.x = Math.min(topLeft.x, point.x);
            topLeft.y = Math.min(topLeft.y, point.y);
            bottomRight.x = Math.max(bottomRight.x, point.y);
            bottomRight.y = Math.max(bottomRight.y, point.y);
        }

        const minSpan = CONFIG.generation.minBoardSpan.lerp(CONFIG.boardClarityNumber);

        const size = board.size;
        const margin = 0.5*(1.0 - minSpan);
        let valid = true;
        if(topLeft.x < margin || topLeft.y < margin) { valid = false; }
        if(size.x - bottomRight.x < margin || size.y - bottomRight.y < margin) { valid = false; }
        this.log(valid, "Board span too small: ", { topLeft: topLeft, bottomRight: bottomRight, size: size });
        return valid;
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
        const valid = dist <= maxDist;
        this.log(valid, "Types unfairly distributed, max distance is " + dist + " (vs allowed " + maxDist + ")");
        return valid;
    }

    typesProperlySpreadOut(board:BoardState)
    {
        const maxRoutesOfSameType = Math.round(CONFIG.evaluator.maxRoutesOfSameTypeAtPoint.lerp(CONFIG.boardClarityNumber));

        let valid = true;
        let max = 0;
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
            max = maxCount;
            if(maxCount > maxRoutesOfSameType) { valid = false; break; }
        }
        this.log(valid, "Types clumped up. A point has " + max + " routes of same type (vs allowed " + maxRoutesOfSameType + ")");
        return valid;
    }

    noLongChainsOfSameType(board:BoardState)
    {
        const factor = CONFIG.evaluator.maxTypeChainClarityFactor.lerp(CONFIG.boardClarityNumber);
        const maxChainLength = Math.floor(CONFIG.evaluator.maxTypeChainLength[CONFIG.boardSize] * factor);

        const unhandled = board.getRoutes().slice();
        let valid = true;
        let longestChain = 0;
        const chains = {};
        while(unhandled.length > 0)
        {
            const r : Route = unhandled.pop();
            const curType = r.getMainType();
            const chain = [];
            const toCheck = [r];
            while(toCheck.length > 0)
            {
                const curRoute = toCheck.pop();
                chain.push(curRoute);

                const nbs : Route[] = [curRoute.start.metadata.routes, curRoute.end.metadata.routes].flat();
                for(const nb of nbs)
                {
                    if(toCheck.includes(nb) || chain.includes(nb)) { continue; }
                    if(nb.getMainType() != curType) { continue; }
                    toCheck.push(nb);
                }
            }

            if(!(curType in chains)) { chains[curType] = []; }
            chains[curType].push(chain);

            longestChain = chain.length;
            if(chain.length > maxChainLength) { valid = false; break; }

            for(const elem of chain)
            {
                unhandled.splice(unhandled.indexOf(elem), 1);
            }
        }
        this.log(valid, "Longest chain of same type is " + longestChain + " (vs allowed " + maxChainLength + ")");
        return valid;
    }

    allPointsHaveProperConnections(board:BoardState)
    {
        const minConnections = Math.round(CONFIG.generation.minConnectionsPerPoint.lerp(CONFIG.boardClarityNumber));
        let valid = true;
        for(const point of board.getPoints())
        {
            if(point.countConnections() < minConnections) { valid = false; break; }
        }
        this.log(valid, "A point has too few connections.");
        return valid;
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

        const valid = (checked.length == points.length);
        this.log(valid, "Not all points connected.");
        return valid;
    }

    allPointsAdequatelyConnected(board:BoardState)
    {
        // This is an extremely expensive check, so not sure if this should be enabled
        if(!CONFIG.evaluator.performTakeRouteAwayCheck) { return true; }
        if(CONFIG.boardClarityNumber <= 0.2) { return true; }

        // For each route, it takes it away (temporarily), then checks if everything is still connected
        // If not, this one route is way too important and would block the game if allowed
        let valid = true;
        for(const r of board.getRoutes())
        {
            r.disabled = true;
            if(!this.allPointsConnected(board)) { valid = false; }
            r.disabled = false;
            if(!valid) { break; }
        }
        this.log(valid, "Points not connected enough. (Hinges on one route.)");
        return valid;
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
        if(CONFIG.boardClarityNumber <= 0.2) { return; }

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
        if(CONFIG.boardClarityNumber <= 0.2) { return; }

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