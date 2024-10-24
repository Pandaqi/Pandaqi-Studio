import OnPageVisualizer from "js/pq_games/tools/generation/boardVisualizer"
// @ts-ignore
import { Scene } from "js/pq_games/phaser/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import Evaluator from "./evaluator"
import CONFIG from "./config"
import Point from "js/pq_games/tools/geometry/point"

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
        OnPageVisualizer.convertCanvasToImage(this, CONFIG.convertParameters);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);
        this.evaluator = new Evaluator();
        this.boardDisplay = new BoardDisplay(this);
        CONFIG.convertParameters.splitDims = CONFIG.printSize;
    }

    async generate()
    {
        do {
            this.board = new BoardState();
            this.board.generate();
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        this.boardDisplay.draw(this.board);
    }    
}

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });
