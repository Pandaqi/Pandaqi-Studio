
const playPopupAnimation = (node:HTMLElement) =>
{
    node.classList.remove("popUp");
    void node.offsetWidth;
    node.classList.add("popUp");
}

class Coin
{
    displaySize = 256;
    lineWidth = 0.05;
    colors = {
        heads: "#FFAAAA",
        tails: "#AAAAFF"
    }

    colorsStroke = {
        heads: "#330000",
        tails: "#000033"
    }

    texts = {
        heads: "H",
        tails: "T"
    }

    coinButton: HTMLButtonElement;
    coinFeedback: HTMLElement;
    numberOfCoins: HTMLInputElement;
    fairnessOfCoins: HTMLInputElement;
    coinFeedbackCont: HTMLElement;

    constructor()
    {
        this.coinButton = document.getElementById("coin") as HTMLButtonElement;
        this.coinFeedback = document.getElementById("coinFeedback");
        this.numberOfCoins = document.getElementById("numberOfCoins") as HTMLInputElement;
        this.fairnessOfCoins = document.getElementById("fairnessOfCoins") as HTMLInputElement;

        if(!this.coinButton) { return; }
        if(!this.coinFeedback) { return; }

        this.coinFeedbackCont = document.createElement("div");
        this.coinFeedbackCont.classList.add("feedback-flex");
        this.coinFeedback.appendChild(this.coinFeedbackCont);

        this.coinButton.addEventListener("click", this.generate.bind(this));
    }

    createCoinVisual(result:("heads"|"tails"))
    {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const s = this.displaySize;
        canvas.width = s;
        canvas.height = s;

        const radius = 0.9*(0.5*s);

        ctx.fillStyle = this.colors[result];
        ctx.strokeStyle = this.colorsStroke[result];
        ctx.lineWidth = this.lineWidth*s;

        ctx.beginPath();
        ctx.arc(0.5*s, 0.5*s, radius, 0, 2*Math.PI, false);
        ctx.stroke();
        ctx.fill();

        const textToDisplay = this.texts[result];
        const fontSize = 0.25*s;
        ctx.fillStyle = this.colorsStroke[result];
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = fontSize + "px 'Dosis'";
        ctx.fillText(textToDisplay, 0.5*s, 0.5*s + 0.42*fontSize);

        return canvas;
    }

    generate()
    {
        this.coinFeedback.style.display = "block";
        this.coinFeedbackCont.innerHTML = "";

        const fairness = Math.max(Math.min(parseFloat(this.fairnessOfCoins.value) / 100.0, 1.0), 0.0);
        const numCoins = Math.round(parseFloat(this.numberOfCoins.value));
        for(let i = 0; i < numCoins; i++)
        {
            const elem = document.createElement("div");
            this.coinFeedbackCont.appendChild(elem);
            elem.classList.add("coin-canvas-container");

            const result = Math.random() <= fairness ? "heads" : "tails";
            elem.appendChild(this.createCoinVisual(result));
        }
        playPopupAnimation(this.coinFeedbackCont);
    }
}

class Dice 
{
    diceDotPositions = {
        1: [{ x: 0.5, y: 0.5 }],
        2: [{ x: 0.25, y: 0.75 }, { x: 0.75, y: 0.25 }],
        3: [{ x: 0.25, y: 0.75}, { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.25 }],
        4: [{ x: 0.25, y: 0.25}, { x: 0.75, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 0.25, y: 0.75 }],
        5: [{ x: 0.25, y: 0.25}, { x: 0.75, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.75 }, { x: 0.25, y: 0.75 }],
        6: [{ x: 0.25, y: 0.25}, { x: 0.75, y: 0.25 }, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 }, { x: 0.75, y: 0.75 }, { x: 0.25, y: 0.75 }],
        7: [{ x: 0.25, y: 0.25}, { x: 0.75, y: 0.25 }, { x: 0.25, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.5 }, { x: 0.75, y: 0.75 }, { x: 0.25, y: 0.75 }],
        8: [{ x: 0.25, y: 0.25}, { x: 0.5, y: 0.25 }, { x: 0.75, y: 0.25 }, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 }, { x: 0.75, y: 0.75 }, { x: 0.5, y: 0.75 }, { x: 0.25, y: 0.75 }],
        9: [{ x: 0.25, y: 0.25}, { x: 0.5, y: 0.25 }, { x: 0.75, y: 0.25 }, { x: 0.25, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.5 }, { x: 0.75, y: 0.75 }, { x: 0.5, y: 0.75 }, { x: 0.25, y: 0.75 }],
    };

    displaySize = 256;
    diceDotRadius = 0.05;
    diceDotColor = "#111111";

    diceButton: HTMLButtonElement;
    diceFeedback: HTMLElement;
    numberOfDice: HTMLInputElement;
    sidesOnDice: HTMLInputElement;
    diceFeedbackCont: HTMLElement;

    constructor()
    {
        this.diceButton = document.getElementById("dice") as HTMLButtonElement;
        this.diceFeedback = document.getElementById("diceFeedback");
        this.numberOfDice = document.getElementById("numberOfDice") as HTMLInputElement;
        this.sidesOnDice = document.getElementById("sidesOnDice") as HTMLInputElement;
        if(!this.diceButton || !this.diceFeedback) { return; }

        this.diceFeedbackCont = document.createElement("div");
        this.diceFeedbackCont.classList.add("feedback-flex");
        this.diceFeedback.appendChild(this.diceFeedbackCont);

        this.diceButton.addEventListener("click", this.generate.bind(this));
    }

    createDiceVisual(num = 1, useNumbers = false)
    {
        const canvas = document.createElement("canvas");
        canvas.classList.add("dice-canvas");
        const ctx = canvas.getContext("2d");
        const s = this.displaySize;
        const r = this.diceDotRadius*s;

        canvas.width = s;
        canvas.height = s;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, s, s);

        ctx.fillStyle = this.diceDotColor;
        if(useNumbers)
        {
            const fontSize = 0.25*s;
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = fontSize + "px 'Dosis'";
            ctx.fillText(num.toString(), 0.5*s, 0.5*s + 0.42*fontSize);
        } 
        else 
        {
            const positions = this.diceDotPositions[num] || [];
            for(const pos of positions)
            {
                ctx.beginPath();
                ctx.arc(pos.x*s, pos.y*s, r, 0, 2*Math.PI, false);
                ctx.fill();
            }
        }

        return canvas;
    }

    generate()
    {
        this.diceFeedback.style.display = "block";
        this.diceFeedbackCont.innerHTML = "";

        const num = Math.round(parseFloat(this.numberOfDice.value));
        const sides = Math.round(parseFloat(this.sidesOnDice.value));
        const useNumbers = !this.diceDotPositions[sides];

        for(let i = 0; i < num; i++)
        {
            const elem = document.createElement("div");
            elem.classList.add("dice-canvas-container");
            const side = 1 + Math.floor(Math.random()*sides);
            elem.appendChild(this.createDiceVisual(side, useNumbers));
            this.diceFeedbackCont.appendChild(elem);
        }

        playPopupAnimation(this.diceFeedbackCont);
    }
}

class Numbers
{
    numberButton: HTMLButtonElement;
    numberFeedback: HTMLElement;
    numberMin: HTMLInputElement;
    numberMax: HTMLInputElement;
    numberInteger: HTMLInputElement;
    numberFeedbackCont: HTMLElement;

    constructor()
    {
        this.numberButton = document.getElementById("number") as HTMLButtonElement;
        this.numberFeedback = document.getElementById("numberFeedback");
        this.numberMin = document.getElementById("numberMin") as HTMLInputElement;
        this.numberMax = document.getElementById("numberMax") as HTMLInputElement;
        this.numberInteger = document.getElementById("numberInteger") as HTMLInputElement;
        
        if(!this.numberButton || !this.numberFeedback) { return; }

        this.numberFeedbackCont = document.createElement("div");
        this.numberFeedbackCont.classList.add("feedback-flex", "feedback-text-only");
        this.numberFeedback.appendChild(this.numberFeedbackCont);

        this.numberButton.addEventListener("click", this.generate.bind(this));
    }

