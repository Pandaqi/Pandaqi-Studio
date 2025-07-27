import BoardState from "./boardState";
import Route from "./route";
import CONFIG from "./config";
import { Vector2Graph, range, clamp } from "lib/pq-games";

export default class Cities
{
    points: Vector2Graph[];
    boardState: BoardState;
    capital: Vector2Graph;

    constructor(b:BoardState, points:Vector2Graph[])
    {
        this.boardState = b;
        this.points = points;
    }

    getCapital() { return this.capital; }
    count() { return this.get().length; }
    get() { return this.points; }
    remove(p:Vector2Graph)
    {
        //console.log("Should remove point ", p);
        
        const routes : Route[] = p.metadata.routes ?? [];
        for(let i = routes.length-1; i >= 0; i--)
        {
            this.boardState.routesManager.remove(routes[i]);
        }

        p.removeAllConnections();
        this.points.splice(this.points.indexOf(p), 1);
    }
    
    generatePost()
    {
        this.assignVisitorSpots();
        this.assignCapital();
    }

    assignVisitorSpots()
    {
        const spotBounds = CONFIG.generation.visitorSpotBounds;

        for(const point of this.points)
        {
            const numSpotsPerRoute = range(CONFIG.generation.numVisitorSpotsPerRoute);
            const numRoutes = point.metadata.routes.length;
            const numSpots = clamp(numRoutes * numSpotsPerRoute, spotBounds.min, spotBounds.max);
            point.metadata.numVisitorSpots = Math.round(numSpots);
        }
    }

    assignCapital()
    {
        let secondBestVector2 = null;
        let bestVector2 = null;
        let bestScore = 0;
        for(const point of this.points)
        {
            const numRoutes = point.metadata.routes.length;
            if(numRoutes <= bestScore) { continue; }
            secondBestVector2 = null;

            if(!point.metadata.nearCenter) { continue; }
            bestScore = numRoutes;
            bestVector2 = point;
        }

        const finalVector2 = bestVector2 ?? secondBestVector2;

        this.capital = finalVector2;
        finalVector2.metadata.numVisitorSpots = CONFIG.generation.numVisitorSpotsAtCapital;
        finalVector2.metadata.capital = true;
    }
}