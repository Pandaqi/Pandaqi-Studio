// @ts-nocheck
import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene } from "js/pq_games/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import Evaluator from "./evaluator"
import CONFIG from "./config"

const sceneKey = "boardGeneration"

class BoardGeneration extends Scene
{

    evaluator:Evaluator
    board:BoardState

	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        this.load.crossOrigin = 'Anonymous';
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        const sd = CONFIG.types.sheetData;
        this.load.image("score_sheet", base + "score_sheet.webp");
        this.load.spritesheet("general", base + 'general_spritesheet.webp', sd);
        this.load.spritesheet("cell_types", base + 'cell_types.webp', sd);
        this.load.spritesheet("cell_types_simplified", base + 'cell_types_simplified.webp', sd);
    }

    async create(userConfig:Record<string,any>) {
        this.setup(userConfig)
        await this.generate();
        this.draw();
        PandaqiPhaser.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);
        this.evaluator = new Evaluator();
    }

    async generate()
    {
        console.log(CONFIG);
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

PandaqiPhaser.linkTo(BoardGeneration, sceneKey);
