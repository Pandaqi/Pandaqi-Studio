import Configurable from "./configurable";

export default class Configurator
{
    items: Record<string, any>;

    get(key:string|string[])
    {
        const path = this.keyToPath(key);
        return this.items[path];
    }

    set(key:string|string[], value:any)
    {
        const path = this.keyToPath(key);
        this.items[path] = value;
    }

    keyToPath(key:string|string[])
    {
        key = Array.isArray(key) ? key : [key];
        return key.join(".");
    }

    calculate(config:Record<string,any>, path:string[] = [])
    {
        for(const [key,data] of Object.entries(config))
        {
            const pathNew = path.slice()
            pathNew.push(key);
            const isConfigurable = (data instanceof Configurable);
            if(isConfigurable)
            {
                this.set(pathNew, data.calculate(this));
                continue;
            }

            const isObject = typeof data === "object";
            if(isObject)
            {
                this.calculate(pathNew, data);
                continue;
            }

            this.set(pathNew, data);
        }
    }

}