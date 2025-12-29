import { POINT_TYPES_DIGITAL } from "../shared/dict"
import { CONFIG } from "../shared/config"
import Interface from "./interface"
import PowerupHints from "./powerupHints"
import Turn from "./turn"
import Tutorial from "./tutorial"
import { ResourceLoader, rangeInteger, getWeighted } from "lib/pq-games"

export default class Game 
{
    curPhaseIndex:number
    phases: string[]
    interface: Interface
    powerupHints: PowerupHints
    tutorial: Tutorial
    numTurns: number
    numTurnsGuessedRight: number
    wordsPerTurn: number
    allWords: any[]
    curTurn: number
    totalFood: number
    targetFood: number
    lastTurnScored: boolean

    constructor()
    {
        // the usual conversions from string to a number/bool
        CONFIG.pointTypes = this.preparePointTypes();
        CONFIG.width = window.innerWidth;
        CONFIG.height = window.innerHeight;
        CONFIG.pointRadiusFactor = 0.0175;
        CONFIG.pointRadiusSpecialFactor = 0.0175*1.9;
        CONFIG.lineWidthFactor = 0.0175;
        CONFIG.pointBounds = { min: 160, max: 185 };

        CONFIG.timerLength = parseFloat(CONFIG._settings.timerLength.value.toString()) ?? 45.0;
        CONFIG.resizePolicy = "full";
        CONFIG.wordInterface.listenToExpansions = false;

        CONFIG.debugPowerups = []; // @DEBUGGING (should be empty)

        this.curPhaseIndex = -1;
        this.phases = ["welcome", "pick", "draw", "between", "gameover"];
        this.setupMetadata(); // words, target score for winning, etcetera
        this.setupPowerups();
        this.setupEvents();
        this.protectAgainstLeaving();

        this.interface = new Interface(this);

        if(this.hasSpecialPoints()) { this.powerupHints = new PowerupHints(this); }
        if(CONFIG._settings.enableTutorial.value) { this.tutorial = new Tutorial(this); }
        
    }

    async start()
    {
        // because this is a direct game interface (not part of general system), no resources have been loaded automatically so we need to do it ourselves
        // the RESOURCE_LOADER key is simply what CanvasDrawable expects ... because old me wrote TERRIBLE code ...
        const resLoader = new ResourceLoader({ base: CONFIG._resources.base });
        resLoader.planLoadMultiple(CONFIG._resources.files);
        await resLoader.loadPlannedResources();
        CONFIG.RESOURCE_LOADER = resLoader;

        this.gotoNextPhase();
    }

    preparePointTypes()
    {
        const newDict = {};
        for(const [key, value] of Object.entries(POINT_TYPES_DIGITAL))
        {
            // @NOTE: this is the ONLY expansion for this game ...
            if(value.expansion == "sneakySpots" && !CONFIG._settings.sneakySpots.value) { continue; }
            newDict[key] = value;
        }
        return newDict;
    }

    protectAgainstLeaving()
    {
        window.onbeforeunload = (ev: any) => 
        {
            if(this.curPhaseIndex == 0 || this.curPhaseIndex == (this.phases.length-1)) { return undefined; }
            return "You're about to exit this game, losing all progress. Are you sure?";
        };
    }

    setupMetadata()
    {
        const rand = 0.5 + Math.random()*0.25
        this.numTurns = rangeInteger(CONFIG.numTurnBounds.min, CONFIG.numTurnBounds.max);
        this.numTurnsGuessedRight = Math.round(rand * this.numTurns);
        this.wordsPerTurn = 4;
        this.allWords = CONFIG.WORDS.getWords(this.numTurns * this.wordsPerTurn);
        this.curTurn = 0;
        this.totalFood = 0;
        this.targetFood = CONFIG.WORDS.getObjectiveScore(this.allWords, this.numTurnsGuessedRight);
    }

    sneakySpotsEnabled() { return CONFIG._settings.sneakySpots.value; }
    setupPowerups()
    {
        const hasDebugPowerups = (CONFIG.debugPowerups.length > 0);
        if(hasDebugPowerups)
        {
            const dict = {};
            for(const po of CONFIG.debugPowerups)
            {
                dict[po] = CONFIG.pointTypesDictionary[po];
            }
            CONFIG.pointTypes = dict;
            return;
        }

        if(!this.sneakySpotsEnabled())
        {
            CONFIG.pointTypes = {};
            return;
        }

        const dict = CONFIG.pointTypesDictionary;
        const powerups = {};
        let randNum = 3 + Math.floor(Math.random()*2);
        if(Math.random() <= 0.075) { randNum = 2; }
        if(Math.random() <= 0.075) { randNum = 5; }

        const numPowerups = Math.min(randNum, Object.keys(dict).length);
        for(let i = 0; i < numPowerups; i++)
        {
            const type = getWeighted(dict, "prob");
            powerups[type] = dict[type];
            delete dict[type];
        }
        CONFIG.pointTypes = powerups;
    }

    // A very CRUDE implementation of events/signals, but it's okay for such a tiny game
    // (and my first experiment switching towards this coding style in JavaScript)
    setupEvents()
    {
        window.addEventListener("photomone-line-drawn", (ev:CustomEvent) => {
            this.interface.turnObject.changeLines(-1);
        })

        window.addEventListener("photomone-numlines", (ev:CustomEvent) => {
            this.interface.turnObject.changeLines(ev.detail.num);
        })

        window.addEventListener("photomone-points", (ev:CustomEvent) => {
            this.interface.turnObject.changeFood(ev.detail.num);
        })

        window.addEventListener("photomone-timer", (ev:CustomEvent) => {
            this.interface.turnObject.changeTimer(ev.detail.num);
        })

        window.addEventListener("photomone-objective", (ev:CustomEvent) => {
            this.updateTargetFood(ev.detail.num);
        })

        window.addEventListener("photomone-wordeater", (ev:CustomEvent) => {
            this.interface.wordOptions.setWordEater(true);
        })
    }

