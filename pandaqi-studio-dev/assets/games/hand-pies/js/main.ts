// @ts-nocheck
import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene } from "js/pq_games/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import TypeManager from "./typeManager"
import Evaluator from "./evaluator"
import CONFIG from "./config"

const sceneKey = "boardGeneration"

class BoardGeneration extends Scene
{

    board: BoardState
    typeManager: TypeManager
    evaluator: Evaluator

	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        this.load.crossOrigin = 'Anonymous';
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        const sheetData = CONFIG.types.sheetData;
        this.load.spritesheet("tutorials_spritesheet", base + 'tutorials_spritesheet.webp', sheetData);
        this.load.spritesheet("custom_spritesheet", base + 'custom_spritesheet.webp', sheetData);

        this.load.spritesheet("ingredient_spritesheet", base + 'ingredient_spritesheet.webp', sheetData);
        this.load.spritesheet("ingredient_tutorials_spritesheet", base + 'ingredient_tutorials_spritesheet.webp', sheetData);
        this.load.spritesheet("machine_spritesheet", base + 'machine_spritesheet.webp', sheetData);
        this.load.spritesheet("machine_tutorials_spritesheet", base + 'ingredient_tutorials_spritesheet.webp', sheetData);

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
        this.typeManager = new TypeManager(this);
        this.evaluator = new Evaluator();
    }

    async generate()
    {
        do {
            this.board = new BoardState(this);
            const typeManager = new TypeManager(this);
            this.board.assignTypes(typeManager);
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        const visualizer = new BoardDisplay(this);
        visualizer.draw(this.board);
    }    
}

PandaqiPhaser.linkTo(BoardGeneration, sceneKey);
