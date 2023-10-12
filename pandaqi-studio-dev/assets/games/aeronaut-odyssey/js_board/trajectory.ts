import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import PathFinder from "js/pq_games/tools/pathFinder/pathFinder";
import Route from "./route";
import CONFIG from "./config";
import clamp from "js/pq_games/tools/numbers/clamp";
import LineGraph from "js/pq_games/tools/geometry/lineGraph";
import { BONUSES } from "./dict";

export default class Trajectory
{
    start: PointGraph;
    end: PointGraph;
    score: number;
    bonus: string;
    bonusNumber: number;
    lengthBucket: string;
    
    constructor(start:PointGraph, end:PointGraph)
    {
        // city names should be displayed alphabetically, is cleaner and easier to understand
        const sort = start.metadata.cityName.localeCompare(end.metadata.cityName);
        if(sort > 0)
        {
            const temp = start;
            start = end;
            end = temp;
        }

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

    calculateScore()
    {
        const pfConfig = 
        {
            neighborFunction: (point:PointGraph) => { return point.getConnectionsByLine(); },
            costFunction: (line:LineGraph, score:number) => { 
                const r = this.getRouteBetween(line);
                return r ? r.getBlockLength() : 1000000;
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

    setLengthBucket(bc:string)
    {
        this.lengthBucket = bc;
        // @NOTE: to extra reward the risky long routes
        this.enhanceScore(CONFIG.generation.trajectoryLengthReward[bc] ?? 1.0);
    }

    enhanceScore(ds:number)
    {
        this.score = Math.ceil(this.score*ds);
    }

    // this is a transformation of the score, based on how valuable I think the bonus type is
    calculateBonusNumber()
    {
        const value = BONUSES[this.bonus].value ?? 1;
        const number = clamp(Math.round(this.score / value), 1, Infinity);
        this.bonusNumber = number;
    }
}