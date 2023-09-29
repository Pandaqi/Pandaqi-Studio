import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import PathFinder from "js/pq_games/tools/pathFinder/pathFinder";
import Route from "./route";
import CONFIG from "./config";
import clamp from "js/pq_games/tools/numbers/clamp";
import LineGraph from "js/pq_games/tools/geometry/lineGraph";

export default class Trajectory
{
    start: PointGraph;
    end: PointGraph;
    score: number;
    
    constructor(start:PointGraph, end:PointGraph)
    {
        this.start = start;
        this.end = end;
    }

    isValid() { return this.start && this.end && (this.start != this.end); }
    matches(t:Trajectory)
    {
        return (this.start == t.start && this.end == t.end) || (this.start == t.end && this.end == t.start);
    }

    matchesAny(list:Trajectory[])
    {
        for(const elem of list)
        {
            if(this.matches(elem)) { return true; }
        }
        return false;
    }

    getRouteBetween(line:LineGraph) : Route
    {
        const routes : Route[] = (line.start as PointGraph).metadata.routes;
        for(const route of routes)
        {
            if(route.matches(line)) { return route; }
        }
        return null;
    }

    getMaxTrajectoryLength()
    {
        const blocksFactor = CONFIG.generation.numBlocksFullWidthMultipliers[CONFIG.boardSize];
        const maxLength = CONFIG.generation.maxTrajectoryLength * CONFIG.generation.numBlocksFullWidth * blocksFactor;
        return Math.round(maxLength);
    }

    // @TODO: An alternative is just to say "find ANY route", but that might be wildly inaccurate if we're unlucky
    calculateScore()
    {
        const pfConfig = 
        {
            neighborFunction: (point:PointGraph) => { return point.getConnectionsByLine(); },
            costFunction: (line:LineGraph, score:number) => { 
                return this.getRouteBetween(line).getBlockLength()
            }
        }

        const pf = new PathFinder(pfConfig);
        const shortestPath = pf.getPath({ start: this.start, end: this.end });
        let pathBlockLength = 0;
        for(let i = 0; i < (shortestPath.length - 1); i++)
        {
            const p1 = shortestPath[i];
            const p2 = shortestPath[i+1];
            const route = this.getRouteBetween(p1.getConnectionLineTo(p2));
            pathBlockLength += route.getBlockLength();
        }

        const length = clamp(pathBlockLength / this.getMaxTrajectoryLength(), 0.05, 1.0);
        this.score = Math.round(length * CONFIG.generation.maxTrajectoryPoints);
        return this.score;
    }
}