import SignalManager from "js/pq_games/tools/signals/signalManager";
import { CONFIG } from "../../slippery-slopes/shared/config";
import InstructionScreen from "./instructionScreen";
import SlidersScreen from "./slidersScreen";
import WordsScreen from "./wordsScreen";
import GameState from "./gameState";

const SETTINGS =
{
    maxTurns:
    {
        type: SettingType.NUMBER,
        min: 5,
        max: 25,
        step: 5,
        default: 10,
        label: "How Many Rounds?"
    },

    wordSettings:
    {
        type: SettingType.GROUP,

        wordComplexity:
        {
            type: SettingType.ENUM,
            values: ["core", "easy", "medium"],
            default: "core",
            label: "Word Complexity",
            remark: "How hard should the words be?"
        },

        includeNamesAndGeography:
        {
            type: SettingType.CHECK,
            label: "Include Names",
            remark: "Adds geography and proper names of people, brands, ..."
        }
    },
}
CONFIG._settings = SETTINGS;

class Game
{
    node: HTMLDivElement;
    state: GameState;
    score: number;
    turn: number;

    instructionScreen: InstructionScreen;
    wordsScreen: WordsScreen;
    slidersScreen: SlidersScreen;
    
    async start()
    {
        this.readConfig();
        this.createContainer();

        const sm = new SignalManager();
        CONFIG.signalManager = sm;

        this.instructionScreen = new InstructionScreen();
        this.getContainer().appendChild(this.instructionScreen.getContainer());

        this.wordsScreen = new WordsScreen();
        await this.wordsScreen.setup();
        this.getContainer().appendChild(this.wordsScreen.getContainer());
        
        this.slidersScreen = new SlidersScreen();
        this.getContainer().appendChild(this.slidersScreen.getContainer());

        sm.subscribe("changeScore", (ev) => {
            this.updateScore(ev.detail);
        })

        sm.subscribe("changeState", (ev) => {
            this.gotoState(ev.detail);
        })

        this.gotoState(GameState.GAMEPRE);
    }

    readConfig()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKeyDigital] ?? "{}");
        console.log(userConfig);
        Object.assign(CONFIG, userConfig);

        CONFIG.game.maxTurns = parseInt(userConfig.maxTurns ?? "10");
        this.score = 0;
    }

    gotoState(state:GameState)
    {
        if(state == GameState.GAMEPRE) {
            this.turn = -1;
            this.instructionScreen.showWelcome();
        } else if(state == GameState.WORDS) {
            this.turn++;
            if(this.turn >= CONFIG.game.maxTurns) {
                return this.gotoState(GameState.GAMEOVER);
            }

            this.instructionScreen.hide();
            this.wordsScreen.show();
            this.slidersScreen.hide();
        } else if(state == GameState.SLIDERS) {
            this.wordsScreen.hide();
            this.slidersScreen.show();
        } else if(state == GameState.TURNOVER) {
            this.wordsScreen.hide();
            this.slidersScreen.hide();
            this.instructionScreen.showTurnOver(this.wordsScreen.wordSelected, this.slidersScreen.pointsScored);
        } else if(state == GameState.GAMEOVER) {
            this.instructionScreen.showGameOver(this.getScore());
        }
    }

    getContainer() { return this.node; }
    createContainer()
    {
        const div = document.createElement("div");
        div.classList.add("game-container");
        document.body.appendChild(div);
        this.node = div;
    }

    getScore() : number { return this.score; }
    setScore(val:number)
    {
        this.score = val;
    }

    updateScore(ds:number)
    {
        this.setScore(this.score + ds);
    }

    /*
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
    */
}

loadSettings(CONFIG, () => { new Game().start(); });