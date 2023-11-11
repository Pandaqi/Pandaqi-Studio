import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import Tile from "./tile";
import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles; }

    generate()
    {
        this.tiles = [];

        if(CONFIG.set == "baseGame") { this.generateBaseGame(); }
        else if(CONFIG.set == "specialSleighs") { this.generateSpecialSleighs(); }
        else if(CONFIG.set == "toughTrees") { this.generateToughTrees(); }
    }

    generateBaseGame()
    {
        // the required sleigh, of course
        const numSleighs = CONFIG.generation.baseGame.numSleighs;
        for(let i = 0; i < numSleighs; i++)
        {
            const sleighTile = new Tile("sleigh", 0);
            sleighTile.numWildcard = true;
            this.tiles.push(sleighTile);
        }
        

        // all types, fairly distributed
        const types = ["reindeer", "present_square", "present_triangle", "present_circle", "house", "wildcard"];
        const numTypes = types.length;
        shuffle(types);

        const numTiles = CONFIG.generation.baseGame.numTiles;
        for(let i = 0; i < numTiles; i++)
        {
            const type = types[i % numTypes];
            const tile = new Tile(type, (i+1));
            this.tiles.push(tile);
        }

        // randomly change some NUMBERS to wildcards
        // (but only do ONE per type, and spread them fairly)
        const numWildcardNumbers = CONFIG.generation.baseGame.numWildcardNumbers;
        const typesGivenWildcard = [];
        const groupSize = Math.floor(numTiles / numWildcardNumbers);
        for(let i = 0; i < numWildcardNumbers; i++)
        {
            let options = [];
            let allOptions = [];
            for(let a = i*groupSize; a < (i+1)*groupSize; a++)
            {
                allOptions.push(a);

                const isExtreme = a == 0 || a == this.tiles.length-1;
                if(isExtreme || this.tiles[a].isWildcardNumber()) { continue; }

                const type = this.tiles[a].type;
                if(typesGivenWildcard.includes(type)) { continue; }

                options.push(a);
            }

            if(options.length <= 0) { options = [fromArray(allOptions)]; }

            shuffle(options);
            
            const option = options.pop();
            this.tiles[option].numWildcard = true;
            typesGivenWildcard.push(this.tiles[option].type);
        }

        // assign the requirements for the houses
        // (first build all of them, then assign based on how "hard" the house is to complete)
        const combos = [[]];
        const maxComboSize = CONFIG.generation.maxComboSize;
        const presentOptions = ["present_square", "present_triangle", "present_circle", "wildcard"];
        for(let i = 1; i <= maxComboSize; i++)
        {
            const results = getAllPossibleCombinations(presentOptions, i);
            shuffle(results)
            combos.push(results);
        }

        const maxDistToMiddle = Math.round(0.5 * numTiles);
        const houseTiles = this.getAllOfType(this.tiles, "house");
        let reqs = []; // number of reqs in order of houses, do not shuffle or take the wrong end
        let totalReqs = 0;
        for(const tile of houseTiles)
        {
            const distToMiddle = Math.abs(Math.ceil(tile.num - maxDistToMiddle));
            const distRatio = 1.0 - distToMiddle / maxDistToMiddle;
            let numReqs = -1;
            if(distRatio <= 0.33) { numReqs = 1; }
            else if(distRatio <= 0.66) { numReqs = 2; }
            else { numReqs = 3; }

            reqs.push(numReqs);
            totalReqs += numReqs;
        }

        const maxPerPresent = Math.ceil(totalReqs / presentOptions.length);
        const statsPerPresent = {};
        for(const key of presentOptions) { statsPerPresent[key] = 0; }

        const wouldExceedLimit = (combo:string[], stats:Record<string, number>) =>
        {
            const newStats = Object.assign({}, stats);
            for(const elem of combo)
            {
                newStats[elem]++;
            }
            for(const value of Object.values(newStats))
            {
                if(value > maxPerPresent) { return true; }
            }
            return false;
        }

        for(const tile of houseTiles)
        {
            const numReqs = reqs.shift();
            const options = combos[numReqs];

            let idx = rangeInteger(0, options.length-1);
            for(let i = 0; i < options.length; i++)
            {
                const option = options[i];
                if(wouldExceedLimit(option, statsPerPresent)) { continue; }
                idx = i;
                break;
            }

            const option = options.splice(idx, 1)[0];
            tile.reqs = option;
            for(const elem of option) { statsPerPresent[elem]++; }
        }
    }

    getAllOfType(list:any[], tp: string)
    {
        const arr = [];
        for(const elem of list)
        {
            if(elem.type != tp) { continue; }
            arr.push(elem);
        }
        return arr;
    }

    generateSpecialSleighs()
    {
        // @TODO
        // -> Tiles with two presents
        // -> Tiles with a special action when played
        // -> Houses with an action that triggers when scored
    }

    generateToughTrees()
    {
        const numTrees = CONFIG.generation.toughTrees.numTiles;
        const maxNum = CONFIG.generation.baseGame.numTiles;
        const distBetweenNums = Math.floor(numTrees / maxNum);
        const startNum = rangeInteger(1, distBetweenNums);
        const wildcardIndex = rangeInteger(1, numTrees-1);
        for(let i = 0; i < numTrees; i++)
        {
            let num = startNum + i*distBetweenNums;
            const tile = new Tile("tree", num);
            if(i == wildcardIndex) { tile.numWildcard = true; }
            this.tiles.push(tile);
        }
    }

}