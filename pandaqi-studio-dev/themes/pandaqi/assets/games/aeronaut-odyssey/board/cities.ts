import PointGraph from "lib/pq-games/tools/geometry/pointGraph";
import BoardState from "./boardState";
import Route from "./route";
import CONFIG from "./config";
import range from "lib/pq-games/tools/random/range";
import clamp from "lib/pq-games/tools/numbers/clamp";

export default class Cities
{
    points: PointGraph[];
    boardState: BoardState;
    capital: PointGraph;

    constructor(b:BoardState, points:PointGraph[])
    {
        this.boardState = b;
        this.points = points;
    }

    getCapital() { return this.capital; }
    count() { return this.get().length; }
    get() { return this.points; }
    remove(p:PointGraph)
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
        let secondBestPoint = null;
        let bestPoint = null;
        let bestScore = 0;
        for(const point of this.points)
        {
            const numRoutes = point.metadata.routes.length;
            if(numRoutes <= bestScore) { continue; }
            secondBestPoint = null;

            if(!point.metadata.nearCenter) { continue; }
            bestScore = numRoutes;
            bestPoint = point;
        }

        const finalPoint = bestPoint ?? secondBestPoint;

        this.capital = finalPoint;
        finalPoint.metadata.numVisitorSpots = CONFIG.generation.numVisitorSpotsAtCapital;
        finalPoint.metadata.capital = true;
    }
}