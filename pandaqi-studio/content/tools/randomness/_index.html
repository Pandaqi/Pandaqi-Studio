---
type: "tools"
title: "Randomness"
---

<style type="text/css">
    h2 {
        font-family: "Dosis", sans-serif;
        text-align: center;
        margin: 0;
        margin-bottom: 0.5em;
    }

    .tool-block {
        background-color: rgba(255,255,255,0.68);
        border-radius: 0.5em;
        margin-top: 1em;
        margin-bottom: 1em;
    }

    .settings-block {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-content: center;
        align-items: center;
        gap: 0.5em;
    }

    .setting {
        display: flex;
        justify-content: space-around;
        align-content: center;
        align-items: center;
        gap: 0.5em;
        margin: 0;
        padding: 0;
    }

    .feedback {
        display: none;
        margin: 0;
        padding: 0;
    }

    .feedback-flex {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-content: center;
        align-items: center;
        gap: 0.5em;
        margin: 0;
        padding: 0.5em;
    }

    .feedback-text-only {
        background-color: white;
        color: black;
        font-weight: bold;
        font-size: 2em;
    }

    input {
        font-size: 1em;
        padding: 0.25em;
    }

    input[type="checkbox"], input[type="range"]
    {
        box-shadow: none;
    }

    label {
        white-space: nowrap;
    }

    .desc {
        text-align: center;
        margin: 0;
        padding: 0;
        opacity: 0.8;
        font-size: 0.8em;
    }

    .list-container {
        margin: 0;
        padding: 0;
    }

    .list-entry {
        display: flex;
        gap: 0.5em;
        padding: 0;
        margin: 0;
    }

    .list-entry-button {
        flex-shrink: 6;
    }

    .dice-canvas-container, .coin-canvas-container {
        margin: 0;
        padding: 0;
        filter: drop-shadow(0px 0px 4px #555);
    }

    .dice-canvas {
        border: 3px solid #111111;
    }

    canvas {
        width: 96px;
        height: 96px;
        border-radius: 0.5em;
    }

    .popUp {
        animation-name: popUp;
        animation-duration: 0.3s;
        animation-iteration-count: 1;
        animation-timing-function: ease;
        animation-fill-mode: forwards;
    }
    
    @keyframes popUp {
        from { transform: scale(1.05); }
        to { transform: scale(1.0); }
    }

</style>

<h1>Random</h1>

<div class="tool-block">
    <h2>Coins</h2>
    <div id="coinFeedback" class="feedback"></div>
    <div class="settings-block">
        <div class="setting"><label for="numberOfCoins"># Coins?</label><input id="numberOfCoins" type="number" value="1" min="1" max="10" /></div>
        <div class="setting"><label for="fairnessOfCoins">Fairness?</label><input id="fairnessOfCoins" type="range" value="50" min="0" max="100" /></div>
    </div>
    <button id="coin">Flip a coin</button>
    <p class="desc">Flips a coin, with FAIR% chance of heads (H) and (1-FAIR)% chance of tails (T).</p>
</div>

<div class="tool-block">
    <h2>Dice</h2>
    <div id="diceFeedback" class="feedback"></div>
    <div class="settings-block">
        <div class="setting"><label for="numberOfDice"># Dice?</label><input id="numberOfDice" type="number" value="1" min="1" max="10" /></div>
        <div class="setting"><label for="sidesOnDice"># Sides?</label><input id="sidesOnDice" type="number" value="6" min="1" max="64" /></div>
    </div>
    <button id="dice">Throw the dice</button>
    <p class="desc">Throws # dice, each with # sides, all with equal chance of appearing.</p>
</div>

<div class="tool-block">
    <h2>Numbers</h2>
    <div id="numberFeedback" class="feedback"></div>
    <div class="settings-block">
        <div class="setting"><label for="numberMin">Low?</label><input id="numberMin" type="number" value="1" /></div>
        <div class="setting"><label for="numberMax">High?</label><input id="numberMax" type="number" value="10" /></div>
        <div class="setting"><label for="numberInteger">Round?</label><input id="numberInteger" type="checkbox" checked /></div>
    </div>
    <button id="number">Get random number</button>
    <p class="desc">Returns a number between the boundaries (both <em>inclusive</em>).</p>
</div>

<div class="tool-block">
    <h2>List</h2>
    <div id="listFeedback" class="feedback"></div>
    <div id="listContainer" class="list-container"></div>
    <button id="listAdd">Add new entry</button>
    <button id="list">Draw random entry from list</button>
    <p class="desc">Input all entries for the list. The button will draw a random one from it. (Empty entries are ignored.)</p>
</div>

<script>
const Coin = class {
    constructor()
    {
        this.displaySize = 256;
        this.lineWidth = 0.05;
        this.colors = {
            heads: "#FFAAAA",
            tails: "#AAAAFF"
        }

        this.colorsStroke = {
            heads: "#330000",
            tails: "#000033"
        }

        this.texts = {
            heads: "H",
            tails: "T"
        }

        this.coinButton = document.getElementById("coin");
        this.coinFeedback = document.getElementById("coinFeedback");
        this.numberOfCoins = document.getElementById("numberOfCoins");
        this.fairnessOfCoins = document.getElementById("fairnessOfCoins");

        if(!this.coinButton) { return; }
        if(!this.coinFeedback) { return; }

        this.coinFeedbackCont = document.createElement("div");
        this.coinFeedbackCont.classList.add("feedback-flex");
        this.coinFeedback.appendChild(this.coinFeedbackCont);

        this.coinButton.addEventListener("click", this.generate.bind(this));
    }

    createCoinVisual(result)
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
        ctx.testBaseline = "middle"
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

const Dice = class {
    constructor()
    {
        this.diceDotPositions = {
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
        this.displaySize = 256;
        this.diceDotRadius = 0.05;
        this.diceDotColor = "#111111";

        this.diceButton = document.getElementById("dice");
        this.diceFeedback = document.getElementById("diceFeedback");
        this.numberOfDice = document.getElementById("numberOfDice") || { value: 1 };
        this.sidesOnDice = document.getElementById("sidesOnDice") || { value: 6 };
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
            ctx.testBaseline = "middle"
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

const Numbers = class {
    constructor()
    {
        this.numberButton = document.getElementById("number");
        this.numberFeedback = document.getElementById("numberFeedback");
        this.numberMin = document.getElementById("numberMin") || { value: 1 };
        this.numberMax = document.getElementById("numberMax") || { value: 10 };
        this.numberInteger = document.getElementById("numberInteger") || { checked: true };
        
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

        this.numberFeedbackCont.innerHTML = result;
        playPopupAnimation(this.numberFeedbackCont);
    }
}

const List = class {
    constructor()
    {
        this.entries = [];
        this.entriesMaximum = 20;
        this.listButton = document.getElementById("list");
        this.listAddButton = document.getElementById("listAdd");
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
            const inp = entry.getElementsByClassName("list-entry-input");
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

function playPopupAnimation(node)
{
    node.classList.remove("popUp");
    void node.offsetWidth;
    node.classList.add("popUp");
}

const COIN = new Coin();
const DICE = new Dice();
const NUMBER = new Numbers();
const LIST = new List();

    
</script>

