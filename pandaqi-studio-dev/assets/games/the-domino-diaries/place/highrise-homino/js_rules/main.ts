import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import CONFIG from "../js_shared/config";
import { OBJECTS, WISHES } from "../js_shared/dict";

const rtConversion = { heading: "label", desc: "desc" };
const rtParamsWishes = { sheetURL: CONFIG.assets.wishes.path, base: CONFIG.assetsBase, sheetWidth: 4, class: null };
const rtParamsObjects = { sheetURL: CONFIG.assets.objects.path, base: CONFIG.assetsBase, sheetWidth: 4, class: null };

const displayTablesForSet = (setTarget:string) =>
{
    const idKey = "rules-table-" + setTarget;

    const wishesDict = {};
    for(const [key,data] of Object.entries(WISHES))
    {
        const sets = data.sets ?? ["base"];
        if(!sets.includes(setTarget)) { continue; }
        if(key == "num_windows") { continue; } // @NOTE: self-explanatory + would need exception in system and meh
        wishesDict[key] = data;
    }

    const nodeWishes = convertDictToRulesTableHTML(wishesDict, rtConversion, rtParamsWishes);
    document.getElementById(idKey + "-wishes").appendChild(nodeWishes);

    const objectsDict = {};
    for(const [key,data] of Object.entries(OBJECTS))
    {
        const sets = data.sets ?? ["base"];
        if(!sets.includes(setTarget)) { continue; }
        const hasSpecialPower = data.desc && data.desc.length >= 0;
        if(!hasSpecialPower) { continue; }
        objectsDict[key] = data;
    }

    const nodeObjects = convertDictToRulesTableHTML(objectsDict, rtConversion, rtParamsObjects);
    document.getElementById(idKey + "-objects").appendChild(nodeObjects);
}

displayTablesForSet("roomService");
displayTablesForSet("walletWatchers");
displayTablesForSet("usefulUtilities");
displayTablesForSet("happyHousing");

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }