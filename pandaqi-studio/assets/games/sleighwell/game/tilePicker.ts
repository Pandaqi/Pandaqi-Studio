import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import Tile from "./tile";
import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import fromArray from "js/pq_games/tools/random/fromArray";
import { SPECIAL_ACTIONS } from "../shared/dict";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles; }

    generate()
    {
        this.tiles = [];

        if(CONFIG._settings.sets.base.value) { this.generateBaseGame(); }
        if(CONFIG._settings.sets.reindeerWay.value) { this.generateReindeerWay(); }
        if(CONFIG._settings.sets.toughTrees.value) { this.generateToughTrees(); }
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
        const types = ["present_square", "present_triangle", "present_circle", "house", "wildcard"];
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

        const houseTiles = this.getAllOfType(this.tiles, "house");
        let reqs = []; // number of reqs in order of houses, do not shuffle or take the wrong end
        let totalReqs = 0;
        for(const tile of houseTiles)
        {
            const numReqs = this.calculateNumRequirementsForHouse(tile.num);

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

    calculateNumRequirementsForHouse(num:number)
    {
        const numTiles = CONFIG.generation.baseGame.numTiles;
        const maxDistToMiddle = Math.round(0.5 * numTiles);
        const distToMiddle = Math.abs(Math.ceil(num - maxDistToMiddle));
        const distRatio = 1.0 - distToMiddle / maxDistToMiddle;
        let numReqs = -1;
        if(distRatio <= 0.33) { numReqs = 1; }
        else if(distRatio <= 0.66) { numReqs = 2; }
        else { numReqs = 3; }
        return numReqs;
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

    getRandomEquidistantNumbers(numTotal)
    {
        const maxNumOnTile = CONFIG.generation.baseGame.numTiles;
        const distBetweenNums = Math.floor(maxNumOnTile / numTotal);
        const startNum = rangeInteger(1, distBetweenNums);
        const wildcardIndex = rangeInteger(1, numTotal-1);

        const arr = [];
        for(let i = 0; i < numTotal; i++)
        {
            const num = startNum + i*distBetweenNums;
            arr.push(num);
        }

        return { arr, wildcardIndex };
    }

    // Creates houses with equidistant numbers, where given requirement(s) must always be present
    generateHousesWithForcedRequirement(num:number, req:string)
    {
        const presentOptions = [req, "present_square", "present_circle", "present_triangle"];
        const { arr, wildcardIndex } = this.getRandomEquidistantNumbers(num);
        const possibleCombos = [[], getAllPossibleCombinations(presentOptions, 1), getAllPossibleCombinations(presentOptions, 2), getAllPossibleCombinations(presentOptions, 3)];

        for(let i = 0; i < arr.length; i++)
        {
            const num = arr[i];
            const tile = new Tile("house", num);
            if(i == wildcardIndex) { tile.numWildcard = true; }

            const numReqs = this.calculateNumRequirementsForHouse(num);
            const options = possibleCombos[numReqs].slice();
            shuffle(options);

            for(const reqOption of options)
            {
                if(!reqOption.includes(req)) { continue; }
                tile.reqs = reqOption;
                break;
            }

            this.tiles.push(tile);
        }
    }

    // Simply creates tiles with equidistant numbers of a given type
    generateTilesWithForcedType(num: number, type: string)
    {
        const { arr, wildcardIndex } = this.getRandomEquidistantNumbers(num);

        for(let i = 0; i < arr.length; i++)
        {
            const num = arr[i];
            const tile = new Tile(type, num);
            if(i == wildcardIndex) { tile.numWildcard = true; }
            this.tiles.push(tile);
        }
    }

    generateDoubleTypeTiles(num: number)
    {
        const { arr, wildcardIndex } = this.getRandomEquidistantNumbers(num);

        const presentOptions = ["reindeer", "present_square", "present_circle", "present_triangle"];
        const possiblePairs = shuffle(getAllPossibleCombinations(presentOptions, 2));
        for(let i = 0; i < arr.length; i++)
        {
            const pair = possiblePairs.pop();
            const num = arr[i];
            const tile = new Tile(pair, num);
            this.tiles.push(tile);
        }
        
    }

    generateDoubleNumberTiles(num: number)
    {
        const { arr, wildcardIndex } = this.getRandomEquidistantNumbers(num * 2);
        const presentOptions = shuffle(["tree", "present_square", "present_circle", "present_triangle"]);
        for(let i = 0; i < arr.length; i += 2)
        {
            const nums = [arr[i], arr[i+1]];
            const type = presentOptions[i % presentOptions.length];
            const tile = new Tile(type, nums);
            this.tiles.push(tile);
        }
    }

    generateActionTiles(maxNum: number)
    {
        const actionsDict = SPECIAL_ACTIONS;
        const keys = shuffle(Object.keys(actionsDict));
        const numTilesToGenerate = Math.min(keys.length, maxNum);
        const { arr, wildcardIndex } = this.getRandomEquidistantNumbers(numTilesToGenerate);
        for(let i = 0; i < arr.length; i++)
        {
            const num = arr[i];
            const type = keys[i];
            // the present_circle is just to make it fit in with the current type system and get the right background
            // it's not displayed or used in any way
            const tile = new Tile("present_circle", num);
            tile.specialAction = type; // this type is truly important here
            if(i == wildcardIndex) { tile.numWildcard = true; }
            this.tiles.push(tile);
        }
    }

    generateReindeerWay()
    {
        this.generateTilesWithForcedType(CONFIG.generation.reindeerWay.numTiles, "reindeer");
        this.generateHousesWithForcedRequirement(CONFIG.generation.reindeerWay.numHouses, "reindeer");
        this.generateDoubleTypeTiles(CONFIG.generation.reindeerWay.numDoubleTypes);
    }

    generateToughTrees()
    {
        this.generateTilesWithForcedType(CONFIG.generation.toughTrees.numTiles, "tree");
        this.generateHousesWithForcedRequirement(CONFIG.generation.toughTrees.numHouses, "tree");
        this.generateDoubleNumberTiles(CONFIG.generation.toughTrees.numDoubleNumbers);
        this.generateActionTiles(CONFIG.generation.toughTrees.numSpecialActions);
    }

}