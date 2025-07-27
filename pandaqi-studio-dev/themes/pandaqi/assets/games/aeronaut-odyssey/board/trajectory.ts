import Route from "./route";
import CONFIG from "./config";
import { BONUSES } from "./dict";
import { Vector2Graph, LineGraph, clamp } from "lib/pq-games";

export default class Trajectory
{
    start: Vector2Graph;
    end: Vector2Graph;
    score: number;
    bonus: string;
    bonusNumber: number;
    shortestPath: Vector2Graph[];
    
    constructor(start:Vector2Graph, end:Vector2Graph)
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
        const routes : Route[] = (line.start as Vector2Graph).metadata.routes;
        for(const route of routes)
        {
            if(route.matches(line)) { return route; }
        }
        return null;
    }

    getPathFindBlockLength()
    {
        const pfConfig = 
        {
            neighborFunction: (point:Vector2Graph) => { return point.getConnectionsByLine(); },
            costFunction: (line:LineGraph, score:number) => { 
                const r = this.getRouteBetween(line);
                return r ? r.getBlockLength() : Infinity;
            }
        }

        const pf = new PathFinder(pfConfig);
        const shortestPath = pf.getPath({ start: this.start, end: this.end });
        this.shortestPath = shortestPath;

        let pathBlockLength = 0;
        for(let i = 0; i < (shortestPath.length - 1); i++)
        {
            const p1 = shortestPath[i];
            const p2 = shortestPath[i+1];
            const route = this.getRouteBetween(p1.getConnectionLineTo(p2));
            pathBlockLength += route.getBlockLength();
        }

        return pathBlockLength;
    }

    calculateScore(maxDist:number)
    {
        const scorePerBlock = CONFIG.generation.trajectoryScorePerBlock;
        const multiplierForBoardSize = CONFIG.generation.trajectoryVector2sMultiplier[CONFIG.boardSize];
        const randomization = CONFIG.generation.trajectoryScoreRandomization.random();
        const length = this.getPathFindBlockLength();
        const score = Math.round(length * scorePerBlock * multiplierForBoardSize * randomization);
        this.score = score;
        return score;
    }

    // this is a transformation of the score, based on how valuable I think the bonus type is
    calculateBonusNumber()
    {
        const value = BONUSES[this.bonus].value ?? 1;
        const number = clamp(Math.round(this.score / value), 1, Infinity);
        this.bonusNumber = number;
    }

    getCityNamesAlphabetical()
    {
        let names = [this.start.metadata.cityName, this.end.metadata.cityName];
        const sort = names[0].localeCompare(names[1]);
        if(sort <= 0) { return names; }
        return names.reverse();
    }
}