import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import CONFIG from "../shared/config";
import { OBJECTS, STALLS } from "../shared/dict";

// auto-display all card options and descriptions inside rulebook
const rtConversion = { heading: "label", desc: "desc" };
const rtParams = { sheetURL: null, base: CONFIG.assetsBase, sheetWidth: 4, class: null };

rtParams.sheetURL = CONFIG.assets.objects.path;
const nodeObjects = convertDictToRulesTableHTML(OBJECTS, rtConversion, rtParams);
document.getElementById("rules-table-objects").appendChild(nodeObjects);

rtParams.sheetURL = CONFIG.assets.stalls.path;
const nodeStalls = convertDictToRulesTableHTML(STALLS, rtConversion, rtParams);
document.getElementById("rules-table-stalls").appendChild(nodeStalls);

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }