import { Vector2, MaterialVisualizer, ResourceLoader } from "lib/pq-games"
import { InteractiveExample, InteractiveExampleParams } from "./interactiveExample"
import { InteractiveExampleSimulator, InteractiveExampleSimulatorParams } from "./interactiveExampleSimulator"
import { RulebookSettings } from "./rulebookSettings"

export interface InteractiveExampleGeneratorParams
{
    simulateConfig?: InteractiveExampleSimulatorParams,
    id?: string,
    buttonText?: string,
    config?: Record<string,any>,
    itemSize?: Vector2,
    pickers?: Record<string, Function>,
    settings?: RulebookSettings,
    callback: Function
}

const DEFAULT_CALLBACK = (sim:InteractiveExampleSimulator) => { return false };

export const generateInteractiveExample = (p:InteractiveExampleGeneratorParams) =>
{
    // prepare settings and visualizer based on that
    const config = p.config ?? {};

    const resLoader = new ResourceLoader({ base: config._resources.base });
    resLoader.planLoadMultiple(config._resources.files, config);
    // @ts-ignore
    if(window.pqRulebookCustomResources) { resLoader.setCustomResources(window.pqRulebookCustomResources); }
    config._game.resLoader = resLoader;

    const itemSize = p.itemSize ?? new Vector2(512,512);
    const visualizer = new MaterialVisualizer(config, itemSize);
    
    const pickers = p.pickers ?? {};
    const callback = p.callback ?? DEFAULT_CALLBACK;
    const settings = p.settings;

    // create actual button and its callback
    const id = p.id ?? "turn";
    const exampleConfig:InteractiveExampleParams = {
        id: id,
        buttonText: p.buttonText,
        settings: settings
    };
    const e = new InteractiveExample(exampleConfig);

    // this simulator actually SHOWS stuff, so we want to load resources/visualizer/outputBuilder
    // it only does so upon INTERACTION => you press the button
    const simCfgButton = Object.assign({}, p.simulateConfig);
    Object.assign(simCfgButton, {
        enabled: false,
        pickers: pickers,
        visualizer: visualizer,
        outputBuilder: e.getOutputBuilder()
    })

    const callbackRootButton = async () =>
    {
        await resLoader.loadPlannedResources();
        const sim = new InteractiveExampleSimulator(simCfgButton); // simulation turned OFF by default
        return callback(sim);
    }
    e.setGenerationCallback(callbackRootButton);

    // this simulator does actual SIMULATION (if enabled; loops and prints results)
    // it shows nothing but runs automatically
    const simulateConfig = Object.assign({}, p.simulateConfig);
    Object.assign(simulateConfig, { settings: settings, pickers: pickers });
    const simulator = new InteractiveExampleSimulator(simulateConfig);
    const callbackRootSimulator = async () => { return callback(simulator); }
    simulator.setCallback(callbackRootSimulator);
    simulator.simulate();
}