import { rangeInteger, shuffle } from "lib/pq-games";
import { OutputBuilder } from "./outputBuilder"
import { RulebookSettings } from "./rulebookSettings";
import type { RulebookParams } from "../rulebook";

export interface InteractiveExampleParams
{
    id: string, // its unique identifier 
    node?: HTMLElement, // the real node to attach it to
    callback?: Function, // the function called when you press that button
    buttonText?: string,
    className?: string,
    sidebar?: boolean, // place it in the sidebar?
    settings?: RulebookSettings
}

const FAKE_PLAYER_NAMES = ["Anna", "Bella", "Chris", "Dennis", "Erik", "Frank", "Gini", "Harry", "Ingrid", "James", "Kayla", "Lily"];

export const createInteractiveExamples = (params:RulebookParams, node:HTMLElement) =>
{
    const examples = [];
    const examplesData = params.examples ?? {};
    for(const [id,exampleData] of Object.entries(examplesData))
    {
        const nodesMatching = Array.from(node.querySelectorAll(`[data-example="${id}"]`)) as HTMLElement[];
        for(const nodeMatch of nodesMatching)
        {
            exampleData.node = nodeMatch;
            exampleData.id = id;
            examples.push(new InteractiveExample(exampleData));
        }
    }

    return examples;
}

export class InteractiveExample 
{
    id: string;
    className: string;
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
    
    constructor(config:InteractiveExampleParams)
    {
        this.id = config.id;
        this.busy = false;

        this.generateCallback = config.callback;
        this.className = config.className ?? "rulebook-example";
        
        this.buttonText = config.buttonText ?? "Give me an example turn!"
        this.settings = config.settings;

        this.node = config.node;
        if(!this.node) { console.error(`Interactive example cannot find its button/node with id ${this.id}`); return; }
        this.createHTML();

        this.outputBuilder = new OutputBuilder(this.contentNode);
    }

    createHTML()
    {
        // create root nodes to hold settings/tools and the actual content separately
        if(this.settings)
        {
            this.node.appendChild(this.settings.getContainer())
        }

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

    attachSettings(s:RulebookSettings)
    {
        this.uiNode.parentNode.insertBefore(s.getContainer(), this.uiNode);
    }
}