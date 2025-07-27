import { PROPERTIES } from "games/slippery-slopes/shared/dict";
import SliderInteractive from "games/slippery-slopes/shared/sliderInteractive";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";
import getWeighted from "js/pq_games/tools/random/getWeighted";

// @NOTE: Just so that I don't need to load PQ Words just for a small demonstration
const WORDS = ["guitar","fairy tale","toilet","dwarf","pen","pianist","alien","polygon","alien","shirt","butterfly","skirt","controller","bomb","screen","blanket","ear","water","desk","woman","forest","bird","drum","fork","elephant","desk","board","horse","boat","cinema","fork","football","bus","drum","snowflake","banana","spaghetti","waterfall","fork","boat","cinema","banana","pear","golf","forest","field","flashlight","superhero","pan","hotel","robot","crow","plate","potato","clay","skirt","bear","toilet","river","moon","plate","puzzle","chair","tea","duck","dad","chicken","dog","shop","mom","field","phone","screen","stoplight","doll","boat","cow","pig","bird","man","kitchen","candle","rocket","hat","backpack","kitchen","truck","coffee","snake","pyramid","net","hair","pancake","mouse","screen","wood","vase","rabbit","hammer","drum"];

export default class Widget
{
    node: HTMLElement;
    wordNode: HTMLElement;
    reloadButton: HTMLElement;
    
    constructor(node:HTMLElement) 
    {
        this.node = node;
        this.wordNode = document.getElementById(node.dataset.wordnodeid);
        this.reloadButton = document.getElementById(node.dataset.reloadbtnid);

        if(this.reloadButton)
        {
            this.reloadButton.addEventListener("click", (ev) => 
            {
                ev.preventDefault();
                ev.stopPropagation();
                this.reload();
                return false;
            });
        }

        this.show();
    }

    show()
    {
        const numSliders = 4;
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("sliders-container");
        sliderContainer.style.paddingTop = "0";
        for(let i = 0; i < numSliders; i++)
        {
            const randSubType = getWeighted(PROPERTIES);
            const s = new SliderInteractive("property", randSubType);
            sliderContainer.appendChild(s.getContainer());
            s.setup(new Point(400, 800));
        }
        this.node.appendChild(sliderContainer);

        this.wordNode.innerHTML = fromArray(WORDS);
    }

    reload()
    {
        this.node.innerHTML = "";
        this.show();
    }
}