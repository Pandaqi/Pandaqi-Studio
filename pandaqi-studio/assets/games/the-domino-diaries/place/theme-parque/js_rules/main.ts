import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import CONFIG from "../js_shared/config";
import { ATTRACTIONS, DECORATIONS, GeneralData, STALLS } from "../js_shared/dict";

// auto-display all card options and descriptions inside rulebook
const rtConversion = { heading: "label", desc: "desc" };
const rtParams = { sheetURL: null, base: CONFIG.assetsBase, sheetWidth: 4, class: null };

const globalDict:Record<string,GeneralData> = Object.assign(Object.assign(Object.assign({}, ATTRACTIONS), STALLS), DECORATIONS);

const parse = (dict:Record<string,GeneralData>, setTarget:string) =>
{
    const dictOutput = {};
    for(const [key,data] of Object.entries(dict))
    {
        const set = data.set ?? "base";
        if(set != setTarget) { continue; }
        dictOutput[key] = data;

        // save sheetURL on object itself, as different things in the same rules table require different images!
        const sheetURL = (key in DECORATIONS) ? CONFIG.assets.decorations.path : ((key in STALLS) ? CONFIG.assets.stalls.path : CONFIG.assets.attractions.path);
        data.sheetURL = sheetURL;
    }

    console.log(dictOutput);

    return dictOutput;
}

const nodeBase = convertDictToRulesTableHTML(parse(globalDict, "base"), rtConversion, rtParams);
document.getElementById("rules-table-base").appendChild(nodeBase);

const nodeWishneyland = convertDictToRulesTableHTML(parse(globalDict, "wishneyland"), rtConversion, rtParams);
document.getElementById("rules-table-wishneyland").appendChild(nodeWishneyland);

const nodeUnibearsal = convertDictToRulesTableHTML(parse(globalDict, "unibearsal"), rtConversion, rtParams);
document.getElementById("rules-table-unibearsal").appendChild(nodeUnibearsal);

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }