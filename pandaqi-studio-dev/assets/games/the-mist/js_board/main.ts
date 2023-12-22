import CONFIG from "../js_shared/config"
import BoardGen from "./boardGen"
import BoardDraw from "./boardDraw"
import Evaluator from "./evaluator"
import { SETS } from "../js_shared/dict"
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator"

const generator = new BoardGenerator(CONFIG);
generator.drawerClass = BoardDraw;
generator.evaluatorClass = Evaluator;
generator.generatorClass = BoardGen;

generator.filterAssets = (dict) =>
{
    const output = {};
    for(const [key,data] of Object.entries(dict))
    {
        const textureKey = key;
        // @ts-ignore
        if(data.set && !CONFIG.sets[textureKey]) { continue; }
        output[key] = data;
    }
    return output;
}

generator.setupFunction = (config) =>
{
    // create master dict of ALL included powers + their texture for displaying
    let allPowers = {};
    const setsIncluded = [];
    for(const [setKey,included] of Object.entries(config.sets))
    {
        if(!included) { continue; }
        const setData = SETS[setKey];
        setsIncluded.push(setKey);
        allPowers = Object.assign(allPowers, setData);

        for(const [elemKey,data] of Object.entries(setData))
        {
            data.textureKey = setKey;
        }
    }
    config.allTypes = allPowers;
    config.inSimpleMode = setsIncluded.length <= 1 && setsIncluded.includes("base");
    console.log(allPowers);
}