import CONFIG from "./config";

export default class Game
{
    node: HTMLDivElement;
    
    start()
    {
        this.createContainer();
        this.createWelcomeScreen();
    }

    createContainer()
    {
        const div = document.createElement("div");
        div.classList.add("game-container");
        document.body.appendChild(div);
        this.node = div;
    }

    clear()
    {
        this.node.innerHTML = "";
    }

    createContinueButton(label:string) : HTMLButtonElement
    {
        const btn = document.createElement("button");
        btn.innerHTML = label;
        btn.addEventListener("click", (ev) => {
            this.createWordScreen();
        });
        return btn
    }

    createHideButton(wordContainer) : HTMLButtonElement
    {
        let hidden = false;

        const btn = document.createElement("button");
        btn.innerHTML = "Hide Words";
        btn.addEventListener("click", (ev) => {
            hidden = !hidden;
            let val = hidden ? "transparent" : "currentcolor";
            for(const child of wordContainer.children)
            {
                child.style.color = val;
            }
        });
        return btn;
    }

    createWelcomeScreen()
    {
        this.clear();

        const subCont = document.createElement("div");
        const h = document.createElement("h2");
        h.innerHTML = "Welcome!";
        subCont.appendChild(h);

        let p = document.createElement("p");
        p.innerHTML = "On your turn, simply tap the button to get " + CONFIG.wordCards.numPerCard + " new words.";
        subCont.appendChild(p);

        p = document.createElement("p");
        p.innerHTML = "Don't forget to hide the phone screen (or click \"hide words\"). To prevent accidentally revealing your options to the other players!";
        subCont.appendChild(p);

        subCont.appendChild(this.createContinueButton("Start Game"));

        this.node.appendChild(subCont);
    }
    
    createWordScreen()
    {
        this.clear();

        const subCont = document.createElement("div");

        const h = document.createElement("h2");
        h.innerHTML = "Your Words";
        subCont.appendChild(h);

        const wordContainer = document.createElement("div");
        wordContainer.classList.add("word-options");
        const words = CONFIG.pandaqiWords.getRandomMultiple(CONFIG.wordCards.numPerCard, true);
        for(const word of words)
        {
            const option = document.createElement("div");
            option.classList.add("word-option");
            option.innerHTML = "<span class='word'>" + word.getWord() + "</span><br/><span class='category'>(" + word.getMetadata().cat + ")</span>";
            wordContainer.appendChild(option);
        }

        if(words.length <= 0)
        {
            wordContainer.innerHTML = "Woah, we're out of words!";
        }

        subCont.appendChild(wordContainer);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        subCont.appendChild(buttonContainer);
        buttonContainer.appendChild(this.createHideButton(wordContainer));
        buttonContainer.appendChild(this.createContinueButton("Next Turn"));

        this.node.appendChild(subCont);
    }
}