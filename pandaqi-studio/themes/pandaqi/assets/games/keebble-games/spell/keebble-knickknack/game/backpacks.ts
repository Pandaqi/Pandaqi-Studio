import { CONFIG } from "./config"

export default class Backpacks 
{
    game: any;
    backpacks: Record<string,string[]>;
    backpackNodes: Record<string,HTMLElement>;
    node: HTMLDivElement;

    constructor(game: any)
    {
        this.game = game;
        this.backpacks = {};
        this.backpackNodes = {};
        for(let playerName of this.game.players.getPlayerNames())
        {
            this.backpacks[playerName] = [];
            this.backpackNodes[playerName] = null;
        }

        let backpacksEnabled = CONFIG.expansions.beefyBackpacks;
        if(!backpacksEnabled) { return; }

        this.createButtonHTML();
        this.node = this.createWindowHTML();
    }

    createButtonHTML()
    {
        let cont = document.createElement("div");
        cont.classList.add("backpacks-button-container");
        this.game.header.getContainer().appendChild(cont);

        let btn = document.createElement("button");
        cont.appendChild(btn);
        btn.classList.add("backpacks-button", "button-look");
        btn.innerHTML = "<span class='suboption-sprite suboption-sprite-empty_backpack suboption-sprite-small'></span>";
        btn.addEventListener("click", (ev) => {
            this.toggleWindow();
        });
    }
    
    createWindowHTML()
    {
        let cont = document.createElement("div");
        cont.classList.add("backpacks-window");
        cont.style.display = 'none';
        document.body.appendChild(cont);

        for(let [name,bp] of Object.entries(this.backpacks))
        {
            let div = document.createElement("div");
            div.classList.add("player-backpack-container", "disable-select");
            cont.appendChild(div);

            div.addEventListener("click", (ev) => {
                this.addPreviousOptionToBackpack(name);
            });

            let nameNode = document.createElement("div");
            div.appendChild(nameNode);
            nameNode.innerHTML = name;

            let backpackNode = document.createElement("div");
            div.appendChild(backpackNode);
            backpackNode.innerHTML = bp.join(", ");
            this.backpackNodes[name] = backpackNode;

            this.updateHTML(name);
        }

        return cont;
    }

    destroyHTML()
    {
        if(!this.node) { return; }
        this.node.remove();
    }
    
    toggleWindow()
    {
        if(this.node.style.display == 'none') {
            this.node.style.display = 'block';
            this.removeChangedClass();
        } else {
            this.node.style.display = 'none';
        }
    }

    removeChangedClass()
    {
        setTimeout(() => {
            for(let node of Object.values(this.backpackNodes))
            {
                node.classList.remove("popUp");
            }
        }, 30);
    }

    clear(name: string)
    {
        this.registerLettersFor(name); 
        this.backpacks[name] = [];
        this.updateHTML(name);
    }

    countLettersInside()
    {
        let sum = 0;
        for(const letters of Object.values(this.backpacks))
        {
            sum += letters.length;
        }
        return sum;
    }

    countNumPlayersWithSomething()
    {
        let sum = 0;
        for(const letters of Object.values(this.backpacks))
        {
            if(letters.length <= 0) { continue; }
            sum++;
        }
        return sum;
    }

    update(name: string, newLetter: string)
    {
        if(!(name in this.backpacks)) { return; }
        this.backpacks[name].push(newLetter);
        this.updateHTML(name);
    }

    addPreviousOptionToBackpack(name: string)
    {
        let prevOption = this.game.options.getPreviousOption();
        if(prevOption.getPlayerName() != name) { 
            console.error("It wasn't your turn last time");
            return;
        }

        if(prevOption.getType() != "letter") { 
            console.error("Can't add non-letter option to backpack!"); 
            return; 
        }

        if(prevOption.isExhausted()) {
            console.error("Already used special power of last option");
            return;
        }

        for(let letter of prevOption.letters)
        {
            this.update(name, letter);
        }

        prevOption.setExhausted(true);
        this.undoRegisterLettersForOption(prevOption);
        this.game.playPopup(this.backpackNodes[name]);
    }

    registerLettersFor(name: string | number)
    {
        const numLettersPlaced = this.backpacks[name].length;
        this.game.registerLettersPlaced(numLettersPlaced);
    }

    undoRegisterLettersForOption(option: { lettersPlaced: string | any[]; })
    {
        this.game.registerLettersPlaced(-option.lettersPlaced.length);
    }

    updateHTML(name: string)
    {
        const arr = [];
        const letterValues = CONFIG.scrabbleScores;
        const lettersInside = this.backpacks[name];
        const node = this.backpackNodes[name];
        const nothingInside = (lettersInside.length <= 0);
        if(nothingInside) { return node.innerHTML = "<em>empty</em>"; }

        for(const letter of lettersInside)
        {
            const letterValue = letterValues[letter] || 1;
            arr.push(letter + " <em style='opacity:0.5;'>(" + letterValue + ")</em>");
        }
        node.innerHTML = arr.join(", ");
    }

    getForPlayer(name: string | number)
    {
        return this.backpacks[name].join(", ");
    }
}