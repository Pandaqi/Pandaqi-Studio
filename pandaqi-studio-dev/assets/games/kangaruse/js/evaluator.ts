import BoardState from "./boardState"
import CONFIG from "./config"

export default class Evaluator
{
    constructor() {}
    isValid(board:BoardState)
    {
        if(board.fail) { return false; }

        // CHECK: If too many score types slipped in anyway
        const scoreTypes = board.getTypesWithProperty("score");
        if(scoreTypes.length > CONFIG.maxScoreTypes) { return false; }

        // CHECK: Ensure that score squares are distributed properly. (Count how many exist in each _quarter_ of the field. This number should be > 2 and not too far from the others.)
        const scoreCells = board.getCellsWithProperty("score");
        const cellsPerQuadrant = [0,0,0,0];
        for(const cell of scoreCells)
        {
            let quadrant = board.getQuadrantForCell(cell);
            cellsPerQuadrant[quadrant]++;
        }

        let minPerQ = CONFIG.evaluator.minScoreCellsPerQuadrant;
        if(scoreCells.length < minPerQ*4) { minPerQ = 0; } // for very tiny boards

        let maxDist = 0;
        for(const num1 of cellsPerQuadrant)
        {
            if(num1 < minPerQ) { return false; }
            for(const num2 of cellsPerQuadrant)
            {
                maxDist = Math.max(maxDist, Math.abs(num2 - num1))
            }
        }

        if(maxDist > CONFIG.evaluator.maxScoreDifferencePerQuadrant) { return false; }
        
        // CHECK: Make sure starting positions (if enabled) are reasonably spread out
        const startingPositions = board.getCellsOfType("starting_position");
        let closestDist = Infinity;
        for(const p1 of startingPositions)
        {
            for(const p2 of startingPositions)
            {
                if(p1 == p2) { continue; }
                const dist = Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
                closestDist = Math.min(closestDist, dist);
            }
        }

        if(closestDist < CONFIG.evaluator.minDistBetweenStartingPositions) { return false; }

        // CHECK: Find the _biggest_ connected group of holes. This may not be too large. (It means holes have clumped up, looks and plays badly)
        const holeClumps = board.getHoleClumps();
        let biggestHoleClump = -1;
        for(const clump of holeClumps)
        { 
            biggestHoleClump = Math.max(biggestHoleClump, clump.count());
        }

        if(biggestHoleClump > CONFIG.evaluator.maxHoleClumpSize) { return false; }

        // CHECK: If all areas are reachable
        const reachableGroups = board.getConnectedReachableGroups();
        if(reachableGroups.length > 1) { return false; }
        
        // CHECK: If all mistletoebirds are close enough to the edge to make their action (wrap board) useful
        const mistletoeBirds = board.getCellsOfType("mistletoebird");
        for(const birdCell of mistletoeBirds)
        {
            const distToEdge = board.getDistToEdge(birdCell);
            if(distToEdge >= 4) { return false; }
        }

        return true; 
    }
}