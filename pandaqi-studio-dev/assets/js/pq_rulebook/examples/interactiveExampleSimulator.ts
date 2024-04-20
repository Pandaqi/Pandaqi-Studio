import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import OutputBuilder from "./outputBuilder"


interface InteractiveExampleSimulatorParams
{
    enabled?: boolean,
    iterations?: number,
    silent?: boolean,
    custom?: any,
    callbackInitStats?: () => Record<string,any>,
    callbackFinishStats?: (s:InteractiveExampleSimulator) => void
}

export { InteractiveExampleSimulator, InteractiveExampleSimulatorParams }
export default class InteractiveExampleSimulator
{
    enabled: boolean
    iterations: number
    silent: boolean  // prints results by default; silent = true keeps it, well, silent
    outputBuilder: OutputBuilder 
    callback: Function;
    stats:Record<string,any>;
    callbackInitStats: Function;
    callbackFinishStats: Function;
    custom: any; // for any custom functions or variables we want to tack onto this

    constructor(params:InteractiveExampleSimulatorParams = {})
    {
        this.enabled = params.enabled ?? false;
        this.iterations = params.iterations ?? 0;
        this.silent = params.silent ?? false;
        this.callbackInitStats = params.callbackInitStats;
        this.callbackFinishStats = params.callbackFinishStats;
        this.custom = params.custom ?? {};
    }

    isHeadless() { return this.enabled; }
    setOutputBuilder(o:OutputBuilder) { this.outputBuilder = o; }
    setCallback(c:Function) { this.callback = c; }

    async loadAssets(resLoader:ResourceLoader)
    {
        if(this.isHeadless()) { return; }
        await resLoader.loadPlannedResources();
    }

    callCustom(funcName: string, args:any[])
    {
        if(!this.isHeadless()) { return; }
        if(typeof this.custom[funcName] != 'function')
        {
            console.error("Function " + funcName + " doesn't exist on custom simulator object.");
            return;
        }
        args.unshift(this);
        this.custom.apply(funcName, args);
    }

    getIterations() { return this.iterations; }
    getStats() { return this.stats; }
    read(key:string) { return this.stats[key]; }
    write(key:string, val:any) { this.stats[key] = val; }
    change(key:string, val:number) 
    {
        if(!this.stats[key]) { this.stats[key] = 0; }
        this.stats[key] += val;
    }

    async simulate()
    {
        if(!this.isHeadless()) { return; }

        this.stats = {} 
        if(this.callbackInitStats) { this.stats = this.callbackInitStats(); }

        // remember to make callbacks independent of one another,
        // so we can make this super fast with parallel generations
        const promises = [];
        for(let i = 0; i < this.iterations; i++)
        {
            promises.push( this.callback(this) );
        }
        await Promise.all(promises);

        if(this.callbackFinishStats) { this.callbackFinishStats(); }
        if(!this.silent) { this.report(); }
    }

    report()
    {
        console.log("== SIMULATION RESULTS ==");
        console.log(this.stats);
    }

    // all feedback is run through this function, so it is NOT actually executed when it's running in headless mode
    // it's passed in as a function, so we don't already need to call anything (the actual action happens if we passed the check)
    output(func:Function)
    {
        if(this.isHeadless()) { return; }
        func(this);
    }

    //
    // shortcut functions I'll need a lot
    //
    print(s:string)
    {
        this.output(() => this.outputBuilder.addParagraph(s));
    }

    listImages(images:HTMLImageElement[])
    {
        this.output(() => this.outputBuilder.addFlexList(images));
    }
}