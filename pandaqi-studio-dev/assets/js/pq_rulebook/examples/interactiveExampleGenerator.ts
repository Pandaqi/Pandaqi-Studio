import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer"
import Point from "js/pq_games/tools/geometry/point"
import InteractiveExample from "./interactiveExample"
import InteractiveExampleSimulator, { InteractiveExampleSimulatorParams } from "./interactiveExampleSimulator"

interface InteractiveExampleGeneratorParams
{
    simulateConfig?: InteractiveExampleSimulatorParams,
    id?: string,
    buttonText?: string,
    config?: Record<string,any>,
    itemSize?: Point,
    pickers?: Record<string, any>,
    callback: Function
}

export { InteractiveExampleGenerator, InteractiveExampleGeneratorParams }
export default class InteractiveExampleGenerator
{
    id: string
    config: Record<string,any>
    pickers: Record<string, any>
    visualizer: MaterialVisualizer
    simulator: InteractiveExampleSimulator

    constructor(p:InteractiveExampleGeneratorParams)
    {
        // the "simulator" object is the one thing we pass around into the generator function
        // it keeps track of stats, gives access to the outputBuilder, etcetera
        this.simulator = new InteractiveExampleSimulator(p.simulateConfig ?? {});

        // prepare settings and visualizer based on that
        this.config = p.config ?? {};
        const resLoader = new ResourceLoader({ base: this.config.assetsBase });
        resLoader.planLoadMultiple(this.config.assets, this.config);

        this.config.resLoader = resLoader;
        this.config.itemSize = p.itemSize ?? new Point(512,512);
        this.visualizer = new MaterialVisualizer(this.config);
        
        // prepare all pickers
        const pickers = p.pickers ?? {};
        this.pickers = {};
        for(const [key,pickerClass] of Object.entries(pickers))
        {
            const p = new pickerClass();
            p.generate();
            this.pickers[key] = p;
        }

        // create actual button and its callback
        const id = p.id ?? "turn";
        const buttonText = p.buttonText ?? "Give me an example turn!";
        const e = new InteractiveExample({ id: id });
        e.setButtonText(buttonText);

        const callback = p.callback;
        const simCfgButton = Object.assign({}, p.simulateConfig);
        simCfgButton.enabled = false;
        const callbackRootButton = async () =>
        {
            await resLoader.loadPlannedResources();

            const sim = new InteractiveExampleSimulator(simCfgButton); // simulation turned OFF by default
            sim.setPickers(this.pickers);
            sim.setOutputBuilder(e.getOutputBuilder());
            sim.setVisualizer(this.visualizer);

            return callback(sim);
        }
        e.setGenerationCallback(callbackRootButton);

        // create simulator and its callback (which just doesn't need any visual/printing elements)
        // if this is enabled, `simulate` will automatically loop and print results (otherwise does nothing)
        const callbackRootSimulator = async () => {
            return callback(this.simulator);
        }
        this.simulator.setCallback(callbackRootSimulator);
        this.simulator.setPickers( this.pickers );
        this.simulator.simulate();
    }
}