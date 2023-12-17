import ColorSet from "js/pq_games/layout/color/colorSet";
import Configurable from "./configurable";

const INK_FRIENDLY_KEY = "inkFriendly";

export default class Configurator
{
    itemsCalculated: Record<string, any>;

    // I don't want to carefully control the order in which these things are calculated and saved
    // Hence, whenever something is requested, if it's not calculated yet we just try it now
    // (If it still fails, it just returns the Configurable itself, so it can always be tried the next time)
    get(key:string|string[])
    {
        const path = this.keyToPath(key);
        let item = this.itemsCalculated[path];

        const notCalculatedYet = item instanceof Configurable;
        if(notCalculatedYet)
        {
            item = this.calculateItem(item);
            this.set(key, item);
        }

        return item;
    }

    set(key:string|string[], value:any)
    {
        const path = this.keyToPath(key);
        this.itemsCalculated[path] = value;
    }

    keyToPath(key:string|string[])
    {
        key = Array.isArray(key) ? key : [key];
        return key.join(".");
    }

    calculateItem(item:Configurable)
    {
        return item.calculate(this.collectRequiredInputs(item));
    }

    collectRequiredInputs(item:Configurable)
    {
        const inputs = item.getInput();
        const arr = [];
        if(item instanceof ColorSet) { arr.unshift(this.get(INK_FRIENDLY_KEY) ?? false); }
        for(const input of inputs)
        {
            const val = this.get(input);
            if(!val) { return null; }
            arr.push(val);
        }
        return arr;
    }

    calculate(config:Record<string,any>, path:string[] = [])
    {
        for(const [key,data] of Object.entries(config))
        {
            const pathNew = path.slice()
            pathNew.push(key);

            // either calculate the final value (or try to)
            const isConfigurable = (data instanceof Configurable);
            if(isConfigurable)
            {
                this.set(pathNew, this.calculateItem(data));
                continue;
            }

            // or go deeper into the object
            const isObject = typeof data === "object";
            if(isObject)
            {
                this.calculate(pathNew, data);
                continue;
            }

            // otherwise assume this is a raw value, save and do not touch
            this.set(pathNew, data);
        }
    }

}