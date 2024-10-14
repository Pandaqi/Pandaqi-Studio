import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import CONFIG from "../js_shared/config";
import { MAP_TILES, STOOM_CARDS } from "../js_shared/dict";

const rtConversion = { heading: "label", desc: "desc" };

const mapTilesClean = Object.assign({}, MAP_TILES);
for(const [key,data] of Object.entries(mapTilesClean))
{
    const set = data.set ?? "base";
    if(set == "pepernootPlekken") { continue; }
    delete mapTilesClean[key];
}


const rtParamsMap = { sheetURL: CONFIG.assets.map_tiles.path, base: CONFIG.assetsBase, sheetWidth: 6, class: "big" };
const nodeMapTiles = convertDictToRulesTableHTML(mapTilesClean, rtConversion, rtParamsMap);
document.getElementById("rules-table-pepernootPlekken").appendChild(nodeMapTiles);

const rtParamsStoom = { sheetURL: CONFIG.assets.stoom_cards.path, base: CONFIG.assetsBase, sheetWidth: 4 };
const nodeAdvanced = convertDictToRulesTableHTML(STOOM_CARDS, rtConversion, rtParamsStoom);
document.getElementById("rules-table-stoomIcoontjes").appendChild(nodeAdvanced);

// @ts-ignore => @TODO: should really find a cleaner method for this ...
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }