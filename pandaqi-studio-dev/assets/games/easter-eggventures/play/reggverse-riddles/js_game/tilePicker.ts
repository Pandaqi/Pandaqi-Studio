import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../js_shared/config";
import { ACTION_TILES, MAP_TILES, RULES, SECRET_OBJECTIVES, TileType } from "../js_shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";
import { EGGS_SHARED } from "games/easter-eggventures/js_shared/dictShared";

export default class TilePicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

        this.generatePawns();
        this.generateMapTiles();
        this.generateRuleTiles();

        this.generateActionTiles();
        this.generateSecretObjectives();

        console.log(this.tiles);
    }

    generatePawns()
    {
        const maxNumPlayers = CONFIG.generation.maxNumPlayers;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.tiles.push(new Tile(TileType.PAWN, "", { playerNum: i }));
        }
    }

    generateMapTiles()
    {
        for(const [key,data] of Object.entries(MAP_TILES))
        {
            const set = data.set ?? "base";
            if(!CONFIG.sets[data.set]) { continue; }

            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.mapTile;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.MAP, key));
            }
        }
    }

    // @TODO: this is the meat of this picker
    generateRuleTiles()
    {

        // @TODO: should/could this be initialized somewhere else?
        const dynamicRules =
        {
            "%tile%": Object.keys(MAP_TILES),
            "%egg%": Object.keys(EGGS_SHARED).slice(0, CONFIG.generation.maxNumEggs),
            "%numegg%": [1,2,3,4],
            "%numpawn%": [2,3],
            "%side%": ["left", "right", "top", "bottom"]
        }

        // first we expand the rule dictionary to all specific rules, all options, all variations
        const allRules = {};
        for(const [key,data] of Object.entries(RULES))
        {
            const ruleStrings = {
                [key]: data.desc,
                [key + "_negative"]: data.descNeg 
            }

            for(const [tempKey,tempString] of Object.entries(ruleStrings))
            {
                let options = [];
                let needle = "";
    
                for(const [keyNeedle,dataOptions] of Object.entries(dynamicRules))
                {
                    if(!tempString.includes(keyNeedle)) { continue; }
                    needle = keyNeedle;
                    options = dataOptions;
                    break;
                }
    
                const isDynamic = options.length > 0;
                for(const option of options)
                {
                    const obj = Object.assign({}, data);
                    const tempTempKey = tempKey + "_" + option;
                    obj.desc = tempString.replace(needle, option);
                    allRules[tempTempKey] = obj;
                }
    
                if(!isDynamic)
                {
                    allRules[key] = data;
                }
            }
        }

        // we also create a generator function for a random movement instruction that can appear
        const allMovementOptions = [];
        const gridDims = CONFIG.generation.movementInstructions.gridDims;
        for(let x = 0; x < gridDims.x; x++)
        {
            for(let y = 0; y < gridDims.y; y++)
            {
                const id = x + y * gridDims.x;
                const isCenter = (x == Math.floor(0.5*gridDims.x) && y == Math.floor(0.5*gridDims.y));
                if(isCenter) { continue; }
                allMovementOptions.push(id);
            }
        }

        const createRandomMovementInstruction = () =>
        {
            const opts = shuffle(allMovementOptions.slice());
            const num = CONFIG.generation.movementInstructions.numValid.randomInteger();
            return {
                dims: gridDims,
                valid: opts.slice(0, num)
            }
        }

        // then we create all the tiles by picking randomly from the options
        // (we need to save the final rules dict on tiles, as just using original RULES is wrong now)
        const numRuleTiles = CONFIG.generation.numRuleTiles;
        for(let i = 0; i < numRuleTiles; i++)
        {
            const ruleKey = getWeighted(allRules, "prob");
            const customData = { movement: createRandomMovementInstruction(), rulesDict: allRules };
            this.tiles.push(new Tile(TileType.RULE, ruleKey, customData));
        }

    }

    generateActionTiles()
    {
        if(!CONFIG.sets.actionTiles) { return; }

        for(const [key,data] of Object.entries(ACTION_TILES))
        {
            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.actionTile;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.ACTION, key));
            }
        }
    }

    replaceNeedleRecursively(string:string)
    {
        if(!string.includes("%egg%")) { return []; }

        const newStrings = [];
        const options = Object.keys(EGGS_SHARED).slice(0, CONFIG.generation.maxNumEggs);
        for(const option of options)
        {
            const sameAsOtherReplacedOption = string.includes(option);
            if(sameAsOtherReplacedOption) { continue; }
            const replacedString = string.replace("%egg%", option);

            const finalStrings = this.replaceNeedleRecursively(replacedString);
            for(const finalString of finalStrings)
            {
                newStrings.push(finalString);
            }
        }

        return newStrings;
    }

    generateSecretObjectives()
    {
        if(!CONFIG.sets.secretObjectives) { return; }

        const list = [];
        const maxEntriesPerObjective = CONFIG.generation.maxEntriesPerObjective;
        for(const [key,data] of Object.entries(SECRET_OBJECTIVES))
        {
            const results = this.replaceNeedleRecursively(data.desc);
            shuffle(results);
            while(results.length > maxEntriesPerObjective)
            {
                results.pop();
            }

            for(const result of results)
            {
                list.push(result);
            }
        }

        for(const [key,data] of Object.entries(SECRET_OBJECTIVES))
        {
            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.secretObjective;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.ACTION, key));
            }
        }
    }

}