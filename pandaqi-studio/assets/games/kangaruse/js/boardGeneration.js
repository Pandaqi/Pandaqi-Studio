import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene } from "js/pq_games/phaser.esm"
import BoardState from "./boardState"
import BoardDisplay from "./boardDisplay"
import TypeManager from "./typeManager"
import Evaluator from "./evaluator"

const sceneKey = "boardGeneration"
const config = {
    inkFriendly: false,
    includeRules: true,
    expansions: {
        // @TODO
    },

    board: {
        dims: { x: 8, y: 6 },
        resolutionPerCell: 5,
        outerMarginFactor: { x: 0.05, y: 0.05 }, // empty space around the board, fraction of total paper size
        grid: {
            lineWidth: 0.05, // fraction of CellSizeUnit
            lineColor: 0xFFFFFF,
            lineAlpha: 0.66
        },
    },

    types: {
        // @TODO
    }
}

class BoardGeneration extends Scene
{
	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        this.load.crossOrigin = 'Anonymous';
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        //this.load.spritesheet("tutorials_spritesheet", base + 'tutorials_spritesheet.webp', config.types.sheetData);
    }

    async create(userConfig) {
        this.setup(userConfig)
        await this.generate();
        this.draw();
        PandaqiPhaser.convertCanvasToImage(this);
    }

    setup(userConfig)
    {
        const cfg = Object.assign({}, config);
        Object.assign(cfg, userConfig);
        this.cfg = cfg;
        this.evaluator = new Evaluator(this);
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

export default () => { PandaqiPhaser.linkTo(BoardGeneration, sceneKey); }
