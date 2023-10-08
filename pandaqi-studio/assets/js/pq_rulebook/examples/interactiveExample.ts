import OutputBuilder from "./outputBuilder"
import Random from "js/pq_games/tools/random/main"

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
    
    constructor(config:Record<string,any>)
    {
        this.id = config.id;

        this.className = "rules-example";
        this.names = ["Anna", "Bella", "Chris", "Dennis", "Erik", "Frank", "Gini", "Harry", "Ingrid", "James", "Kayla", "Lily"];
        this.buttonText = "Give me an example turn!"

        this.findCorrespondingHTML();
        this.createHTML();

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
        btn.addEventListener("click", async () => {
            this.reset();
            await this.generateCallback();
            this.closeButton.style.display = "block";
        });

        const closeBtn = document.createElement("button");
        this.uiNode.appendChild(closeBtn);
        this.closeButton = closeBtn;
        closeBtn.innerHTML = "X";
        closeBtn.classList.add("example-close-button");
        closeBtn.addEventListener("click", (ev) => {
            this.reset();
        }) 
    }

    setGenerationCallback(func)
    {
        this.generateCallback = func;
    }

    setButtonText(txt)
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
}