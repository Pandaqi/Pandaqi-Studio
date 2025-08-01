// @ts-ignore
// import { Scene } from "lib/pq-games/phaser/phaser.esm"
import Board from "./board"
import Drawer from "./drawer"
import Evaluator from "./evaluator"
import { CONFIG } from "./config"

const sceneKey = "boardGeneration"

class BoardGeneration extends Scene
{

    board: Board
    evaluator: Evaluator
    canvas: HTMLCanvasElement
    drawer: Drawer

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
        this.drawer = new Drawer(this);
        CONFIG.convertParameters.splitDims = CONFIG.printSize;
    }

    async generate()
    {
        do {
            this.board = new Board();
            this.board.generate();
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        this.drawer.draw(this.board);
    }    
}

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });
