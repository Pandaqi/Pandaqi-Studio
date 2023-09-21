import countElementsInArray from "js/pq_games/tools/logic/countElementsInArray";
import BoardState from "./boardState";
import CONFIG from "./config"

export default class Evaluator
{
    isValid(board:BoardState) : boolean
    {
        if(!this.typesFairlyDistributed(board)) { return false; }
        if(this.typesClumpedUp(board)) { return false; }
        if(this.pointsWithBadConnections(board)) { return false; }
        if(!this.allPointsConnected(board)) { return false; }
        if(!this.allPointsAdequatelyConnected(board)) { return false; }

        return true;
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
            for(const route of point.metadata.routes)
            {
                routeTypes.push(route.type);
            }

            const counts = countElementsInArray(routeTypes);
            const maxCount = Math.max(...Object.values(counts));
            if(maxCount >= maxRoutesOfSameType) { return true; }
        }
        return false;
    }

    pointsWithBadConnections(board:BoardState)
    {
        for(const point of board.getPoints())
        {
            if(point.countConnections() <= 1) { return true; }
        }
        return false;
    }

    allPointsConnected(board:BoardState)
    {
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
            for(const route of p.metadata.routes)
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
        // For each route, it takes it away (temporarily), then checks if everything is still connected
        // If not, this one route is way too important and would block the game if allowed
        if(!CONFIG.evaluator.performTakeRouteAwayCheck) { return true; }

        for(const r of board.getRoutes())
        {
            r.disabled = true;
            if(!this.allPointsConnected(board)) { return false; }
            r.disabled = false;
        }

        return true;
    }
}