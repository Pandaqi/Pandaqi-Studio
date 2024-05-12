import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { ACTIONS, GEMSTONES, TileType } from "../js_shared/dict";
import Tile from "./tile";

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
        if(!CONFIG.sets.base) { return; }

        // prepare the objects and numbers
        const arr : Tile[] = [];
        const totalNumTiles = CONFIG.generation.numBaseTiles;

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
            gemstones.push(picker.pickNext());
        }
        shuffle(gemstones);

        // pick actions fairly
        const actions = [];
        const actionFreqs = {}; // only for debugging purposes
        for(const [key,data] of Object.entries(ACTIONS))
        {
            const min = data.min ?? 1;
            for(let i = 0; i < min; i++)
            {
                actions.push(key);
            }
            actionFreqs[key] = min;
        }


        while(actions.length < totalNumTiles)
        {
            const randAction = getWeighted(ACTIONS);
            actions.push(randAction);
            actionFreqs[randAction]++;
        }
        shuffle(actions);

        // finally, assign all this information to the tiles, and add them to the overall list
        for(let i = 0; i < totalNumTiles; i++)
        {
            const tile = new Tile(TileType.REGULAR);
            tile.setScore(scores.pop());
            tile.setGemstone(gemstones.pop());
            tile.setAction(actions.pop());
            this.tiles.push(tile);
        }

        // @DEBUGGING
        console.log("DEBUGGING => Gemstone picker", picker);
        console.log("DEBUGGING => Action freqs", actionFreqs);
    }
}