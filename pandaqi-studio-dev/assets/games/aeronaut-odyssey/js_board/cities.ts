import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import BoardState from "./boardState";
import Route from "./route";

export default class Cities
{
    points: PointGraph[];
    boardState: BoardState;

    constructor(b:BoardState, points:PointGraph[])
    {
        this.boardState = b;
        this.points = points;
    }

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
}