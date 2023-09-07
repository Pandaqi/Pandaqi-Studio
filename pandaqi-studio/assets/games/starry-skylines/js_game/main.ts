import AI from "./ai"
import Events from "./events"
import Options from "./options"
import { PLANET_MAP, PLANET_SETS } from "../js/dictionary"
import configurator from "../js/configurator"

export default class Game 
{
    curRound: number
    started: boolean
    lastClickWasEvent: boolean
    config: Record<string,any>
    node: HTMLDivElement
    tutorial: HTMLDivElement
    ai: AI
    events: Events
    options: Options
    container: any
    buttonContinue: HTMLButtonElement
    
    constructor()
    {
        this.curRound = -1;
        this.started = false;
        this.lastClickWasEvent = false;
        this.config = this.setupConfig();
        this.node = this.setupHTML();
        this.setupClasses();
        this.tutorial = this.setupTutorialHTML();
    }

    setupConfig()
    {
        const baseConfig = {
            width: 8,
            height: 8,
            playerCount: 4,
            planet: "Learnth",
            planetNames: Object.keys(PLANET_MAP),
            planetSets: PLANET_SETS,
            manualCombo: "",
            planetSet: "",
            planetSetEnabled: false,
            maxPlanetSetSize: 3,
            maxDuplicateComponents: 2,
            difficulty: 0,
            numOptionsPerRound: 3,
            eventProbability: 0.75,
            totalProbabilities: {},
            lists: {},
            soloMode: false
        }

        const userConfig = JSON.parse(window.localStorage.starrySkylinesConfig || "{}");
        userConfig.playerCount = parseInt(userConfig.playerCount || 4);
        Object.assign(baseConfig, userConfig);

        baseConfig.soloMode = (baseConfig.playerCount == 1);
        baseConfig.difficulty = this.mapPlanetToDifficulty(baseConfig.planet);

        return baseConfig
    }

    setupClasses()
    {
        this.ai = new AI(this);
        this.events = new Events(this);
        this.options = new Options(this);
    }

    getContainer() { return this.container; }
    getConfig() { return this.config; }
    setupHTML()
    {
        const gameContainer = document.getElementById("game-container");
        this.container = gameContainer;

        const cont = document.createElement("div");
        gameContainer.appendChild(cont);
        cont.classList.add("main-window");
        cont.innerHTML = "<h1>Welcome!</h1><p>At the start of each round, press the button to generate new options.</p><p>Each player picks one of them and executes everything inside.</p><p>Have fun!</p>"

        const buttonContainer = document.createElement("div");
        gameContainer.appendChild(buttonContainer);
        buttonContainer.classList.add("button-container");

        const button = document.createElement("button");
        this.buttonContinue = button;
        buttonContainer.appendChild(button);
        button.innerHTML = "Start Game"
        button.addEventListener("click", this.gotoNextRound.bind(this));

        return cont;
    }

    setupTutorialHTML()
    {
        const tutorial = document.createElement("div");
        this.getContainer().appendChild(tutorial);
        tutorial.classList.add("component-explanations");
        return tutorial;
    }

    toggle(val)
    {
        if(val) { this.node.style.display = "block"; }
        else { this.node.style.display = "none"; }
    }

    mapPlanetToDifficulty(planet) { return PLANET_MAP[planet]; }

    load()
    {
        configurator.initializeDictionaries(this.config);
        console.log(this.config);
    }

    gotoNextRound()
    {
        if(!this.started)
        {
            this.started = true;
            this.toggle(false);
        }

        this.options.toggle(false);
        this.events.toggle(false);
        this.clearTutorial();

        const showEvent = this.shouldShowEvent();
        if(showEvent) {
            this.events.toggle(true);
            this.events.loadNew();
            this.buttonContinue.innerHTML = "Continue";
            this.lastClickWasEvent = true;
            return;
        } 

        const computerTurn = this.roundIsComputerTurn();

        this.options.toggle(true);
        this.options.loadNew(computerTurn);
        this.buttonContinue.innerHTML = "Next Round!";
        this.curRound++;
        this.lastClickWasEvent = false;

        this.buttonContinue.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    shouldShowEvent()
    {
        if(this.curRound < 0) { return false; }
        if(this.lastClickWasEvent) { return false; }
        if(Math.random() > this.config.eventProbability) { return false; }
        if(this.roundIsComputerTurn()) { return false; }
        return true;
    }

    roundIsComputerTurn()
    {
        if(!this.config.soloMode) { return false; }
        return this.curRound % 2 == 0;
    }

    clearTutorial() { this.tutorial.innerHTML = ''; }
    setTutorial(txt)
    {
        this.tutorial.innerHTML = txt; 
        this.tutorial.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    getRandom(type) {
        const rand = Math.random();
        const total = this.config.totalProbabilities[type];
        const list = this.config.lists[type];
    
        let sum = 0;
        for(const key of Object.keys(list)) {
            sum += (list[key].prob / total);
            if(sum >= rand) { return key; }
        }
    }

    getDictionaryData(key, val)
    {
        return this.getConfig().lists[key][val];
    }
}

new Game().load()