import { SignalManager } from "lib/pq-games";

export default class Timer
{
    node: HTMLDivElement;
    bar: HTMLDivElement;
    started: boolean;
    duration: number;
    timeleft: number;
    signals: SignalManager;
    updateInterval: any;
    text: HTMLDivElement;

    constructor(duration:number)
    {
        this.duration = duration;
        this.timeleft = this.duration;
        this.signals = new SignalManager();
        this.started = false;

        this.setupHTML()
    }

    getContainer() { return this.node; }
    setupHTML()
    {
        const node = document.createElement("div");
        node.classList.add("timer-container");

        const bar = document.createElement("div");
        bar.classList.add("timer-bar");
        node.appendChild(bar);

        const text = document.createElement("div");
        text.classList.add("timer-text");
        node.appendChild(text);

        this.node = node;
        this.bar = bar;
        this.text = text;

        this.node.addEventListener("click", (ev) => {
            this.signals.dispatchEvent("tap");

            if(this.started) { this.stop(); }
            else { this.start(); }
        })
    }

    getTimeLeft() { return this.timeleft; }
    getRatioLeft() { return this.timeleft / this.duration; }
    getRatioDone() { return 1.0 - this.getRatioLeft(); }

    start()
    {
        this.updateInterval = setInterval(this.update.bind(this), 1000);
        this.setText();
    }

    stop()
    {
        clearInterval(this.updateInterval);
    }

    update()
    {
        this.timeleft -= 1;
        this.setText();
        
        this.bar.style.width = (this.getRatioLeft() * 100) + "%";

        const timeRanOut = this.timeleft <= 0;
        if(timeRanOut)
        {
            this.stop();
            this.signals.dispatchEvent("timeout");
        }
    }

    setText()
    {
        this.text.innerHTML = "<span>" + this.timeleft + "</span>";
    }

    
}