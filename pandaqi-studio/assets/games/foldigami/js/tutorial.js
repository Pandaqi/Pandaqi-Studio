import { Geom } from "js/pq_games/phaser.esm"

export default class Tutorial
{
    constructor(game)
    {
        this.game = game;
        this.cfg = this.game.cfg;
        this.cfgTut = this.cfg.tutorial;
        this.setupOuterRectangle();
    }

    setupOuterRectangle()
    {
        if(this.cfgTut.insideCells) { return; }

        const boardSpace = this.game.board.getOuterRectangle();
        const size = this.game.canvas;
        const minSize = Math.min(size.width, size.height);
        const cfg = this.cfg.tutorial;
        const margin = { x: cfg.outerMargin.x * minSize, y: cfg.outerMargin.y * minSize }

        this.outerRect = new Geom.Rectangle(
            0, 0,
            size.width - boardSpace.width,
            size.height
        )
        this.rect = new Geom.Rectangle(
            this.outerRect.x + margin.x,
            this.outerRect.y + margin.y,
            this.outerRect.x - 2*margin.x,
            this.outerRect.y - 2*margin.y
        );
    }

    generate()
    {

    }

    draw()
    {
        const headingConfig = {
            align: "center"
        }
        const texts = this.cfgTut.texts;
        const heading = this.game.add.text(0, 0, texts.heading, headingConfig);

        
    }
}