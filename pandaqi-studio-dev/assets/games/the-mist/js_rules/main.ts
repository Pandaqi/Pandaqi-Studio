import CONFIG from "../js_shared/config";
import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import { ActionSet, SETS } from "../js_shared/dict";

// 
// For auto-displaying all options in nice rules tables in rulebook
// 

const rtConversion = { heading: "label" };
const rtParams = { sheetURL: null, base: CONFIG.assetsBase };

// @TODO: Find clean, automatic system for displaying icons/formatting within descriptions as CSS as well.
//  => Maybe another functionality of TextDrawer? toCSS? Invoked automatically by this system?
// @IDEA: When setting an icon, also set a NAME for it on the <img> object => <img name="points">
//   When displaying in html/css, we only extract that NAME and display that?
const parse = (dict:ActionSet) =>
{
    for(const [key,data] of Object.entries(dict))
    {
        let desc = Array.isArray(data.desc) ? data.desc[0] : data.desc;
        desc = desc.replace('<img id="misc" frame="0">', 'points');
        desc = desc.replace('<img id="misc" frame="1">', 'items');
        desc = desc.replace('<img id="misc" frame="2">', 'hazards');
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

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }