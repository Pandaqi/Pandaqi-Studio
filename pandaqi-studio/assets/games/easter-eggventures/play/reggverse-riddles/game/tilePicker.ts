import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../shared/config";
import { ACTION_TILES, MAP_TILES, RULES, SECRET_OBJECTIVES, TileType } from "../shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";
import { EGGS_SHARED, TileData, TileDataDict } from "games/easter-eggventures/shared/dictShared";

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
        if(!CONFIG.sets.base) { return; }

        const maxNumPlayers = CONFIG.generation.maxNumPlayers;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.tiles.push(new Tile(TileType.PAWN, "", { playerNum: i }));
        }
    }

    generateMapTiles()
    {
        if(!CONFIG.sets.base) { return; }

        for(const [key,data] of Object.entries(MAP_TILES))
        {
            const set = data.set ?? "base";
            if(!CONFIG.sets[set]) { continue; }

            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.mapTile;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.MAP, key));
            }
        }
    }

    generateRuleTiles()
    {
        if(!CONFIG.sets.base) { return; }

        // could be initialized somewhere else, but this is fine too
        const tileOptions = [];
        for(const [key,data] of Object.entries(MAP_TILES))
        {
            tileOptions.push('<img id="map_tiles" frame="' + data.frame + '">')
        }

        const availableEggs = Object.keys(EGGS_SHARED).slice(0, CONFIG.generation.maxNumEggs);
        const eggOptions = [];
        for(const key of availableEggs)
        {
            eggOptions.push('<img id="eggs" frame="' + EGGS_SHARED[key].frame + '">');
        }

        const dynamicRules =
        {
            "%tile%": tileOptions,
            "%egg%": eggOptions,
            "%numegg%": CONFIG.generation.dynamicOptions.numEggs,
            "%numpawn%": CONFIG.generation.dynamicOptions.numPawns,
            "%side%": CONFIG.generation.dynamicOptions.side,
            "%row%": CONFIG.generation.dynamicOptions.row,
        }

        // first we expand the rule dictionary to all specific rules, all options, all variations
        const allRules = {};
        for(const [key,data] of Object.entries(RULES))
        {
            const ruleStrings = {
                [key]: data.desc,
            }

            if(data.descNeg)
            {
                ruleStrings[key + "_negative"] = data.descNeg;
            }

            for(const [tempKey,tempString] of Object.entries(ruleStrings))
            {
                const results = this.fillInDynamicData(tempKey, tempString, data, dynamicRules);
                const isStatic = !results;

                // if not dynamic, just do nothing and set it to the original data
                if(isStatic)
                {
                    allRules[key] = data;
                    continue;
                }
                
                // this is necessary for types that have TWO dynamic components
                // (the data2.desc, data2 arguments look weird => but that's because now we don't pick positive/negative anymore, we're stuck with what we already picked which simplifies that)
                // ugly but it works
                const resultsToAdd = [];
                for(const [key2,data2] of Object.entries(results))
                {
                    const results2 = this.fillInDynamicData(key2, data2.desc, data2, dynamicRules);
                    if(!results2) { continue; }
                    resultsToAdd.push(results2);
                    delete results[key2]; // @NOTE: CRUCIALLY, remove the "incomplete" entry from the set of options
                }

                for(const resultToAdd of resultsToAdd)
                {
                    Object.assign(results, resultToAdd);
                }

                // finally add all the newly generated elements to the rules options
                for(const [keyFinal, dataFinal] of Object.entries(results))
                {
                    allRules[keyFinal] = dataFinal;
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
                size: gridDims,
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

    fillInDynamicData(key:string, str:string, data:TileData, dynamicRules:Record<string,any>) : TileDataDict
    {
        let options = [];
        let needle = "";

        for(const [keyNeedle,dataOptions] of Object.entries(dynamicRules))
        {
            if(!str.includes(keyNeedle)) { continue; }
            needle = keyNeedle;
            options = dataOptions;
            break;
        }

        const nothingChanged = (options.length <= 0);
        if(nothingChanged) { return null; }

        const results : TileDataDict = {};
        for(const option of options)
        {
            const obj:TileData = Object.assign({}, data);
            const tempKey = key + "_" + option;
            obj.desc = str.replace(needle, option);
            results[tempKey] = obj;
        }
        return results;
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

    replaceNeedleRecursively(str:string, eggOptions:string[])
    {
        if(!str.includes("%egg%")) { return [str]; }

        const newStrings = [];
        for(const option of eggOptions)
        {
            const sameAsOtherReplacedOption = str.includes(option);
            if(sameAsOtherReplacedOption) { continue; }
            
            const replacedString = str.replace("%egg%", option);
            const finalStrings = this.replaceNeedleRecursively(replacedString, eggOptions);
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

        const availableEggs = Object.keys(EGGS_SHARED).slice(0, CONFIG.generation.maxNumEggs);
        const eggOptions = [];
        for(const key of availableEggs)
        {
            eggOptions.push('<img id="eggs" frame="' + EGGS_SHARED[key].frame + '">');
        }

        const list = [];
        const maxEntriesPerObjective = CONFIG.generation.maxEntriesPerObjective;
        for(const [key,data] of Object.entries(SECRET_OBJECTIVES))
        {
            const results = this.replaceNeedleRecursively(data.desc, eggOptions);
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

        const numSecretObjectives = CONFIG.generation.maxNumSecretObjectives;
        shuffle(list);
        for(let i = 0; i < numSecretObjectives; i++)
        {
            this.tiles.push(new Tile(TileType.OBJECTIVE, "", { desc: list.pop() }))
        }
    }

}