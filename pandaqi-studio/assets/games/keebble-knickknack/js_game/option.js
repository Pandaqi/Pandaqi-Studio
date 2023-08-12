import { OPTIONS } from "./gameDictionary"

export default class Option {
    constructor(game, type)
    {
        this.game = game;
        this.type = type;
        this.playerName = "";
        this.num = 1;
        this.exhausted = false;
        this.lettersPlaced = [];
        this.emptyOption = (this.type == "");
        if(this.emptyOption) { this.exhausted = true; }
        this.determineDetails();
    }

    setExhausted(val)
    {
        this.exhausted = val;
    }

    isExhausted()
    {
        return this.exhausted;
    }

    determineDetails()
    {
        if(this.emptyOption) { return; }

        const tp = this.type;
        const data = OPTIONS[tp];

        if(data.num)
        {
            const min = data.num.min;
            const max = data.num.max;
            this.num = min + Math.floor(Math.random() * (max - min + 1));
        }

        if(tp == "letter")
        {
            this.letters = [];
            for(let i = 0; i < this.num; i++)
            {
                const lastOption = i == (this.num-1);
                let randLetter = this.game.options.getRandomLetter();
                randLetter = this.game.options.pickSpecialLetter(randLetter, lastOption, this.num);
                this.letters.push(randLetter);
            }
        }

        if(tp == "po_letter")
        {
            this.letter = this.game.options.getRandomLetter(true);
            const possibleValues = [-6, -5, -4, -3, 3, 4, 5, 6];
            this.twoPartValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
            if(this.twoPartValue > 0) { this.twoPartValue = "+" + this.twoPartValue; }
        }

        if(tp == "po_word")
        {
            const possibleValues = [-8, -6, -4, -2, 2, 4, 6, 8];
            this.twoPartValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
            if(this.twoPartValue > 0) { this.twoPartValue = "+" + this.twoPartValue; }
        }

        if(tp == "cell")
        {
            this.cells = [];
            for(let i = 0; i < this.num; i++)
            {
                this.cells.push(this.game.options.getRandomCell());
            }
        }

        if(tp == "points")
        {
            this.value = 4 + Math.floor(Math.random() * 5);
        }

        if(tp == "wall")
        {
            this.value = 1 + Math.floor(Math.random() * 3);
        }
    }

    createHTML(small = false)
    {
        const cont = document.createElement("div");
        cont.classList.add("option", "option-" + this.type, "button-look");
        if(small) { cont.classList.add("option-small"); }

        const listenToEvents = !small;
        if(listenToEvents)
        {
            cont.addEventListener("click", (ev) => {
                this.playerName = this.game.players.getActivePlayerName();
                this.execute();
                this.executionFinished();
            });    
        }
        
        for(let i = 0; i < this.num; i++)
        {
            const subOption = document.createElement("div");
            cont.appendChild(subOption);
            subOption.classList.add("option-sprite", "option-sprite-" + this.type);

            if(small) { subOption.classList.add("option-sprite-small"); }

            subOption.appendChild(this.createSubHTML(i, small));
        }

        const isTwoPart = OPTIONS[this.type].twopart;
        if(isTwoPart)
        {
            const subOption = document.createElement("div");
            cont.appendChild(subOption);
            subOption.classList.add("option-sprite", "option-sprite-twopart");
            if(small) { subOption.classList.add("option-sprite-small"); }
            subOption.appendChild(this.createSubHTML(-1, small, "twopart"));
        }

        return cont;
    }

    createSubHTML(subIndex = 0, small = false, tp = this.getType())
    {
        const cont = document.createElement("span");
        cont.classList.add("suboption-sprite", "suboption-sprite-" + tp);
        if(small) { cont.classList.add("suboption-sprite-small"); }

        if(tp == "twopart")
        {
            const elem = document.createElement("span");
            elem.classList.add("twopart-number");
            elem.innerHTML = this.twoPartValue;
            cont.appendChild(elem);
        }

        if(tp == "letter")
        {
            const elem = document.createElement("span");
            const letter = this.letters[subIndex];
            elem.classList.add("letter-option-letter");
            elem.innerHTML = letter;
            cont.appendChild(elem);

            const pointValue = document.createElement("span");
            pointValue.classList.add("letter-option-point-value");
            pointValue.innerHTML = this.game.getLetterScore(letter);
            cont.appendChild(pointValue);
        }

        if(tp == "po_letter")
        {
            const elem = document.createElement("span");
            const letter = this.letter;
            elem.classList.add("letter-option-letter");
            elem.innerHTML = letter;
            cont.appendChild(elem);
        }

        if(tp == "cell")
        {
            const elem = document.createElement("span");
            const cellType = this.cells[subIndex];
            elem.classList.add("cell-sprite", "cell-sprite-" + cellType);
            cont.appendChild(elem);
        }

        if(tp == "points" || tp == "wall")
        {
            const elem = document.createElement("span");
            elem.classList.add("points-option-point-value");
            elem.innerHTML = this.value + "";
            cont.appendChild(elem);
        }
         
        return cont;
    }

    execute()
    {
        const isPowerup = OPTIONS[this.type].powerup;
        if(isPowerup)
        {
            this.game.score.update(this.playerName, this.game.getConfig().pointsForPickingPowerup);
            this.game.powerups.add(this);
        }

        const isLetter = this.type == "letter";
        if(isLetter)
        {
            const regularLetters = this.filterLetters(this.letters, ["!"]);
            this.lettersPlaced = regularLetters;
            this.game.registerLettersPlaced(regularLetters.length);
        }

        const isCell = this.type == "cell"
        if(isCell)
        {
            this.game.registerSpecialCellsPlaced(this.cells.length);
        }

        const isStartPlayer = this.type == "start_player";
        if(isStartPlayer)
        {
            this.game.players.saveCurrentAsStartPlayer();
        }

        const isPoints = this.type == "points";
        if(isPoints)
        {
            this.game.score.update(this.playerName, this.value);
        }
    }

    executionFinished()
    {
        this.game.options.pickedOption(this);

        const waitOnPlayer = OPTIONS[this.type].wait;
        if(!waitOnPlayer) { this.game.gotoNextTurn(); return; }
        this.game.gotoWaitOnPlayer(this);
    }

    filterLetters(list, filter = [])
    {
        const arr = [];
        for(const letter of list)
        {
            if(filter.includes(letter)) { continue; }
            arr.push(letter);
        }
        return arr;
    }

    getType()
    {
        return this.type;
    }

    getPlayerName()
    {
        return this.playerName;
    }
}