    generate()
    {
        this.numberFeedback.style.display = "block";

        const min = parseFloat(this.numberMin.value);
        const max = parseFloat(this.numberMax.value);
        if(max <= min)
        {
            this.numberFeedbackCont.innerHTML = "Max value has to be larger than min value";
            return;
        }

        const makeInteger = this.numberInteger.checked;
        const epsilon = 0.005; // to make top end inclusive
        let range = (max - min + epsilon);
        if(makeInteger) { range += (1.0 - epsilon); }

        let result = min + Math.random() * range;
        if(makeInteger) { result = Math.floor(result); }
        else { result = Math.round(result*100)/100.0; }

        this.numberFeedbackCont.innerHTML = result.toString();
        playPopupAnimation(this.numberFeedbackCont);
    }
}

class List 
{
    entries: HTMLElement[]
    entriesMaximum = 20

    listButton: HTMLButtonElement
    listAddButton: HTMLButtonElement
    listFeedback: HTMLElement
    listContainer: HTMLElement
    listFeedbackCont: HTMLElement

    constructor()
    {
        this.entries = [];
        this.listButton = document.getElementById("list") as HTMLButtonElement;
        this.listAddButton = document.getElementById("listAdd") as HTMLButtonElement;
        this.listFeedback = document.getElementById("listFeedback");
        this.listContainer = document.getElementById("listContainer");
        if(!this.listButton || !this.listFeedback) { return; }
        this.setup();
    }

    deleteExistingEntry(e)
    {
        const idx = this.entries.indexOf(e);
        if(idx < 0) { return console.error("Can't delete non-existing entry!"); }
        e.remove();
        this.entries.splice(idx, 1);
        this.checkEntryMaximum();
    }

    createEmptyEntry()
    {
        const cont = document.createElement("div");
        this.listContainer.appendChild(cont);
        cont.classList.add("list-entry");

        const input = document.createElement("input");
        cont.appendChild(input);
        input.classList.add("list-entry-input");
        input.type = "text";
        input.placeholder = " ... new item here ... "

        const removeBtn = document.createElement("button");
        cont.appendChild(removeBtn);
        removeBtn.classList.add("list-entry-button");
        removeBtn.innerHTML = "X"
        removeBtn.addEventListener("click", (ev) => {
            this.deleteExistingEntry(cont);
        })

        this.entries.push(cont);
        this.checkEntryMaximum();
    }

    checkEntryMaximum()
    {
        this.listAddButton.disabled = (this.entries.length >= this.entriesMaximum);
    }

    getEntriesAsStrings()
    {
        const arr = [];
        for(const entry of this.entries)
        {
            const inp = Array.from(entry.getElementsByClassName("list-entry-input")) as HTMLInputElement[];
            if(!inp || inp.length <= 0) { continue; }
            const val = inp[0].value;
            if(!val) { continue; }
            arr.push(val);
        }
        return arr;
    }

    setup() { 
        this.listFeedbackCont = document.createElement("div");
        this.listFeedbackCont.classList.add("feedback-flex", "feedback-text-only");
        this.listFeedback.appendChild(this.listFeedbackCont);

        this.listButton.addEventListener("click", this.generate.bind(this));
        this.listAddButton.addEventListener("click", this.createEmptyEntry.bind(this));
        this.createEmptyEntry(); 
    }

    generate()
    {
        this.listFeedback.style.display = "block";

        const list = this.getEntriesAsStrings();
        const numEntries = list.length;
        const noEntries = numEntries <= 0;
        if(noEntries) 
        { 
            this.listFeedbackCont.innerHTML = "Can't draw from empty list!";
            return;
        }

        const randomElement = list[Math.floor(Math.random()*list.length)];
        this.listFeedbackCont.innerHTML = randomElement;
        playPopupAnimation(this.listFeedbackCont);
    }
}

const COIN = new Coin();
const DICE = new Dice();
const NUMBER = new Numbers();
const LIST = new List();

    