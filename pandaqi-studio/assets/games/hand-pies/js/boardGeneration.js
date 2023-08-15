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
        machines: false,
        recipeBook: false,
        money: false,
        fixedFingers: false
    },

    board: {
        dims: { x: 8, y: 6 },
        resolutionPerCell: 5,
        maxGridLineVariation: 0.1,
        smoothingResolution: 8,
        grid: {
            lineWidth: 0.05,
            lineColor: 0xFFFFFF,
            lineAlpha: 0.66
        }
    },

    types: {
        ingredientBounds: { min: 3, max: 6 },
        machineBounds: { min: 2, max: 4 }
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
        //this.load.spritesheet(config.types.textureKey, base + config.types.textureKey + '.webp', config.types.sheetData);
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
        this.typeManager = new TypeManager(this);
        this.evaluator = new Evaluator(this);
    }

    async generate()
    {
        do {
            this.board = new BoardState(this);
            this.board.assignTypes(this.typeManager);
        } while(!this.evaluator.isValid(this.board));
    }

    draw()
    {
        const visualizer = new BoardDisplay(this);
        visualizer.draw(this.board);
    }    
}

export default () => { PandaqiPhaser.linkTo(BoardGeneration, sceneKey); }
