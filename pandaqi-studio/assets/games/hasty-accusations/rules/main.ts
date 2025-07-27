import CONFIG from "../shared/config";
import { ActionSet, SETS, SUSPECTS } from "../shared/dict";
import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";

// auto-display all card options and descriptions inside rulebook
const rtConversion = { heading: "label", desc: "desc" };
const rtParams = { sheetURL: null, base: CONFIG.assetsBase, sheetWidth: 8, class: null };

const parse = (dict:ActionSet) =>
{
    for(const [key,data] of Object.entries(dict))
    {
        let desc = Array.isArray(data.desc) ? data.desc[0] : data.desc;
        desc = desc.replace('<img id="suspects" frame="0">', 'loupe');
        dict[key].desc = desc;
    }

    return dict;
}

rtParams.sheetURL = CONFIG.assets.base.path;
const nodeBase = convertDictToRulesTableHTML(parse(SETS.base), rtConversion, rtParams);
document.getElementById("rules-table-base").appendChild(nodeBase);

rtParams.sheetURL = CONFIG.assets.advanced.path;
const nodeAdvanced = convertDictToRulesTableHTML(parse(SETS.advanced), rtConversion, rtParams);
document.getElementById("rules-table-advanced").appendChild(nodeAdvanced);

rtParams.sheetURL = CONFIG.assets.expert.path;
const nodeExpert = convertDictToRulesTableHTML(parse(SETS.expert), rtConversion, rtParams);
document.getElementById("rules-table-expert").appendChild(nodeExpert);

rtParams.sheetURL = CONFIG.assets.suspect_powers.path;
const suspectsParsed = Object.assign({}, SUSPECTS);
delete suspectsParsed.loupe;
delete suspectsParsed.traitor;
rtParams.sheetWidth = 11;
rtParams.class = "big";
rtConversion.desc = "power";
const nodePowers = convertDictToRulesTableHTML(suspectsParsed, rtConversion, rtParams);
document.getElementById("rules-table-powers").appendChild(nodePowers);

/*
const entries = Array.from(nodePowers.getElementsByClassName("rules-table-entry"));
nodePowers.getElementsByClassName("rules-table")[0].classList.add("big");
for(const entry of entries)
{
    entry.classList.add("big");
}
*/

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }