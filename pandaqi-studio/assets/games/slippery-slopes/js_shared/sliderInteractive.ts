import convertEventToLocal from "js/pq_games/tools/dom/convertEventToLocal";
import Slider from "./slider";
import preventDefaults from "js/pq_games/tools/dom/preventDefaults";
import addTouchEvents from "js/pq_games/tools/dom/addTouchEvents";
import Point from "js/pq_games/tools/geometry/point";
import SignalManager from "js/pq_games/tools/signals/signalManager";

export default class SliderInteractive
{
    slider:Slider;
    canvas:HTMLCanvasElement;
    node: HTMLDivElement;
    dragging: boolean;
    dragger: HTMLDivElement;
    signals: SignalManager;
    replaceButton: HTMLDivElement;

    constructor(mainType:string, subType:string)
    {
        this.slider = new Slider(mainType, subType);
        this.dragging = false;
        this.signals = new SignalManager();

        this.setupHTML();
    }

    async setup(customSize:Point = null)
    {
        await this.reload(customSize);
        this.setupDragger();
        this.setupReplaceButton();
    }

    async reload(customSize:Point = null)
    {
        this.slider.reload();
        
        if(!customSize && this.canvas) { customSize = new Point(this.canvas.width, this.canvas.height); }
        
        const newCanvas = await this.slider.draw(customSize); 
        if(this.canvas) {
            this.node.replaceChild(newCanvas, this.canvas);
        } else {
            this.node.appendChild(newCanvas);
        }

        this.canvas = newCanvas;
        this.attachEventsToCanvas();
        this.signals.dispatchEvent("replaced");
    }

    getContainer() { return this.node; }
    setupHTML()
    {
        this.node = document.createElement("div");
        this.node.classList.add("slider-interactive");
    }

    setupDragger()
    {
        const dragger = document.createElement("div");
        dragger.classList.add("slider-dragger");
        this.node.appendChild(dragger);
        dragger.style.top = "50%";
        this.dragger = dragger;
    }

    attachEventsToCanvas()
    {
        const ths = this;
        const moveCallback = (ev) => 
        {
            if(!ths.dragging) { return; }
            const pos = convertEventToLocal(ev, this.canvas);
            ths.dragger.style.top = pos.y + "px";
            return preventDefaults(ev);
        }

        const startCallback = (ev) => 
        {
            ths.dragging = true;
            return moveCallback(ev);
        }

        const cancelCallback = (ev) => 
        {
            ths.dragging = false;
            return preventDefaults(ev);
        }
        

        addTouchEvents({ node: this.canvas, start: startCallback, end: cancelCallback, move: moveCallback, cancel: cancelCallback });
    }

    removeReplaceButton()
    {
        this.replaceButton.remove();
    }

    setupReplaceButton()
    {
        const div = document.createElement("div");
        div.innerHTML = "X";
        div.classList.add("slider-replace-button");
        this.replaceButton = div;
        this.node.appendChild(div);
        div.addEventListener("click", (ev) => {
            this.reload();
        })
    }
}