import Interface from "./interface"

export default class Timer 
{
    interface: Interface;
    node: HTMLDivElement;
    value: any;
    duration: number;
    interval: number;
    direction: string;
    color: any;
    intervalHandler: any;
    bar: HTMLDivElement;
    
    constructor(int:Interface, params:Record<string,any> = {})
    {
        this.interface = int;
        this.node = this.setupHTML(params);
        this.value = params.value ?? 0;
        this.duration = params.duration ?? 0;
        this.interval = params.interval ?? 0.016; // in seconds
        this.direction = params.direction ?? "ltr";
        this.color = params.color ?? "#00FF00";
        this.intervalHandler = null;
        this.toggleBar(false);
        this.setupEvents();
    }

    setupHTML(params: Record<string, any>)
    {
        const div = document.createElement("div");
        div.classList.add("timer-bar-container");

        if(!params.node) { return div; }

        params.node.appendChild(div);
        params.node.style.position = "relative";

        const timerBar = document.createElement("div");
        timerBar.classList.add("timer-bar");
        div.appendChild(timerBar);
        this.bar = timerBar;
        
        return div;
    }

    setupEvents()
    {
        this.interface.addEventListener("pause", (ev: { detail: { paused: any; }; }) => {
            if(ev.detail.paused) { return this.setPaused(true); }
            this.setPaused(false);
        })
    }

    hasTimeLeft() { return this.value > 0; }
    isActive() { return this.intervalHandler != null; }
    resetTo(val: number)
    {
        this.value = val;
        this.duration = val;
    }

    restart() { this.resetTo(this.duration); this.start(); }
    start()
    {
        this.createInterval();
        this.toggleBar(true);
        this.visualizeBar();
    }

    createInterval() 
    { 
        if(this.intervalHandler) { return; }
        this.intervalHandler = setInterval(this.update.bind(this), this.interval * 1000); 
    }

    destroyInterval() 
    {
        if(!this.intervalHandler) { return; }
        clearInterval(this.intervalHandler); this.intervalHandler = null; 
    }

    setPaused(val: boolean)
    {
        if(!this.hasTimeLeft()) { return; }
        if(val) { this.destroyInterval(); }
        else { this.createInterval(); } 
    }

    update()
    {
        this.value = Math.max(this.value - this.interval, 0);
        this.visualizeBar();
        const ev = new CustomEvent("update", { detail: { time: this.value }});
        this.node.dispatchEvent(ev);
        if(this.value <= 0) { this.stop(); }
    }

    stop(dispatchEvent = true)
    {
        this.toggleBar(false);
        this.destroyInterval();
        if(!dispatchEvent) { return; }
        const ev = new CustomEvent("timeout");
        this.node.dispatchEvent(ev);
    }

    getTime() { return this.value; }
    getPercentage()
    {
        return this.value / this.duration;
    }

    setDirection(d: string) { this.direction = d; }
    setColor(c: string) { this.color = c; }

    toggleBar(val: boolean)
    {
        if(!this.bar) { return; }
        if(val) { this.bar.style.display = "block"; }
        else { this.bar.style.display = "none"; }
    }

    visualizeBar()
    {
        if(!this.bar) { return; }
        let p = this.getPercentage();
        if(this.direction == "ltr") { p = 1.0 - p; }
        this.bar.style.width = (p*100) + "%";
        this.bar.style.backgroundColor = this.color;
    }

    addEventListener(type: string, callback: (this: HTMLDivElement, ev: any) => any)
    {
        if(!this.node) { return; }
        this.node.addEventListener(type, callback);
    }
}