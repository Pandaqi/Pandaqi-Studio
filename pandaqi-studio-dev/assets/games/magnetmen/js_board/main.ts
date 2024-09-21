import CONFIG from "../js_shared/config"
import BoardGen from "./boardGen"
import BoardDraw from "./boardDraw"
import Evaluator from "./evaluator"
import { SETS } from "../js_shared/dict"
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator"
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi"

const generator = new BoardGenerator(CONFIG, new RendererPixi());
generator.drawerClass = BoardDraw;
generator.evaluatorClass = Evaluator;
generator.generatorClass = BoardGen;

generator.filterAssets = (dict) =>
{
    const output = {};
    for(const [key,data] of Object.entries(dict))
    {
        const textureKey = key.split("_")[0];
        // @ts-ignore
        if(data.set && !CONFIG.sets[textureKey]) { continue; }
        output[key] = data;
    }
    console.log(output);
    return output;
}

generator.setupFunction = (config) =>
{
    // create master dict of ALL included powers + their texture for displaying
    let allPowers = {};
    const includedSets = [];
    for(const [setKey,included] of Object.entries(config.sets))
    {
        if(!included) { continue; }
        const setData = SETS[setKey];
        allPowers = Object.assign(allPowers, setData);
        includedSets.push(setKey);

        for(const [elemKey,data] of Object.entries(setData))
        {
            data.textureKey = setKey;
        }
    }
    config.allTypes = allPowers;
    console.log(allPowers);

    config.beginnerMode = includedSets.length <= 1 && includedSets.includes("base");
}

generator.start();