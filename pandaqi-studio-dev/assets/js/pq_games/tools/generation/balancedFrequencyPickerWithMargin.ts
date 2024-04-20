import fromArray from "../random/fromArray"
import StatsTracker from "./statsTracker"

interface FrequencyPickerParams
{
    options?:string[]
    stats?:Record<string,number>,
    maxDist?:number
}

export default class BalancedFrequencyPickerWithMargin
{
    options:string[]
    maxDist:number
    stats:Record<string,number>

    constructor(params:FrequencyPickerParams = {}) 
    {
        this.options = params.options ?? [];
        this.stats = params.stats ?? {};
        this.maxDist = params.maxDist ?? 1;
    }

    clone(deep = true)
    {
        const newOptions = deep ? this.options.slice() : this.options;
        const newStats = deep ? structuredClone(this.stats) : this.stats;
        return new BalancedFrequencyPickerWithMargin({ options: newOptions, maxDist: this.maxDist, stats: newStats });
    }

    getStats() { return this.stats; }

    pickAny()
    {
        return fromArray(this.options);
    }

    pickNext() : string
    {
        // find least used icon
        let leastUsedIcon = null;
        let leastUsedFreq = Infinity;
        for(const icon of this.options)
        {
            const freq = this.stats[icon] ?? 0;
            if(freq >= leastUsedFreq) { continue; }
            leastUsedFreq = freq;
            leastUsedIcon = icon;
        }

        // check how bad the situation is
        // any icons still close to it are still considered as valid options
        const iconOptions = [];
        for(const icon of this.options)
        {
            const freq = this.stats[icon] ?? 0;
            const dist = Math.abs(freq - leastUsedFreq);
            if(dist > this.maxDist) { continue; }
            iconOptions.push(icon);
        }

        // then just draw a random one from those + register we did that
        const randOption = fromArray(iconOptions);
        this.registerStatChange(randOption);
        return randOption;
    }

    pickMultiple(num:number) : string[]
    {
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push(this.pickNext());
        }
        return arr;
    }

    registerStatChange(option: string, num = 1)
    {
        if(!this.stats[option]) { this.stats[option] = 0; }
        this.stats[option] += num;
    }
}