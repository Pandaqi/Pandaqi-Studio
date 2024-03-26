// @ts-nocheck
import OnPageVisualizer from "js/pq_games/website/onPageVisualizer"
import { Scene } from "js/pq_games/phaser/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import Evaluator from "./evaluator"
import CONFIG from "./config"

const sceneKey = "boardGeneration"

class BoardGeneration extends Scene
{

    evaluator:Evaluator
    board:BoardState
    canvas:HTMLCanvasElement

	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        this.load.crossOrigin = 'Anonymous';
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        const sd = CONFIG.types.sheetData;
        // DEPRECATED; score displays now generated dynamically based on types actually used in board
        // this.load.image("score_sheet", base + "score_sheet.webp");
        this.load.spritesheet("general", base + 'general_spritesheet.webp', sd);
        this.load.spritesheet("cell_types", base + 'cell_types.webp', sd);
        this.load.spritesheet("cell_types_simplified", base + 'cell_types_simplified.webp', sd);
        this.load.image("sidebar_tutorial", base + "sidebar_tutorial.webp");
    }

    async create(userConfig:Record<string,any>) {
        this.setup(userConfig)
        await this.generate();
        this.draw();
        OnPageVisualizer.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);
        this.evaluator = new Evaluator();

        let cellTexture = "cell_types";
        if(CONFIG.inkFriendly || CONFIG.simplifiedIcons) { cellTexture = "cell_types_simplified"; }
        CONFIG.cellTexture = cellTexture;
    }

    async generate()
    {
        do {
            this.board = new BoardState(this);
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        const visualizer = new BoardDisplay(this);
        visualizer.draw(this.board);
    }    
}

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });

