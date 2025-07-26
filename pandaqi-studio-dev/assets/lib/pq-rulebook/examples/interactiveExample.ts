import OutputBuilder from "./outputBuilder"
import Random from "js/pq_games/tools/random/main"
import RulesSettings from "./rulesSettings";

interface InteractiveExampleParams
{
    id: string,
    buttonText?: string,
    className?: string,
}

export { InteractiveExampleParams }
export default class InteractiveExample 
{
    id: string;
    className: string;
    names: string[];
    buttonText: string;
    outputBuilder: OutputBuilder;
    contentNode: HTMLElement;
    node: HTMLElement;
    uiNode: HTMLElement;
    generateButton: HTMLButtonElement;
    closeButton: HTMLButtonElement;
    generateCallback: Function;
    busy:boolean;
    
    constructor(config:InteractiveExampleParams)
    {
        this.id = config.id;
        this.busy = false;

        this.className = config.className ?? "rules-example";
        this.names = ["Anna", "Bella", "Chris", "Dennis", "Erik", "Frank", "Gini", "Harry", "Ingrid", "James", "Kayla", "Lily"];
        
        this.buttonText = config.buttonText ?? "Give me an example turn!"

        this.findCorrespondingHTML();
        this.createHTML();

        this.setButtonText();
        this.outputBuilder = new OutputBuilder(this.contentNode);
    }

    findCorrespondingHTML()
    {
        const exampleNodes = Array.from(document.getElementsByClassName(this.className));
        let node = null
        for(const exNode of exampleNodes)
        {
            // @ts-ignore
            if(exNode.dataset.exampleid != this.id) { continue; }
            node = exNode;
            break;
        }

        if(!node)
        {
            return console.error("Interactive example cannot find its button with id: " + this.id);
        }

        this.node = node;
        this.uiNode = node.getElementsByClassName("ui")[0];
        this.contentNode = node.getElementsByClassName("content")[0];

    }

    createHTML()
    {
        const btn = document.createElement("button");
        this.uiNode.appendChild(btn);
        this.generateButton = btn;
        this.setButtonText(this.buttonText);
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
        closeBtn.classList.add("example-close-button");
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

    setButtonText(txt:string = this.buttonText)
    {
        this.buttonText = txt;
        this.generateButton.innerHTML = this.buttonText;
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

    getNumPlayers(min, max)
    {
        return Random.rangeInteger(min, max);
    }

    getNamesAlphabetical(num)
    {
        return this.names.slice(0, num);
    }

    getNames(num)
    {
        return this.getRandomFromList(this.names, num);
    }

    getRandomFromList(list, num)
    {
        return Random.shuffle(list).slice(0, num);
    }

    
    attachSettings(s:RulesSettings)
    {
        this.uiNode.parentNode.insertBefore(s.getContainer(), this.uiNode);
    }

}