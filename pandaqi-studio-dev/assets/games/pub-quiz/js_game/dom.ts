import Nodes from "./nodes";
import { QuizParams } from "./quiz";

export default class DOM
{
    static NEXT = "next";
    static PREV = "prev";
    static REVEAL = "reveal";
    static MEDIA = "media";
    static MODE = "mode";
    static END = "end";
    static FONT_SIZE = "fontSize";

    enableMouse: boolean;
    enableKeys: boolean;
    fakeElement: HTMLElement;
    enableUI: boolean;

    constructor(params:QuizParams)
    {
        this.enableMouse = params.enableMouse ?? true;
        this.enableKeys = params.enableKeys ?? true;
        this.enableUI = params.enableUI;

        if(this.enableMouse) { document.body.addEventListener("click", this.onNext.bind(this)); }
        if(this.enableKeys) { document.body.addEventListener("keyup", this.onKeyPress.bind(this)); }

        this.fakeElement = document.createElement("div");
    }

    connectToNodes(nodes:Nodes)
    {
        if(nodes.enableUI)
        {
            nodes.nodesUI.prevButton.addEventListener("click", this.onPrev.bind(this));
            nodes.nodesUI.nextButton.addEventListener("click", this.onNext.bind(this));
            nodes.nodesUI.fontSizePlusButton.addEventListener("click", this.onFontSizeChange.bind(this, 1));
            nodes.nodesUI.fontSizeMinButton.addEventListener("click", this.onFontSizeChange.bind(this, -1));
        }
    }

    listenFor(eventName:string, callback)
    {
        document.body.addEventListener(eventName, callback);
    }

    onKeyPress(ev)
    {
        this.fakeElement.focus();

        // up arrow / right arrow
        const key = ev.key;
        const code = ev.code;
        let reacted = false;
        if (["ArrowUp", "ArrowRight"].includes(key) || code == "Space") {
            this.onNext(ev);
            reacted = true;
        
        // down arrow / left arrow
        } else if (["ArrowDown", "ArrowLeft"].includes(key)) {
            this.onPrev(ev);
            reacted = true;

        // "a" key (for answer)
        } else if(key == "a") {
            this.onReveal();
            reacted = true;
        
        // "m" key (as shortcut for changing mode)
        } else if(key == "m") {
            this.onModeChange();
            reacted = true;

        // "esc" key (as shortcut to skip to end)
        } else if(key == "Escape") {
            this.onSkipToEnd();
            reacted = true;

        // "spacebar" key (for playing media)
        } else if(key == "Enter") {
            this.onMedia();
            reacted = true;

        // "+" and "-" for font size
        // (this also supports numpad by default)
        } else if(key == "+" || key == "=") { // equals typically on plus key
            this.onFontSizeChange(ev, +1);
            reacted = true;
        } else if(key == "-" || key == "_") {
            this.onFontSizeChange(ev, -1);
            reacted = true;
        }

        if(reacted) { this.cancelEvent(ev); }
    }

    signal(what:string, detail = {})
    {
        const ev = new CustomEvent(what, { detail: detail });
        document.body.dispatchEvent(ev);
    }

    onSkipToEnd() { this.signal(DOM.END); }
    onModeChange() { this.signal(DOM.MODE); }
    onMedia() { this.signal(DOM.MEDIA); }
    onReveal() { this.signal(DOM.REVEAL); }
    onNext(ev) { this.signal(DOM.NEXT); this.cancelEvent(ev); }
    onPrev(ev) { this.signal(DOM.PREV); this.cancelEvent(ev); }
    onFontSizeChange(dfs, ev) { this.signal(DOM.FONT_SIZE, { change: dfs }); this.cancelEvent(ev); }

    cancelEvent(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
    }
}