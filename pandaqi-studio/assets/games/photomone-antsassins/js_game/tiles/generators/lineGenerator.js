import RandomWalk from "../../tools/randomWalk"
import RandomWalkPathfind from "../../tools/randomWalkPathfind"
import Random from "js/pq_games/tools/random/main"
import Pathfinder from "js/pq_games/tools/pathfinder/pathfinder"

export default class LineGenerator
{
    constructor()
    {
        this.visualType = "lines"
    }

    generate(config)
    {
        if(config.randomWalk.version == "simple") { this.createLinesSimple(config); }
        else if(config.randomWalk.version == "multi") { this.createLinesMulti(config); }
    }

    getLines() { return this.randomWalks; }
    getMaxPossibleLines(config)
    {
        const linesPerCell = config.shape.getNeighbors().length;
        const numCells = config.gridPoints.length;
        return numCells * linesPerCell / 2; // otherwise we count each edge double
    }

    createLinesMulti(config)
    {
        this.randomWalks = {};

        const pathfinder = new Pathfinder();
        const costMap = pathfinder.assignRandomWeights({ map: config.gridPoints });
        config.randomWalk.costMap = costMap;
        config.randomWalk.dotsBetweenDist = config.shape.getDistToNeighbour(config.tiles.gridResolution);

        let randomWalkTypes = Object.keys(config.randomWalk.types);
        Random.shuffle(randomWalkTypes);
        const maxTypes = Math.min(randomWalkTypes.length, config.randomWalk.maxTypesPerTile);
        randomWalkTypes = randomWalkTypes.slice(0, maxTypes);

        let maxLines = config.randomWalk.maxLinesPerTile * this.getMaxPossibleLines(config);
        let counter = -1;

        for(const type of randomWalkTypes)
        {
            this.randomWalks[type] = [];
        }

        const edgePathProbability = config.randomWalk.enhancements_v2.edgeLineProbability;
        let numFailedLinesInARow = 0;
        while(maxLines > 0)
        {
            if(numFailedLinesInARow >= randomWalkTypes.length) { break; }
            counter = (counter + 1) % randomWalkTypes.length;

            const type = randomWalkTypes[counter];
            const lineIndex = config.randomWalk.types[type];

            config.randomWalk.targetLineIndex = lineIndex;
            config.randomWalk.maxLength = maxLines;
            const w = new RandomWalkPathfind(config, config.gridPoints);
            if(w.hasFailed()) { numFailedLinesInARow++; continue; }
            
            maxLines -= w.getLength();
            this.randomWalks[type].push(w);
            numFailedLinesInARow = 0;

            if(config.randomWalk.enhancements_v2.edgeLines)
            {
                const addEdgePath = Math.random() <= edgePathProbability;
                if(!addEdgePath) { continue; }
                if(w.wasHalved()) { continue; }
    
                config.randomWalk.maxLength = Infinity;
                config.randomWalk.completeEdgeWalk = true;
                config.randomWalk.forcedExtremes = { start: w.getStart(), end: w.getEnd() };
                
                const w2 = new RandomWalkPathfind(config, config.gridPoints);
                config.randomWalk.completeEdgeWalk = false;
                config.randomWalk.forcedExtremes = null;
    
                if(w2.hasFailed()) { continue; }
    
                this.randomWalks[type].push(w2);
                maxLines -= w2.getLength(); // @TODO: don't count these for max lines?
            }
        }
    }

    createLinesSimple(config)
    {
        this.randomWalks = [];

        const maxNumLines = config.gridPoints.length; 
        const minLines = Math.floor(config.randomWalk.numLines.min * maxNumLines);
        const maxLines = Math.ceil(config.randomWalk.numLines.max * maxNumLines);
        let finalNumLines = Random.rangeInteger(minLines, maxLines);

        let counter = 0;

        const edgeWalkInterval = 3;
        const edgeWalkOffset = Math.floor(Math.random() * edgeWalkInterval);
        const numBoundedAreas = 4;
        const boundedAreaOffset = Math.floor(Math.random() * numBoundedAreas);
        config.randomWalk.numBoundedAreas = numBoundedAreas;

        while(finalNumLines > 0)
        {
            let forceStart = "inside";
            const edgeWalkIndex = (counter + edgeWalkOffset);
            let boundedArea = (boundedAreaOffset + counter) % numBoundedAreas;
            if((edgeWalkIndex % edgeWalkInterval) == 0) { forceStart = "edge"; }
            counter++;

            config.randomWalk.forceStart = forceStart;
            config.randomWalk.boundedArea = boundedArea;
            config.randomWalk.linesLeft = finalNumLines;

            const linesPreviousWalk = this.randomWalks.length > 0 ? this.randomWalks[this.randomWalks.length - 1].getLength() : null;
            config.randomWalk.linesPreviousWalk = linesPreviousWalk;

            const w = new RandomWalk(config, config.gridPoints);
            const linesUsed = w.getLength();
            if(linesUsed <= 0 || w.hasFailed()) { continue; }

            this.randomWalks.push(w);
            finalNumLines -= linesUsed;
        }
    }
}