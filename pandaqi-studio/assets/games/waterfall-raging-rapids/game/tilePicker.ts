import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { ACTIONS, ACTIONS_CONDITIONAL, CONDITIONS, GATES, GEMSTONES, TileType, WaterFlow } from "../shared/dict";
import Tile from "./tile";
import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles.slice(); }
    async generate()
    {
        this.tiles = [];
        
        this.generatePawns();
        this.generateTiles();

        console.log(this.tiles);
    }

    generatePawns()
    {
        if(!CONFIG.sets.pawns) { return; }

        for(let i = 0; i < CONFIG.generation.numPawnFrames; i++)
        {
            this.tiles.push(new Tile(TileType.PAWN, -1, "pawns_" + i));
        }
    }

    generateTiles()
    {
        // prepare the objects and numbers
        const arr : Tile[] = [];
        
        if(CONFIG.sets.base)
        {
            for(let i = 0; i < CONFIG.generation.numBaseTiles; i++)
            {
                arr.push(new Tile(TileType.REGULAR));
            }
        }

        if(CONFIG.sets.gates)
        {
            for(let i = 0; i < CONFIG.generation.numGateTiles; i++)
            {
                arr.push(new Tile(TileType.GATED));
            }
        }

        const totalNumTiles = arr.length;
        if(totalNumTiles <= 0) { return; }

        // prepare fair scores according to distribution
        const scores = [];
        const scoreDist:Record<number, number> = CONFIG.generation.scoreDistribution;
        for(const [score, perc] of Object.entries(scoreDist))
        {
            const num = Math.ceil(perc * totalNumTiles);
            for(let i = 0; i < num; i++)
            {
                scores.push(parseInt(score));
            }
        }
        shuffle(scores);

        // prepare a fair gemstone picker
        const gemstones = [];
        const picker = new BalancedFrequencyPickerWithMargin({
            options: Object.keys(GEMSTONES),
            maxDist: 2,
        })

        for(let i = 0; i < totalNumTiles; i++)
        {
            const num = CONFIG.generation.gemstonesPerTileBounds.randomInteger();
            gemstones.push(picker.pickMultiple(num));
        }
        shuffle(gemstones);

        // Split tiles into "1->1" "2->1" "1->2" and "2->2" (as in, 2 in, 2 out)
        // decide the water flow (how many inputs, how many outputs, where do they go)
        const numsPerSide = { input: [], output: [] };
        const waterFlowDist:Record<string, Record<number, number>> = CONFIG.generation.numInputsOutputsDistribution;
        for(const [side,dist] of Object.entries(waterFlowDist))
        {
            for(const [num,perc] of Object.entries(dist))
            {
                const numToAdd = Math.ceil(perc * totalNumTiles);
                for(let i = 0; i < numToAdd; i++)
                {
                    numsPerSide[side].push(num);
                }
            }
        }
        shuffle(numsPerSide.input);
        shuffle(numsPerSide.output);

        const leftFacingPerSide = { input: [], output: [] };
        for(let i = 0; i < totalNumTiles; i++)
        {
            leftFacingPerSide.input.push((i % 2) == 0);
            leftFacingPerSide.output.push((i % 2) == 0);
        }
        shuffle(leftFacingPerSide.input);
        shuffle(leftFacingPerSide.output);

        const waterFlows = [];
        for(let i = 0; i < totalNumTiles; i++)
        {
            const inputKey = leftFacingPerSide.input.pop() ? "topLeft" : "topRight";
            const numInputs = numsPerSide.input.pop();

            const outputKey = leftFacingPerSide.output.pop() ? "bottomLeft" : "bottomRight";
            const numOutputs = numsPerSide.output.pop();

            const flow:WaterFlow = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false };
            
            flow[inputKey] = true;
            if(numInputs == 2) { flow.topLeft = true; flow.topRight = true; }

            flow[outputKey] = true;
            if(numOutputs == 2) { flow.bottomLeft = true; flow.bottomRight = true; }

            waterFlows.push(flow);
        }

        // pick actions and gates fairly
        const actions = [];
        const gates = [];
        const numConditionalActions = Math.floor(CONFIG.generation.conditionalActionsPercentage * totalNumTiles);
        for(let i = 0; i < arr.length; i++)
        {
            if(CONFIG.useConditionalActions && i < numConditionalActions) {
                const cond = getWeighted(CONDITIONS);
                const reward = getWeighted(ACTIONS_CONDITIONAL);
                const finalString = CONDITIONS[cond].desc + ", " + ACTIONS_CONDITIONAL[reward].desc;
                actions.push(finalString);
            } else {
                actions.push(getWeighted(ACTIONS));
            }

            const tile = arr[i];
            if(tile.type == TileType.GATED)
            {
                gates.push(getWeighted(GATES));
            }
        }

        shuffle(actions);
        shuffle(gates);

        // finally, assign all this information to the tiles, and add them to the overall list
        for(const tile of arr)
        {
            tile.setScore(scores.pop());
            tile.setGemstones(gemstones.pop());
            tile.setAction(actions.pop());
            tile.setWaterFlow(waterFlows.pop());

            if(tile.type == TileType.GATED)
            {
                tile.setGate(gates.pop());
            }

            this.tiles.push(tile);
        }
    }
}