import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import { CONFIG } from "../shared/config";
import { OBJECTS, WISHES } from "../shared/dict";

const rtConversion = { heading: "label", desc: "desc" };
const rtParamsWishes = { sheetURL: CONFIG.assets.wishes.path, base: CONFIG.assetsBase, sheetWidth: 4, class: null };
const rtParamsObjects = { sheetURL: CONFIG.assets.objects.path, base: CONFIG.assetsBase, sheetWidth: 4, class: null };

const getTablesForSet = (idKey:string) =>
{
    const wishesDict = {};
    for(const [key,data] of Object.entries(WISHES))
    {
        const sets = data.sets ?? ["base"];
        if(!sets.includes(idKey)) { continue; }
        if(key == "num_windows") { continue; } // @NOTE: self-explanatory + would need exception in system and meh
        wishesDict[key] = data;
    }

    const tableWishes = 
    {
        config:
        {
            sheetURL: CONFIG.assets.wishes.path,
            sheetWidth: 4,
            base: CONFIG.assetsBase
        },
        icons: wishesDict
    }

    const nodeWishes = convertDictToRulesTableHTML(wishesDict, rtConversion, rtParamsWishes);
    document.getElementById(idKey + "-wishes").appendChild(nodeWishes);

    const objectsDict = {};
    for(const [key,data] of Object.entries(OBJECTS))
    {
        const sets = data.sets ?? ["base"];
        if(!sets.includes(idKey)) { continue; }
        const hasSpecialPower = data.desc && data.desc.length >= 0;
        if(!hasSpecialPower) { continue; }
        objectsDict[key] = data;
    }

    const tableObjects =
    {
        config: 
        {
            sheetURL: CONFIG.assets.objects.path,
            sheetWidth: 4,
            base: CONFIG.assetsBase
        },
        icons: objectsDict
    }

    return {
        [idKey + "-wishes"]: tableWishes,
        [idKey + "-objects"]: tableObjects,
    }
}

const cfg = { tables: {} };
Object.assign(cfg.tables, getTablesForSet("roomService"));
Object.assign(cfg.tables, getTablesForSet("walletWatchers"));
Object.assign(cfg.tables, getTablesForSet("usefulUtilities"));
Object.assign(cfg.tables, getTablesForSet("happyHousing"));

loadRulebook(cfg);