import { anyMatch } from "../tools/collections/checkers";
import { CVal } from "./cval";

export class Configurator
{
    // A Map, not a plain object: a `_drawing` path called `constructor`, `toString` or `__proto__` used to
    // resolve to an inherited property instead of `undefined`, and `set("__proto__", …)` wrote to the prototype.
    itemsCalculated: Map<string, any>;
    exceptions: string[];

    constructor()
    {
        this.itemsCalculated = new Map();
        this.exceptions = [];
    }

    addExceptions(exs:string[])
    {
        for(const exception of exs)
        {
            this.exceptions.push(exception);
        }
    }

    removeExceptions(exs:string[])
    {
        for(const exception of exs)
        {
            const idx = this.exceptions.indexOf(exception);
            if(idx < 0) { continue; }
            this.exceptions.splice(idx, 1);
        }
    }

    // I don't want to carefully control the order in which these things are calculated and saved
    // Hence, whenever something is requested, if it's not calculated yet we just try it now
    // (If it still fails, it just returns the CVal itself, so it can always be tried the next time)
    get(key:string|string[])
    {
        const path = this.keyToPath(key);
        let item = this.itemsCalculated.get(path);

        const notCalculatedYet = item instanceof CVal;
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
        this.itemsCalculated.set(path, value);
    }

    keyToPath(key:string|string[])
    {
        key = Array.isArray(key) ? key : [key];
        return key.join(".");
    }

    calculateItem(item:CVal)
    {
        return item.calculate(this.collectRequiredInputs(item));
    }

    collectRequiredInputs(item:CVal)
    {
        const inputs = item.getInput();
        const arr = [];
        for(const input of inputs)
        {
            const val = this.get(input);
            if(val == null) { return null; }
            arr.push(val);
        }
        return arr;
    }

    calculate(config:Record<string,any>, path:string[] = [])
    {
        if(typeof config !== "object") { return; }
        if(!config) { return; }

        for(const [key,data] of Object.entries(config))
        {
            // one path array for the whole walk instead of a copy per key
            path.push(key);

            const isException = anyMatch(this.exceptions, path);

            if(!isException && data != null)
            {
                // either calculate the final value (or try to)
                const isCVal = (data instanceof CVal);
                if(isCVal)
                {
                    this.set(path, this.calculateItem(data));
                }
                else
                {
                    // or go deeper into the object
                    const isClassInstance = this.isClassInstance(data) && !this.isForbiddenEntry(data);
                    const isRawObject = typeof data === "object" && !isClassInstance;
                    if(isRawObject)
                    {
                        this.set(path, data); // also save the original object as well, so we can access the WHOLE thing as well as the PARTS
                        this.calculate(data, path);
                    }
                    else
                    {
                        // otherwise assume this is a raw value, save and do not touch
                        this.set(path, data);
                    }
                }
            }

            path.pop();
        }
    }

    isForbiddenEntry(data)
    {
        if(typeof data != "object") { return false; }
        return data.configuratorForbiddenEntry ?? false;
    }

    isClassInstance(data)
    {
        if(typeof data == "object" && data.constructor && data.constructor.name !== "Object") { return true; }
        return false;
    }

}
