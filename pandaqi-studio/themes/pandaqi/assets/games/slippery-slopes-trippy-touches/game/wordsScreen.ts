import { CONFIG } from "games/slippery-slopes/shared/config";
import GameState from "./gameState";
import { PandaqiWords } from "lib/pq-words";
import loadPandaqiWords from "games/slippery-slopes/shared/loadPandaqiWords";

export default class WordsScreen
{
    node: HTMLDivElement;
    pandaqiWords: PandaqiWords;
    wordSelected: string;

    async setup()
    {
        this.setupHTML();
        this.hide();
        await this.setupWords();
    }

    getContainer() { return this.node; }
    setupHTML()
    {
        this.node = document.createElement("div");
        this.node.classList.add("words-screen");
    }

    async setupWords()
    {
        this.pandaqiWords = await loadPandaqiWords(CONFIG);
    }

    hide()
    {
        this.node.innerHTML = "";
        this.node.style.display = "none";
    }

    show()
    {
        this.node.style.display = "block";

        const subCont = document.createElement("div");
        this.node.appendChild(subCont);

        const h = document.createElement("h2");
        h.innerHTML = "Your Words";
        subCont.appendChild(h);

        const wordContainer = document.createElement("div");
        wordContainer.classList.add("word-options");
        const words = this.pandaqiWords.getRandomMultiple(CONFIG.wordCards.numPerCard, true);


        for(const word of words)
        {
            const wordStr = word.getWord();
            const option = document.createElement("div");
            option.classList.add("word-option");
            option.innerHTML = "<span class='word'>" + wordStr + "</span><br/><span class='category'>(" + word.getMetadata().cat + ")</span>";
            wordContainer.appendChild(option);

            // clicking to select an option, disabling all others
            option.addEventListener("click", (ev) => {
                this.wordSelected = wordStr;
                for(const child of Array.from(wordContainer.children))
                {
                    child.classList.remove("selected");
                }
                option.classList.add("selected");
            })
        }

        wordContainer.children[0].dispatchEvent(new Event("click"));

        const outOfWords = words.length <= 0;
        if(outOfWords)
        {
            wordContainer.innerHTML = "Woah, we're out of words!";
        }

        subCont.appendChild(wordContainer);

        const btn = document.createElement("button");
        btn.innerHTML = "Start my turn!";
        btn.addEventListener("click", (ev) => {
            CONFIG.signalManager.dispatchEvent("changeState", GameState.SLIDERS);
        });
        subCont.appendChild(btn);
    }
}