    getConfig() { return CONFIG; }
    hasSpecialPoints() { return Object.keys(CONFIG.pointTypes).length > 0; }
    
    outOfTurns()
    {
        return this.curTurn > this.numTurns;
    }

    isLastTurn()
    {
        return this.curTurn == this.numTurns;        
    }

    hasWon()
    {
        return (this.totalFood >= this.targetFood);
    }

    gotoNextTurn()
    {
        this.curTurn++;
    }

    getPhase()
    {
        return this.phases[this.curPhaseIndex];
    }

    gotoPhase(phaseName: string)
    {
        this.curPhaseIndex = this.phases.indexOf(phaseName);
    }

    gotoNextPhase()
    {
        this.curPhaseIndex = (this.curPhaseIndex + 1);
        if(this.getPhase() == "gameover") { this.gotoPhase("pick"); } // loop back to picking for turn cycle

        let phaseName = this.getPhase();
        if(phaseName == "pick") { this.gotoNextTurn(); }
        if(this.outOfTurns() || this.hasWon()) { this.gotoPhase("gameover"); }

        phaseName = this.getPhase();
        this.executePhase(phaseName);
        this.lastTurnScored = false;
    }

    executePhase(phaseName: string)
    {
        if(phaseName == "welcome")
        {
            let txt = "<p>Your goal is to score <strong>" + this.targetFood + " food</strong> (or more) within <strong>" + this.numTurns + " turns</strong>.</p><p>Give the device to the first player. Make sure nobody else can see the screen!</p><p>Then tap the button to start.</p>";

            if(this.hasSpecialPoints())
            {
                txt += "<p>You have enabled <strong>sneaky spots</strong>! These activate when they are the end point of a line. You can also tap any point <em>during the game</em> to be reminded about what it does.</p>"

                txt += this.createSpecialPointTable();
            }

            this.interface.setWindowText("Welcome", txt);
            this.interface.toggleWindow(true);
            this.interface.setButtons(["nextBtn"]);
        }
        else if(phaseName == "pick")
        {
            this.interface.toggleWindow(false);
            this.interface.toggleWords(true);
            this.interface.toggleBar(true);
            this.interface.setButtons(["nextBtn"]);
            if(this.isLastTurn()) { this.interface.enableSpecialLastTurn(); }
        }
        else if(phaseName == "draw")
        {
            const curTurnObject = new Turn(this, this.interface.getSelectedWord());
            this.interface.setTurnObject(curTurnObject);

            this.interface.toggleWords(false);
            this.interface.toggleCanvas(true);
            this.interface.minify();
            this.interface.setButtons([]);
            if(!this.tutorial || !this.tutorial.isActive()) { this.interface.startTimer(); }
        }
        else if(phaseName == "between")
        {
            let txt = "<p>The secret word was: <strong>" + this.interface.turnObject.getWord() + "</strong>!</p>"
            
            if(this.lastTurnScored) {
                txt += "<p>Well done! The word was guessed and you scored <strong>" + this.interface.turnObject.getFood() + " food</strong>.</p>";
            }
            
            txt += "<p>Hand the device to the next player. When only you can see the screen, tap the button to start the next turn.</p>";
            
            this.interface.setWindowText("Turn over", txt);
            this.interface.toggleWindow(true);
            this.interface.toggleCanvas(false);
            this.interface.extend();
            this.interface.setButtons(["nextBtn"]);
        }
        else if(phaseName == "gameover")
        {
            let txt = "<p>Congratulations! You've won!</p><p>It took you <strong>" + this.curTurn + " turns</strong> to score <strong>" + this.totalFood + " food</strong> (out of the required " + this.targetFood + ").</p><p>Use the buttons below to leave or play again (with the same settings)</p>";
            
            if(!this.hasWon())
            {
                txt = "<p>Oh no, you've lost!</p><p>You scored only <strong>" + this.totalFood + " food</strong> of the required " + this.targetFood + " food.</p><p>Use the buttons below to leave or try again!</p>";
            }

            this.interface.setWindowText("Game Over!", txt);
            this.interface.toggleCanvas(false);
            this.interface.toggleWords(false);
            this.interface.toggleWindow(true);
            this.interface.toggleBar(false);
            this.interface.setButtons(["leaveBtn", "restartBtn"]);
        }

        if(this.tutorial) { this.tutorial.updateToNewPhase(); }
        this.interface.visualize();
    }

    getWordList()
    {
        return this.allWords;
    }

    scoreWord(df: any)
    {
        this.totalFood += df;
        this.lastTurnScored = true;
    }

    updateTargetFood(dt: any)
    {
        this.targetFood = Math.max(this.targetFood + dt, 0);
    }

    createSpecialPointTable()
    {
        let txt = "<div class='special-point-table'>"
        for(const [type,data] of Object.entries(CONFIG.pointTypes))
        {
            txt += "<div class='special-point-entry'>"
            txt += "<div><div class='icon icon-" + type + "'></div></div>";
            // @ts-ignore
            txt += "<div>" + data.desc + "</div>"
            txt += "</div>"
        }
        txt += "</div>"
        return txt
    }
}
