import Timer from "./timer"

export default class Turn {
    constructor(game, wordObject)
    {
        this.game = game;
        this.word = wordObject.getWord();
        this.lines = wordObject.getLines();
        this.food = wordObject.getPoints();
        this.timer = new Timer(this, game.getConfig().timerLength);
        this.visualize();
    }

    getWord() { return this.word; }
    getLines() { return this.lines; }
    getFood() { return this.food; }

    changeLines(dl)
    {
        this.lines = Math.max(this.lines + dl, 0);
        if(this.lines <= 0) { this.game.interface.onLinesExhausted(); }
        this.visualize();
    }

    changeFood(df)
    {
        this.food += df;
        this.visualize();
    }

    changeTimer(dt)
    {
        this.timer.change(dt);
        this.visualize();
    }

    visualize()
    {
        this.game.interface.visualizeTimer(this.timer.getTime(), this.timer.getPercentage());
        this.game.interface.visualizeLines(this.lines);
        this.game.interface.visualizeFood(this.food);
    }

    end(success)
    {
        if(success) { this.game.scoreWord(this.food); }
        this.game.gotoNextPhase();
    }
}