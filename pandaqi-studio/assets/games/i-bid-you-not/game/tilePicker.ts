import range from "js/pq_games/tools/random/range";
import CONFIG from "../shared/config";
import { TYPES } from "../shared/dict";
import Tile from "./tile";
import Bounds from "js/pq_games/tools/numbers/bounds";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles.slice(); }
    async generate()
    {
        this.tiles = [];

        this.generateTilesFor("base");
        this.generateTilesFor("oddInventions");
        this.generateTilesFor("doubleDevices");

        console.log(this.tiles);
    }

    generateTilesFor(set:string)
    {
        if(!CONFIG.sets[set]) { return; }

        const dir = CONFIG.tiles.generation.setStaggerDir[set] ?? 1;

        // sort types based on starting number (low to high)
        // (this just makes the algorithm much faster and cleaner, it's not crucial)
        const typesSorted = [];
        for(const [key,data] of Object.entries(TYPES))
        {
            const typeSet = data.set ?? "base";
            if(typeSet != set) { continue; }
            typesSorted.push({ key: key, val: data.val });
        }
        typesSorted.sort((a,b) => {
            return dir*a.val - dir*b.val;
        });

        let numTilesNeeded = 0;
        for(const typeObj of typesSorted)
        {
            const freq = TYPES[typeObj.key].freq ?? CONFIG.tiles.generation.defaultFreqPerType;
            numTilesNeeded += freq;
        }

        // prepare price numbers for random drawing
        const dist = CONFIG.tiles.generation.priceNumberDistribution.slice();
        const numDistCopies = Math.ceil(numTilesNeeded / dist.length);
        const priceNumbers = [];
        for(let i = 0; i < numDistCopies; i++)
        {
            for(const num of dist)
            {
                priceNumbers.push(num);
            }
        }
        shuffle(priceNumbers);

        // then start adding them using a stagger algorithm
        const numbersTaken = [];
        const staggerConstant = CONFIG.tiles.generation.staggerConstant as number;
        const staggerBounds = CONFIG.tiles.generation.staggerBounds as Bounds;
        const setBounds = CONFIG.tiles.generation.setNumBounds[set];
        
        for(const typeObj of typesSorted)
        {
            const type = typeObj.key;
            const data = TYPES[type];
            const freq = data.freq ?? CONFIG.tiles.generation.defaultFreqPerType;
            
            const actionsPossible = data.actions ?? [];
            const actionsSpecific = [];
            if(actionsPossible.length > 0)
            {
                for(let i = 0; i < freq; i++)
                {
                    if(i < 0.5*freq) { actionsSpecific.push(actionsPossible[0]); }
                    else { actionsSpecific.push(actionsPossible[1]); }
                }
            }
            shuffle(actionsSpecific);

            let val = data.val;
            for(let i = 0; i < freq; i++)
            {
                val = this.findFirstAvailableValueFrom(val, dir, numbersTaken, setBounds);
                if(val == null) { break; }

                const action = actionsSpecific.length > 0 ? actionsSpecific.pop() : "";
                const price = priceNumbers.length > 0 ? priceNumbers.pop() : 0;
                
                const newTile = new Tile(type, val, price, action);
                this.tiles.push(newTile);
                numbersTaken.push(val);

                const randStagger = Math.round( staggerBounds.random() * staggerConstant * (i+1) );
                val += dir * randStagger;
            }
        }
    }

    findFirstAvailableValueFrom(val:number, dir: number = 1, numbersTaken: number[], setBounds: Bounds)
    {
        if(!setBounds.contains(val)) { return null; }
        if(!numbersTaken.includes(val)) { return val; }

        while(numbersTaken.includes(val))
        {
            val += dir;
            if(!setBounds.contains(val)) { return null; }
        }

        return val;
    }
}