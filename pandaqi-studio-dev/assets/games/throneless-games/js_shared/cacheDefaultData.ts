import Point from "js/pq_games/tools/geometry/point";
import { PACK_COLORS, PACK_DEFAULT, PackData } from "./dictShared";

const cacheDefault = (obj, def) =>
{
    for(const [key,data] of Object.entries(def))
    {
        if(typeof data === "object" && data.constructor.name == 'Object')
        {
            if(!obj[key]) { obj[key] = {}; }
            cacheDefault(obj[key], data);
            continue;
        }

        const alreadyHasValue = obj[key] != undefined && obj[key] != null;
        if(alreadyHasValue) { continue; }

        obj[key] = data;
    }
}

export default (packDict:Record<string,PackData>) =>
{
    // first, add all default colors directly onto the pack object
    for(const [type, data] of Object.entries(packDict))
    {
        const colorClass = data.colorClass.toLowerCase();
        const colorData = PACK_COLORS[colorClass];
        if(!colorData) { 
            console.error("Pack " + type + " has no valid colorClass");
            continue; 
        }
        cacheDefault(data, colorData);
    }

    // then add any missing defaults
    for(const [type, data] of Object.entries(packDict))
    {
        cacheDefault(data, PACK_DEFAULT);
    }
}