export default class Feedback 
{
    interface: any;
    node: HTMLDivElement;
    opacity: number;
    fadePerSecond: number;
    lastAnimFrame: number;
    content: HTMLDivElement;

    constructor(int:any) {
        this.interface = int;
        this.node = this.createHTML();
        this.toggle(false);

        this.opacity = 0.0;
        this.fadePerSecond = 0.3;
        this.lastAnimFrame = this.getTime();
        this.setupEvents();
    }

    createHTML()
    {
        const cont = document.createElement("div");
        this.interface.getContainer().appendChild(cont);
        cont.classList.add("feedback-container");

        const content = document.createElement("div");
        cont.appendChild(content);
        this.content = content;
        return cont;
    }

    setupEvents()
    {
        this.update();
        window.addEventListener("photomone-feedback", (ev:CustomEvent) => {
            this.showFeedback(ev.detail.text);
        });
    }

    update()
    {
        window.requestAnimationFrame(this.update.bind(this));
        const curTime = this.getTime();
        const dt = (curTime - this.lastAnimFrame) / 1000.0;
        this.lastAnimFrame = curTime;

        if(!this.isVisible()) { return; }
        this.changeOpacity(-dt * this.fadePerSecond);
    }
    
    showFeedback(text: string)
    {
        this.content.innerHTML = text;
        this.setOpacity(1.0);
    }

    toggle(val: boolean)
    {
        if(val) { this.node.style.display = "block"; }
        else { this.node.style.display = "none"; }
    }

    getTime() { return Date.now(); }
    isVisible() { return this.opacity > 0 && this.node.style.display != "none" }
    changeOpacity(delta: number)
    {
        this.setOpacity(this.opacity + delta);
    }

    setOpacity(o: number)
    {
        this.opacity = Math.max(Math.min(o, 1.0), 0.0);
        this.node.style.opacity = this.opacity.toString();
        if(this.opacity <= 0) { this.toggle(false); }
        else { this.toggle(true); }
    }
}