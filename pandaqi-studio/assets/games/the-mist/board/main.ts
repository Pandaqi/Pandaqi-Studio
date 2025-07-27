import CONFIG from "../shared/config"
import { SETS } from "../shared/dict"
import BoardDraw from "./boardDraw"
import BoardGen from "./boardGen"
import Evaluator from "./evaluator"
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator" // @NOTE: if we place this earlier, it has a cyclic reference and it doesn't build the JS => can we FIX THAT permanently?
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
generator.start();