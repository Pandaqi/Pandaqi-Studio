import ColorSet from "js/pq_games/layout/color/colorSet";
import CVal from "./cval";
import anyMatch from "../collections/anyMatch";
import Point from "../geometry/point";
import Color from "js/pq_games/layout/color/color";

const PROTECTED_CLASSES = [Point, Color, ColorSet];

export default class Configurator
{
    itemsCalculated: Record<string, any>;
    exceptions: string[];

    constructor()
    {
        this.itemsCalculated = {};
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
        let item = this.itemsCalculated[path];

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
        this.itemsCalculated[path] = value;
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
            const pathNew = path.slice()
            pathNew.push(key);

            const isException = anyMatch(this.exceptions, pathNew);
            if(isException) { continue; }

            // either calculate the final value (or try to)
            const isCVal = (data instanceof CVal);
            if(isCVal)
            {
                this.set(pathNew, this.calculateItem(data));
                continue;
            }

            // or go deeper into the object
            const isCustomObject = this.isProtectedObject(data);
            const isObject = typeof data === "object" && !isCustomObject;
            if(isObject)
            {
                this.calculate(data, pathNew);
                continue;
            }

            // otherwise assume this is a raw value, save and do not touch
            this.set(pathNew, data);
        }
    }

    isProtectedObject(data)
    {
        for(const elem of PROTECTED_CLASSES)
        {
            if(data instanceof elem) { return true; }
        }
        return false;
    }

}