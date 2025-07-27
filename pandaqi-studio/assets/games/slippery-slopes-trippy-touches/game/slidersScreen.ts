import CONFIG from "games/slippery-slopes/shared/config";
import GameState from "./gameState";
import Timer from "./timer";
import lerp from "js/pq_games/tools/numbers/lerp";
import SliderInteractive from "games/slippery-slopes/shared/sliderInteractive";
import { PROPERTIES } from "games/slippery-slopes/shared/dict";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class SlidersScreen
{
    node: HTMLDivElement;
    pointsScored: number;
    slidersReplaced: number;

    constructor()
    {
        this.setupHTML();
        this.hide();
    }

    getContainer() { return this.node; }
    setupHTML()
    {
        this.node = document.createElement("div");
        this.node.classList.add("sliders-screen");
    }

    hide()
    {
        this.node.innerHTML = "";
        this.node.style.display = "none";
    }

    async show()
    {
        this.node.style.display = "block";
        this.slidersReplaced = 0;

        const subCont = document.createElement("div");
        this.node.appendChild(subCont);

        const numSliders = 4;
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("sliders-container");
        const sliderInteractives = [];
        for(let i = 0; i < numSliders; i++)
        {
            const randSubType = getWeighted(PROPERTIES);
            const s = new SliderInteractive("property", randSubType);
            sliderInteractives.push(s);
            // must come before setup, as that requires correct dimensions from things added to DOM
            sliderContainer.appendChild(s.getContainer());
            s.signals.subscribe("replaced", (ev) => {
                this.slidersReplaced++;
                if(this.slidersReplaced >= CONFIG.game.maxSliderReplacementsPerTurn)
                {
                    for(const elem of sliderInteractives)
                    {
                        elem.removeReplaceButton();
                    }
                }
            })
            await s.setup(CONFIG.sliderCards.interactiveBaseSize);
        }
        subCont.appendChild(sliderContainer);

        const sm = CONFIG.signalManager;
        const timer = new Timer(CONFIG.game.timerDuration);
        
        timer.signals.subscribe("tap", (ev) => {

            // higher score the faster you guess it
            const ratio = timer.getRatioLeft();
            const score = Math.round( lerp(CONFIG.game.scoreBounds.min, CONFIG.game.scoreBounds.max, ratio) );
            this.pointsScored = score;

            sm.dispatchEvent("changeScore", score)
            sm.dispatchEvent("changeState", GameState.TURNOVER);
        })

        timer.signals.subscribe("timeout", (ev) => {
            sm.dispatchEvent("changeState", GameState.TURNOVER);
        })

        subCont.appendChild(timer.getContainer());
        timer.start();
    }
}