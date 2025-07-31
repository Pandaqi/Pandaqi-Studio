import { GameConfig, MaterialConfig, rangeInteger, ResourceLoader, SettingConfig, shuffle } from "lib/pq-games";
import { OutputBuilder } from "./outputBuilder"
import { RulebookSettings } from "./rulebookSettings";
import type { RulebookParams } from "../rulebook";
import { InteractiveExampleSimulator, InteractiveExampleSimulatorParams } from "./interactiveExampleSimulator";

export interface InteractiveExampleParams
{
    id?: string, // its unique identifier 
    node?: HTMLElement, // the real node to attach it to
    callback?: Function, // the function called when you press that button
    buttonText?: string,
    sidebar?: boolean, // place it in the sidebar?
    settings?: Record<string, SettingConfig>,
    simulator?: InteractiveExampleSimulatorParams,
    config?: GameConfig,
}

const FAKE_PLAYER_NAMES = ["Anna", "Bella", "Chris", "Dennis", "Erik", "Frank", "Gini", "Harry", "Ingrid", "James", "Kayla", "Lily"];
const DEFAULT_EXAMPLE_CLASS = "rulebook-example";

export const createInteractiveExamples = (params:RulebookParams, node:HTMLElement) =>
{
    const examples = [];

    // attach any matching nodes to the logic behind them
    const examplesData = params.examples ?? {};
    for(const [id,exampleData] of Object.entries(examplesData))
    {
        const nodesMatching = Array.from(node.querySelectorAll(`[data-rulebook-example="${id}"]`)) as HTMLElement[];
        for(const nodeMatch of nodesMatching)
        {
            exampleData.node = nodeMatch;
            exampleData.id = id;
            examples.push(new InteractiveExample(exampleData));
        }
    }

    // create an example too for ones without logic (just for completeness' sake)
    const exampleClass = params.exampleClass ?? DEFAULT_EXAMPLE_CLASS;
    const existingNodes = Array.from(node.getElementsByClassName(exampleClass)) as HTMLElement[];
    for(const node of existingNodes)
    {
        if(Object.keys(examplesData).includes(node.dataset.example)) { continue; }
        examples.push(new InteractiveExample());
    }

    return examples;
}

export const planLoadExampleResources = (config:GameConfig) =>
{
    const resLoader = new ResourceLoader({ base: config._resources.base });
    resLoader.planLoadMultiple(config._resources.files, config);
    // @ts-ignore
    if(window.pqRulebookCustomResources) { resLoader.setCustomResources(window.pqRulebookCustomResources); }
    config._game.resLoader = resLoader;
    return resLoader;
}

const DEFAULT_CALLBACK = (sim:InteractiveExampleSimulator) => { return false };

export class InteractiveExample 
{
    id: string;
    buttonText: string;
    outputBuilder: OutputBuilder;
    contentNode: HTMLElement;
    node: HTMLElement;
    uiNode: HTMLElement;
    generateButton: HTMLButtonElement;
    closeButton: HTMLButtonElement;
    generateCallback: Function;
    busy:boolean;
    settings: RulebookSettings;
    config: GameConfig;
    
    constructor(params:InteractiveExampleParams = {})
    {
        this.config = params.config;
        this.id = params.id;
        this.busy = false;
        
        this.buttonText = params.buttonText ?? "Give me an example turn!";
        if(params.settings)
        {
            this.settings = new RulebookSettings().addMultiple(params.settings);
        }

        this.node = params.node;
        if(!this.node) { this.node = document.querySelector(`[data-rulebook-example="${this.id}"]`); }; // if no node given, try to find it from existing HTML
        if(!this.node) { console.error(`Interactive example cannot find its button/node with id ${this.id}`); return; }
        this.createHTML();

        if(params.sidebar) { this.node.classList.add("sidebar"); }

        this.outputBuilder = new OutputBuilder(this.contentNode);
        const resLoader = planLoadExampleResources(this.config);
        
        const isSimulating = params.simulator && params.simulator.enabled;
        const callback = params.callback ?? DEFAULT_CALLBACK;
        let callbackButton:Function;

        // if we're simulating, create one simulator and tell it that every "iteration" should run the callback
        // and pressing the button should start that simulation
        if(isSimulating) 
        {
            const sim = new InteractiveExampleSimulator(params.simulator, this);
            sim.setCallback(async () => { return callback(sim) });
            callbackButton = async () => { sim.simulate() };
        }

        // otherwise, the callback should load resources
        // and then run the simulation only _once_ with no other functionality
        if(!isSimulating)
        {
            callbackButton = async () => 
            {
                await resLoader.loadPlannedResources();
                const sim = new InteractiveExampleSimulator({ enabled: false }, this);
                return callback(sim);
            };
        }

        this.generateCallback = callbackButton;
    }

    createSimulator()
    {

    }

    createHTML()
    {
        // create root nodes to hold settings/tools and the actual content separately
        if(this.settings) { this.node.appendChild(this.settings.getContainer()) }

        const nodeUI = document.createElement("span");
        this.node.appendChild(nodeUI);
        nodeUI.classList.add("ui");
        this.uiNode = nodeUI;

        const nodeContent = document.createElement("span");
        this.node.appendChild(nodeContent);
        nodeContent.classList.add("content");
        this.contentNode = nodeContent;

        // add generate button to tools
        const btn = document.createElement("button");
        this.uiNode.appendChild(btn);
        this.generateButton = btn;
        btn.innerHTML = this.buttonText;
        btn.addEventListener("click", async () => 
        {
            if(this.busy) { return; }
            this.reset();
            
            this.busy = true;
            btn.disabled = true;
            btn.style.opacity = "0.75";
            btn.innerHTML = "Generating ...";

            await this.generateCallback();

            this.closeButton.style.display = "block";
            this.busy = false;
            btn.disabled = false;
            btn.style.opacity = "1.0";
            btn.innerHTML = this.buttonText;
        });

        const closeBtn = document.createElement("button");
        this.uiNode.appendChild(closeBtn);
        this.closeButton = closeBtn;
        closeBtn.innerHTML = "X";
        closeBtn.classList.add("rulebook-example-close-button");
        closeBtn.addEventListener("click", (ev) => 
        {
            if(this.busy) { return; }
            this.reset();
        }) 
    }

    setGenerationCallback(func:Function)
    {
        this.generateCallback = func;
    }

    getOutputBuilder()
    {
        return this.outputBuilder;
    }

    reset()
    {
        this.outputBuilder.reset();
        this.closeButton.style.display = "none";
    }

    getNumPlayers(min:number, max:number)
    {
        return rangeInteger(min, max);
    }

    getNamesAlphabetical(num:number)
    {
        return FAKE_PLAYER_NAMES.slice(0, num);
    }

    getNames(num:number)
    {
        return this.getRandomFromList(FAKE_PLAYER_NAMES, num);
    }

    getRandomFromList(list:any[], num:number)
    {
        return shuffle(list).slice(0, num);
    }
}