import type { RulebookParams } from "../rulebook";
import { InteractiveExampleSimulator, InteractiveExampleSimulatorParams } from "./interactiveExampleSimulator";
import { OutputBuilder } from "./outputBuilder";
import { RulebookSettings, SettingConfig } from "./settings";

export interface InteractiveExampleParams
{
    id?: string, // its unique identifier 
    node?: HTMLElement, // the real node to attach it to
    callback?: Function, // the function called when you press that button
    buttonText?: string,
    sidebar?: boolean, // place it in the sidebar?
    settings?: Record<string, SettingConfig>,
    _settings?: RulebookSettings, // protected: has the actual settings object created from raw input above
    simulator?: InteractiveExampleSimulatorParams,
}

const FAKE_PLAYER_NAMES = ["Anna", "Bella", "Chris", "Dennis", "Erik", "Frank", "Gini", "Harry", "Ingrid", "James", "Kayla", "Lily"];
const DEFAULT_EXAMPLE_CLASS = "rulebook-example";

export const createExampleHTMLForNode = (data:InteractiveExampleParams, node:HTMLElement) =>
{
    // create root nodes to hold settings/tools and the actual content separately
    if(data.settings) 
    { 
        const settings = new RulebookSettings().addMultiple(data.settings);
        node.appendChild(settings.getContainer());
        data._settings = settings;
    }

    // create UI stuff
    const nodeUI = document.createElement("div");
    node.appendChild(nodeUI);
    nodeUI.classList.add("rulebook-example-ui");

    const nodeContent = document.createElement("div");
    node.appendChild(nodeContent);
    nodeContent.classList.add("rulebook-example-content");

    // add generate button to tools
    const btn = document.createElement("button");
    nodeUI.appendChild(btn);
    btn.classList.add("rulebook-example-button");
    btn.innerHTML = data.buttonText;

    const closeBtn = document.createElement("button");
    nodeUI.appendChild(closeBtn);
    closeBtn.innerHTML = "X";
    closeBtn.classList.add("rulebook-example-button-close");
}

export const createRulebookExampleHTML = (params:RulebookParams, node:HTMLElement) : HTMLElement[] =>
{
    const examples = [];
    const examplesData = params.examples ?? {};
    const className = params.exampleClass ?? DEFAULT_EXAMPLE_CLASS;
    for(const [id,exampleData] of Object.entries(examplesData))
    {
        exampleData.id = id;

        const nodesMatching = Array.from(node.querySelectorAll(`[data-rulebook-example="${id}"]`)) as HTMLElement[];
        for(const nodeMatch of nodesMatching)
        {
            nodeMatch.classList.add(className);
            createExampleHTMLForNode(exampleData, nodeMatch); 
        }
    }
    return examples
}

export const makeExamplesInteractive = (params:RulebookParams, node:HTMLElement) : InteractiveExample[] =>
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
            examples.push(new InteractiveExample(exampleData));
        }
    }

    return examples;
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
    
    constructor(params:InteractiveExampleParams = {})
    {
        this.id = params.id;
        this.busy = false;
        
        this.buttonText = params.buttonText ?? "Give me an example turn!";
        if(params._settings) { this.settings = params._settings; }
        else if(params.settings) { this.settings = new RulebookSettings().addMultiple(params.settings); }

        this.node = params.node;
        if(!this.node) { this.node = document.querySelector(`[data-rulebook-example="${this.id}"]`); }; // if no node given, try to find it from existing HTML
        if(!this.node) { console.error(`Interactive example cannot find its button/node with id ${this.id}`); return; }

        // if you create this object directly, this creates the necessary HTML for it ...
        if(this.node.innerHTML.trim().length <= 0) { createExampleHTMLForNode(params, params.node); }

        // ... because THIS expects that HTML to already exists and makes it interactive
        this.makeButtonsInteractive();

        this.outputBuilder = new OutputBuilder(this.contentNode);
        if(params.sidebar) { this.node.classList.add("sidebar"); }

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
                const sim = new InteractiveExampleSimulator({ enabled: false }, this);
                return callback(sim);
            };
        }

        this.generateCallback = callbackButton;
        this.reset();
    }

    makeButtonsInteractive()
    {
        // @TODO: error/fail-safe if these don't exist?
        this.uiNode = this.node.getElementsByClassName("rulebook-example-ui")[0] as HTMLElement;
        this.contentNode = this.node.getElementsByClassName("rulebook-example-content")[0] as HTMLElement;
        const btn = this.node.getElementsByClassName("rulebook-example-button")[0] as HTMLButtonElement;
        this.generateButton = btn;
        btn.addEventListener("click", async () => 
        {
            if(this.busy) { return; }
            this.reset();
            
            this.busy = true;
            btn.disabled = true;
            btn.style.opacity = "0.75";
            btn.innerHTML = "Generating ...";
            this.contentNode.style.display = "block";
            setTimeout(() => { this.contentNode.scrollIntoView({ behavior: 'smooth', block: "start" }); }, 100);

            this.generateButton.classList.add("rulebook-example-button-active");
            this.closeButton.classList.add("rulebook-example-button-active");

            await this.generateCallback();

            this.closeButton.style.display = "block";
            this.busy = false;
            btn.disabled = false;
            btn.style.opacity = "1.0";
            btn.innerHTML = this.buttonText;
        });

        const btnClose = this.node.getElementsByClassName("rulebook-example-button-close")[0] as HTMLButtonElement;
        this.closeButton = btnClose;
        this.closeButton.style.display = "none";
        btnClose.addEventListener("click", (ev) => 
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
        this.closeButton.classList.remove("rulebook-example-button-active");
        this.contentNode.style.display = "none";
        this.generateButton.classList.remove("rulebook-example-button-active");
    }

    getNumPlayers(min:number, max:number)
    {
        return min + Math.round(Math.random() * (max-min+1));
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
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push(list.splice(Math.floor(Math.random() * list.length), 1));
        }
        return arr;
    }
}