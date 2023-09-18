// @ts-nocheck
import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene } from "js/pq_games/phaser.esm"
import Board from "./board"
import Evaluator from "./evaluator"
import Types from "./types"
import CONFIG from "./config"

const sceneKey = "boardGeneration"

class BoardGeneration extends Scene
{
    board: Board
    evaluator: Evaluator
    canvas: HTMLCanvasElement
    types:Types

	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        this.load.crossOrigin = 'Anonymous';
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        this.load.spritesheet(CONFIG.types.textureKey, base + CONFIG.types.textureKey + '.webp', CONFIG.types.sheetData);
        this.load.spritesheet(CONFIG.tutorial.textureKey, base + CONFIG.tutorial.textureKey + '.webp', CONFIG.tutorial.sheetData);
        this.load.spritesheet(CONFIG.teams.textureKey, base + CONFIG.teams.textureKey + '.webp', CONFIG.teams.sheetData);
        this.load.image("scroll_grayscale", base + "/grayscale_scroll.webp");
    }

    async create(userConfig:Record<string,any>) 
    {
        this.setup(userConfig)
        await this.generate();
        this.draw();
        PandaqiPhaser.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(CONFIG, userConfig);

        this.types = new Types(this);
        this.board = new Board(this);
        this.evaluator = new Evaluator(this);
    }

    async generate()
    {
        let validBoard = false;
        do {
            this.board.generate();
            validBoard = this.evaluator.evaluate(this.board);
        } while(!validBoard);
    }

    draw()
    {
        this.board.draw();
        this.evaluator.draw(this.board);
    }    
}

PandaqiPhaser.linkTo({ scene: BoardGeneration, key: sceneKey });

