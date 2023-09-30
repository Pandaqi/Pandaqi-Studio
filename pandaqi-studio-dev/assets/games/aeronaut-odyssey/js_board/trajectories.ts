import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import BoardState from "./boardState";
import CONFIG from "./config";
import Trajectory from "./trajectory";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class Trajectories
{
    rectangle: Rectangle;
    num: number;
    list: Trajectory[];
    boardState: BoardState;

    constructor(boardState)
    {
        this.boardState = boardState;
    }
    
    generatePre()
    {
        this.rectangle = new Rectangle({ extents: new Point() });
        if(!CONFIG.expansions.trajectories) { return; }

        const numTrajectories = rangeInteger(CONFIG.generation.numTrajectoryBounds);
        const trajectorySize = CONFIG.generation.trajectorySize; // relative to block size
        const size = trajectorySize.clone().scale(new Point(1, numTrajectories));
        const rect = new Rectangle().fromBottomRight(this.boardState.dims, size);
        this.num = numTrajectories;
        this.rectangle = rect;   
    }

    generatePost()
    {
        const trajectories : Trajectory[] = [];
        const points = this.boardState.getPoints();
        
        const maxPoints = CONFIG.generation.maxTrajectoryPoints;

        // we want variety in the route lengths
        // so we divide it into three chunks (small, medium, large) and try to get them close to even
        // though with some margin of error
        const bucketThresholds = { small: maxPoints / 3, medium: 2*maxPoints / 3 }
        const numPerSizeBucket = { small: 0, medium: 0, large: 0 }
        const margin = CONFIG.generation.trajectoryVarietyMarginFactor;
        const maxPerBucket = Math.ceil(this.num / 3.0) * margin;

        while(trajectories.length < this.num)
        {
            const start = fromArray(points);
            const end = fromArray(points);
            const traj = new Trajectory(start, end);
            if(!traj.isValid()) { continue; }
            if(traj.matchesAny(trajectories)) { continue; }

            traj.calculateScore();

            let bucket = "large"
            if(traj.score <= bucketThresholds.small) { bucket = "small"; }
            else if(traj.score <= bucketThresholds.medium) { bucket = "medium"; }
        
            const bucketAlreadyFull = numPerSizeBucket[bucket] >= maxPerBucket;
            if(bucketAlreadyFull) { continue; }

            numPerSizeBucket[bucket]++;
            trajectories.push(traj);
        }
        this.list = trajectories;

        console.log("== TRAJECTORIES ==");
        console.log(trajectories);
    }
}