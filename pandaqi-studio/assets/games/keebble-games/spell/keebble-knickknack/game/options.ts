import Option from "./option"
import { OPTIONS } from "./dict"
import { CONFIG } from "./config"

export default class Options 
{
    game: any;
    node: HTMLDivElement;
    prevOption: Option;
    options: Option[];
    optionNodes: HTMLElement[];
    letterDictionary: Record<string, { prob: number, score: number, probFinal?: number }>;
    cellDictionary: {};
    optionNames: any[];

    constructor(game) 
    {
        this.game = game;
        this.node = this.createHTML();

        // we start with an "empty option", as it makes code cleaner
        // (no need to constantly check "do we _have_ a previous option??" before doing anything with it)
        this.prevOption = new Option(this.game, "");
        this.options = [];
        this.optionNodes = [];
        this.determinePossibleOptions();
        this.createFullLetterDictionary();
        this.createFullCellDictionary();
    }

    checkInstantGameOver()
    {
        const cfg = CONFIG;
        if(!cfg.debugging) { return; }
        if(!cfg.debugGameover) { return; }
        this.game.score.setRandom();
        this.game.gotoNextPhase();
    }

    // this saves letters as keys and their data (probability + point value) as value
    createFullLetterDictionary()
	{
		let obj = {};
		this.letterDictionary = obj;

        const letters = CONFIG.scrabbleScores;
		for(const [letter, score] of Object.entries(letters))
		{
			obj[letter] = {
				score: score,
				prob: (1.0 / score)
			}
		}
	}

    // this only extracts the cells that this game (Knickknack) uses
    // (the base game has a lot more, and stuff like the start cell is also in there)
    createFullCellDictionary()
    {
        let obj = {};
        this.cellDictionary = obj;

        const types = CONFIG.cellTypes;
        for(const [type,data] of Object.entries(types))
        {
            // @ts-ignore
            if(!data.knickknack) { continue; }
            obj[type] = data;
        }
    }

    determinePossibleOptions()
    {
        this.optionNames = [];
        const cfg = CONFIG;
        for(const [optionName, option] of Object.entries(OPTIONS))
        {
            // @ts-ignore
            const exp = option.expansion;
            const shouldAdd = !exp || cfg.expansions[exp];
            if(!shouldAdd) { continue; }
            this.optionNames.push(optionName);
        }
    }

    show()
    {
        this.node.style.display = 'flex';
    }

    hide()
    {
        this.node.style.display = 'none';
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("options-container");
        document.body.appendChild(cont);

        return cont;
    }

    destroyHTML()
    {
        this.node.remove();
    }

    clear()
    {
        this.options = [];
        this.optionNodes = [];
        this.node.innerHTML = '';
    }

    pickedOption(optionObject)
    {
        const idx = this.options.indexOf(optionObject);
        if(idx < 0) { console.error("Tried to pick option not in list"); return; }

        this.prevOption = optionObject;
        this.removeOptionByIndex(idx);
    }

    getPreviousOption()
    {
        return this.prevOption;
    }

    removeOptionByIndex(idx)
    {   
        this.options.splice(idx, 1);
        const node = this.optionNodes.splice(idx, 1)[0];
        node.remove();
    }

    nextRound()
    {
        this.clear();
        this.generateRandomOptions();
        this.displayOptions();
    }
    
    prepareOptionDictionary()
    {
        let optionDictionary : Record<string, any> = {};
        for(const optionName of this.optionNames)
        {
            optionDictionary[optionName] = structuredClone(OPTIONS[optionName]);
        }
        return optionDictionary;
    }

