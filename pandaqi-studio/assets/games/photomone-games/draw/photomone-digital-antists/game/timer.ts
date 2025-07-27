import Turn from "./turn"

export default class Timer 
{
    turn: Turn;
    time: number;
    maxTime: number;
    interval: number;
    intervalHandler: any;
    
    constructor(turn, duration)
    {
        this.turn = turn;
        this.time = parseFloat(duration);
        this.maxTime = this.time;
        this.interval = 1000; 
        this.intervalHandler = null;
    }

    start()
    {
        this.intervalHandler = setInterval(this.advanceTime.bind(this), this.interval);
        this.visualize();
    }

    stop()
    {
        clearInterval(this.intervalHandler);
        this.intervalHandler = null;
    }

    change(dt) { 
        this.time = Math.max(this.time + dt, 0);
        this.maxTime = Math.max(this.maxTime + dt, 1);
    }

    isRunning() { return this.intervalHandler; }
    getPercentage() { return (this.time / this.maxTime); }
    getTime() { return this.time; }
    advanceTime()
    {
        if(!this.isRunning()) { return; }

        this.time -= (this.interval / 1000.0);
        this.visualize();

        const ranOut = this.time <= 0;
        if(!ranOut) { return; }

        this.stop();
        this.turn.end(false);
    }

    onTap()
    {
        this.stop();
        this.turn.end(true);
    }

    visualize()
    {
        this.turn.visualize();
    }
}