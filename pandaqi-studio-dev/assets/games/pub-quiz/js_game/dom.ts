import { QuizParams } from "./quiz";

export default class DOM
{
    static NEXT = "next";
    static PREV = "prev";
    static REVEAL = "reveal";
    static MEDIA = "media";
    static MODE = "mode";
    static END = "end";

    enableMouse: boolean;
    enableKeys: boolean;

    // @TODO: a key to immediately go to start/end
    constructor(params:QuizParams)
    {
        this.enableMouse = params.enableMouse ?? false;
        this.enableKeys = params.enableKeys ?? true;

        if(this.enableMouse) { document.body.addEventListener("click", this.onNext.bind(this)); }
        if(this.enableKeys) { document.body.addEventListener("keyup", this.onKeyPress.bind(this)); }
    }

    listenFor(eventName:string, callback)
    {
        document.body.addEventListener(eventName, callback);
    }

    onKeyPress(ev)
    {
        // up arrow / right arrow
        const key = ev.key;
        const code = ev.code;
        if (["ArrowUp", "ArrowRight"].includes(key) || code == "Space") {
            this.onNext();
        
        // down arrow / left arrow
        } else if (["ArrowDown", "ArrowLeft"].includes(key)) {
            this.onPrev();

        // "a" key (for answer)
        } else if(key == "a") {
            this.onReveal();
        
        // "m" key (as shortcut for changing mode)
        } else if(key == "m") {
            this.onModeChange();

        // "esc" key (as shortcut to skip to end)
        } else if(key == "Escape") {
            this.onSkipToEnd();

        // "spacebar" key (for playing media)
        } else if(key == "Enter") {
            this.onMedia();
        }
    }

    signal(what)
    {
        const ev = new CustomEvent(what);
        document.body.dispatchEvent(ev);
    }

    onSkipToEnd() { this.signal(DOM.END); }
    onModeChange() { this.signal(DOM.MODE); }
    onMedia() { this.signal(DOM.MEDIA); }
    onReveal() { this.signal(DOM.REVEAL); }
    onNext() { this.signal(DOM.NEXT); }
    onPrev() { this.signal(DOM.PREV); }
}