import { CONFIG } from "../shared/config";
import { OBJECTS, WISHES } from "../shared/dict";

const getTablesForSet = (idKey:string) =>
{
    // WISHES
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
        icons:
        {
            config:
            {
                sheetURL: CONFIG.assets.wishes.path,
                sheetWidth: 4,
                base: CONFIG.assetsBase
            },
        },
        data: wishesDict
    }

    // OBJECTS
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
        icons: 
        {
            config: 
            {
                sheetURL: CONFIG.assets.objects.path,
                sheetWidth: 4,
                base: CONFIG.assetsBase
            }
        },
        data: objectsDict
    }

    return {
        [idKey + "-wishes"]: tableWishes,
        [idKey + "-objects"]: tableObjects,
    }
}

const CONFIG_RULEBOOK = { tables: {} };
Object.assign(CONFIG_RULEBOOK.tables, getTablesForSet("roomService"));
Object.assign(CONFIG_RULEBOOK.tables, getTablesForSet("walletWatchers"));
Object.assign(CONFIG_RULEBOOK.tables, getTablesForSet("usefulUtilities"));
Object.assign(CONFIG_RULEBOOK.tables, getTablesForSet("happyHousing"));

loadRulebook(CONFIG_RULEBOOK);