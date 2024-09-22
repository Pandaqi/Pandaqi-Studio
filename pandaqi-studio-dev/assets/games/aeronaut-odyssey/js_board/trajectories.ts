import BoardState from "./boardState";
import CONFIG from "./config";
import Trajectory from "./trajectory";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";
import { BONUSES } from "./dict";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import range from "js/pq_games/tools/random/range";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import shuffle from "js/pq_games/tools/random/shuffle";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";

export default class Trajectories
{
    num: number;
    list: Trajectory[];
    boardState: BoardState;
    rectangle: Rectangle;

    constructor(boardState)
    {
        this.boardState = boardState;
    }
    
    get() { return this.list; }
    getRectangle() { return this.rectangle; }
    generatePre()
    {
        if(!CONFIG.expansions.trajectories) { return; }

        const mult = CONFIG.generation.numTrajectoryMultipliers[CONFIG.boardSize];
        const numTrajectories = Math.round(range(CONFIG.generation.numTrajectoryBounds) * mult);
        const trajectorySize = CONFIG.generation.trajectorySize; // relative to block size
        const size = trajectorySize.clone().scale(new Point(1, numTrajectories));
        this.num = numTrajectories;

        const offsetFromCorner = CONFIG.generation.calculatedTrajectoryRectOffset ?? new Point(0.125, 0.125);
        const fullPageDims = this.boardState.size;
        const anchor = fullPageDims.clone().sub(offsetFromCorner);

        const rect = new Rectangle().fromBottomRight(anchor, size);
        this.rectangle = rect;
        this.boardState.forbiddenAreas.add(rect); 
    }

    getMaxPointDistance(points:PointGraph[])
    {
        // first establish maximum distance, so we know what "small" / "medium" / "large" mean
        let maxDist = 0;
        let extremePoints = [null,null];
        for(const p1 of points)
        {
            for(const p2 of points)
            {
                const dist = p1.distTo(p2);
                if(dist > maxDist)
                {
                    extremePoints = [p1, p2];
                    maxDist = dist;
                }
            }
        }

        const tempTraj = new Trajectory(extremePoints[0], extremePoints[1]);
        const maxDistPathFind = tempTraj.getPathFindBlockLength();
        return { maxDist, maxDistPathFind };
    }

    createPointDistanceLookup(points:PointGraph[], maxDist:number)
    {
        const map : Map<PointGraph, any> = new Map();

        // now bucket everything according to that
        for(const p1 of points)
        {
            const dict = { small: [], medium: [], large: [] };
            for(const p2 of points)
            {
                const distRatio = p1.distTo(p2) / maxDist;
                let key = distRatio <= 0.33 ? "small" : (distRatio <= 0.66 ? "medium" : "large");
                dict[key].push(p2);
            }
            map.set(p1, dict);
        }

        return map;
    }

    generatePost()
    {
        if(!CONFIG.expansions.trajectories) { return; }

        const trajectories : Trajectory[] = [];
        const points = this.boardState.getPoints();
        let ensureBalance = CONFIG.generation.balanceTrajectoryLengths;
        
        let minScore = CONFIG.generation.minTrajectoryScore;
        if(!ensureBalance) { minScore = 0; }

        const { maxDist, maxDistPathFind } = this.getMaxPointDistance(points);
        const pointDistances = this.createPointDistanceLookup(points, maxDist);

        console.log(pointDistances);
        
        let pointsPossible = [];

        let sizes = ["small", "medium", "large"];
        let counter = rangeInteger(0, sizes.length-1);

        let numTries = 0;
        const maxTries = 150;

        while(trajectories.length < this.num)
        {
            numTries++;
            if(numTries > maxTries) { ensureBalance = false; }

            if(pointsPossible.length <= 0) 
            { 
                pointsPossible = points.slice();
                shuffle(pointsPossible);
            }

            // we only consider points we already know are at the right distance (small/medium/lage)
            const p1 = pointsPossible.pop();
            let possibleDestinations = pointDistances.get(p1)[sizes[counter]];
            if(!ensureBalance) { possibleDestinations = pointsPossible; }

            if(possibleDestinations.length <= 0) { continue; }
            
            const p2 = fromArray(possibleDestinations);
            const traj = new Trajectory(p1, p2);
            if(!traj.isValid()) { continue; }
            if(traj.matchesAny(trajectories)) { continue; }

            traj.calculateScore(maxDistPathFind); // we use PATHFIND one because now the trajectory will actually path find and get the real length
            if(traj.score < minScore) { continue; }

            trajectories.push(traj);
            counter = (counter + 1) % sizes.length;
        }


        for(const traj of trajectories)
        {
            // determine the specific bonuses this trajectory can have
            const possibleBonuses = structuredClone(BONUSES);
            for(const [key,data] of Object.entries(possibleBonuses))
            {
                let shouldDelete = false;
                // (abilities are too unpredictable/small to attach to trajectories, so reject those outright)
                if(data.ability) { shouldDelete = true; }

                // many rewards on long routes are pointless, as the game will be almost over and you can't use them anyway!
                const maxScore = data.maxScore ?? Infinity;
                const minScore = data.minScore ?? 0;
                if(traj.score > maxScore || traj.score < minScore) { shouldDelete = true; }

                if(!shouldDelete) { continue; }
                delete possibleBonuses[key];
            }

            let bonus = getWeighted(possibleBonuses);
            if(CONFIG.useRealMaterial) { bonus = "points"; }

            
            traj.bonus = bonus;
            traj.calculateBonusNumber();
        }

        this.list = trajectories;

        console.log("== TRAJECTORIES ==");
        console.log(trajectories);
    }
}