    generateRandomOptions()
    {
        const dict = this.prepareOptionDictionary();
        const cfg = CONFIG;

        let numOptions = this.game.players.count();
        if(numOptions == 2) { numOptions = 4; }
        if(numOptions == 3) { numOptions = 6; }
        numOptions += cfg.numLeftoverOptions;

        const nobodyHasBackpack = (this.game.backpacks.countLettersInside() <= 0);
        const numPlayersWithBackpack = this.game.backpacks.countNumPlayersWithSomething();
        if(nobodyHasBackpack && dict.empty_backpack)
        {
            delete dict.empty_backpack;
        }

        const noPowerupsActive = (this.game.powerups.count() <= 0);
        if(noPowerupsActive && dict.po_clear)
        {
            delete dict.po_clear;
        }

        const tooFewLettersPlaced = this.game.getNumLettersPlaced() <= cfg.minLettersForDestroyOption;
        if(tooFewLettersPlaced && dict.destroy)
        {
            delete dict.destroy;
            delete dict.swap;
        }

        const tooFewLettersForWalls = this.game.getNumLettersPlaced() <= cfg.minLettersForWalls;
        if(tooFewLettersForWalls)
        {
            delete dict.wall;
        }

        const tooFewPlacesForSpecialCells = (this.game.getNumEmptySpaces() <= cfg.minEmptySpacesForCellOption) || (this.game.getNumCellsPlaced() >= cfg.maxSpecialCells);
        if(tooFewPlacesForSpecialCells && dict.cell)
        {
            delete dict.cell;
        }

        const lastRound = this.game.isLastRound();
        if(lastRound && dict.start_player)
        {
            delete dict.start_player;
        }

        // @NOTE: always add 1 letter option at least
        // (because that's the engine that drives the game and needs to be consistent)
        this.options.push(new Option(this.game, "letter"));

        // @NOTE: Most types can only be used once or twice inside a round (to prevent all the options being the same thing)
        // Powerups are special => they are a "group", and if they appear too often _as a group_, all of them are disabled
        
        let optionsPerType = { powerups: 0 };
        let powerupsDisabled = false;
        for(let i = 1; i < numOptions; i++)
        {
            const optionName = this.getRandomWeighted(dict);
            const optionObject = new Option(this.game, optionName);
            this.options.push(optionObject);

            if(dict[optionName].oneoff) { delete dict[optionName]; }
            if(!(optionName in optionsPerType)) { optionsPerType[optionName] = 0; }
            optionsPerType[optionName] += 1;

            let optionMax = OPTIONS[optionName].roundMax || (numOptions - 1);
            if(optionName == "empty_backpack") { optionMax = Math.min(optionMax, numPlayersWithBackpack); }
            if(optionsPerType[optionName] >= optionMax) { delete dict[optionName]; }

            if(powerupsDisabled) { continue; }
            if(OPTIONS[optionName].powerup) { optionsPerType.powerups += 1; }
            if(optionsPerType.powerups >= 2) 
            {
                for(const [dictName, dictData] of Object.entries(dict))
                {
                    if(!dictData.powerup) { continue; }
                    delete dict[dictName];
                }
                powerupsDisabled = true;
            }
        }

        this.shuffle(this.options);
    }

    displayOptions()
    {
        for(const option of this.options)
        {
            const node = option.createHTML();
            this.optionNodes.push(node);
            this.node.appendChild(node);
        }
    }

    getTotalForKey(obj, key)
	{
		let sum = 0;
		for(const [elem, val] of Object.entries(obj))
		{
            // @ts-ignore
			if(!(key in val)) { val[key] = 1.0; }
			sum += val[key];
		}
		return sum;
	}

	getRandomWeighted(obj, key = "prob")
	{
		const typesObject = obj;
		const totalProb = this.getTotalForKey(typesObject, key);
		const probFraction = 1.0 / totalProb;
		const targetRand = Math.random();
		
        let runningSum = 0.0;
		let counter = 0;
		let lastType = "";

		const typesList = Object.keys(typesObject);
		this.shuffle(typesList);
		while(runningSum < targetRand)
		{
			lastType = typesList[counter];
			runningSum += typesObject[lastType][key] * probFraction;
			counter += 1;
		}

		return lastType;
	}   

    shuffle(array) 
    {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

    count() 
    {
        return this.options.length;
    }

    pickSpecialLetter(letter, lastOption = false, optionSize = 1)
    {
        if(!lastOption) { return letter; }

        const cfg = CONFIG;
        if(!cfg.addSpecialLetters) { return letter; }

        let exclamationMarkProb = cfg.exclamationMarkProb;
        let questionMarkProb = cfg.questionMarkProb;

        // the idea is 
        // - the question mark is most likely with size = 1
        // - the exclamation mark is most likely with size = 3
        // - but both can still occur at size = 2
        if(optionSize > 2) { questionMarkProb = 0; }
        if(optionSize <= 1) { exclamationMarkProb = 0; }

        if(optionSize == 2) { questionMarkProb *= 0.5; }
        if(optionSize == 2) { exclamationMarkProb *= 0.5; }

        if(Math.random() <= questionMarkProb) { return "?"; }
        if(Math.random() <= exclamationMarkProb) { return "!"; }
        return letter;
    }

    getRandomLetter(forPowerup = false)
    {
        if(!forPowerup)
        {
            const enhancedLetters = this.game.powerups.getLettersUsedInPowerups();
            for(const [letter, letterData] of Object.entries(this.letterDictionary))
            {
                let probFinal = letterData.prob
                if(enhancedLetters.includes(letter)) { 
                    probFinal = CONFIG.enhancedLetterProbForPowerup; 
                }
                letterData.probFinal = probFinal;
            }
        }

        return this.getRandomWeighted(this.letterDictionary, "probFinal");
    }

    getRandomCell()
    {
        return this.getRandomWeighted(this.cellDictionary);
    }
}