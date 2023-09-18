import PandaqiPhaser from "js/pq_games/website/phaser"
// @ts-ignore
import { Scene } from "js/pq_games/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import Evaluator from "./evaluator"
import CONFIG from "./config"

const sceneKey = "boardGeneration"

class BoardGeneration extends Scene
{

    board: BoardState
    evaluator: Evaluator
    canvas: HTMLCanvasElement
    boardDisplay: BoardDisplay

	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        // @ts-ignore
        this.load.crossOrigin = 'Anonymous';
        // @ts-ignore
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        const sheetData = CONFIG.sheetData;
        // this.load.spritesheet("tutorials_spritesheet", base + 'tutorials_spritesheet.webp', sheetData);
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
        this.boardDisplay = new BoardDisplay(this);
        CONFIG.boardDisplay = this.boardDisplay;
    }

    async generate()
    {
        do {
            this.board = new BoardState();
            await this.board.generate();
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        this.boardDisplay.draw(this.board);
    }    
}

PandaqiPhaser.linkTo({ scene: BoardGeneration, key: sceneKey });
