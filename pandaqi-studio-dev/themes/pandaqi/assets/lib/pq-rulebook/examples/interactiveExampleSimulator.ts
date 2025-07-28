import { MaterialVisualizer, ResourceLoader } from "lib/pq-games"
import { OutputBuilder } from "./outputBuilder"
import { RulebookSettings } from "./rulebookSettings"

export interface InteractiveExampleSimulatorParams
{
    enabled?: boolean,
    iterations?: number,
    silent?: boolean,
    showFullGame?: boolean,
    custom?: any,
    runParallel?: boolean,
    callbackInitStats?: () => any,
    callbackFinishStats?: (s:InteractiveExampleSimulator) => void
}

export class InteractiveExampleSimulator
{
    enabled: boolean
    iterations: number
    silent: boolean  // prints results by default; silent = true keeps it, well, silent
    outputBuilder: OutputBuilder 
    callback: Function;
    stats:any;
    callbackInitStats: Function;
    callbackFinishStats: Function;
    pickers: Record<string,any>;
    visualizer: MaterialVisualizer;
    showFullGame: boolean;
    runParallel: boolean;
    settings: RulebookSettings;
    custom: any; // for any custom functions or variables we want to tack onto this

    constructor(params:InteractiveExampleSimulatorParams = {})
    {
        this.enabled = params.enabled ?? false;
        this.iterations = params.iterations ?? 0;
        this.silent = params.silent ?? false;
        this.callbackInitStats = params.callbackInitStats;
        this.callbackFinishStats = params.callbackFinishStats;
        this.custom = params.custom ?? {};
        this.showFullGame = params.showFullGame ?? false;
        this.runParallel = params.runParallel ?? true;
        
        this.openStats();
    }

    isHeadless() { return this.enabled; }
    setOutputBuilder(o:OutputBuilder) { this.outputBuilder = o; }
    setCallback(c:Function) { this.callback = c; }
    setPickers(p:Record<string,any>) { this.pickers = p; }
    getPicker(key:string) { return this.pickers[key]; }
    setVisualizer(v:MaterialVisualizer) { this.visualizer = v; }
    getVisualizer() { return this.visualizer; }

    displayFullGame()
    {
        if(this.isHeadless()) { return true; }
        return this.showFullGame;
    }
    displaySingleTurn() { return !this.displayFullGame(); }

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
            console.error(`Function ${funcName} doesn't exist on custom simulator object.`);
            return;
        }
        args.unshift(this); // the simulator itself always passed in as first argument; wanted to keep this context clean
        this.custom[funcName].apply(this.custom, args);
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

    openStats()
    {
        this.stats = {} 
        if(this.callbackInitStats) { this.stats = this.callbackInitStats(); }
    }

    closeStats()
    {
        if(this.callbackFinishStats) { this.callbackFinishStats(this); }
    }

    async simulate()
    {
        if(!this.isHeadless()) { return; }

        this.openStats();

        if(this.runParallel) {
            // the callbacks themselves, of course, must be entirely independent of one another,
            // so we can make this super fast with parallel generations
            const promises = [];
            for(let i = 0; i < this.iterations; i++)
            {
                promises.push( this.callback(this) );
            }
            await Promise.all(promises);
        } else {
            for(let i = 0; i < this.iterations; i++)
            {
                await this.callback(this);
            }
        }

        this.closeStats();

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

    async outputAsync(object:any, func = "draw")
    {
        if(this.isHeadless()) { return; }
        if(typeof object[func] != "function")
        {
            console.error(`Can't output async from function ${func} on object`, object);
            return;
        }

        await object[func](this);
    }

    //
    // shortcut functions I'll need a lot
    //
    print(s:string)
    {
        this.output(() => this.outputBuilder.addParagraph(s));
    }

    printList(s:string[])
    {
        this.output(() => this.outputBuilder.addParagraphList(s));
    }

    async listImages(object:any, drawFunction = "draw")
    {
        if(this.isHeadless()) { return; }
        if(typeof object[drawFunction] != "function")
        {
            console.error(`Can't list images from draw function ${drawFunction} on object`, object);
            return;
        }

        const images = await object[drawFunction](this);
        this.outputBuilder.addFlexList(images);
    }
}