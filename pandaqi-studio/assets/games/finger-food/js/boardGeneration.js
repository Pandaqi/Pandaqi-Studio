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
        outerMarginFactor: { x: 0.05, y: 0.05 }, // empty space around the board, fraction of total paper size
        grid: {
            lineWidth: 0.05, // fraction of CellSizeUnit
            lineColor: 0xFFFFFF,
            lineAlpha: 0.66
        },
        outerEdge: {
            lineWidth: 0.05,
            lineColor: 0x000000,
            lineAlpha: 1.0
        },
        iconScale: 0.75,
        extraFrameScale: 0.66,
        moneySpriteScale: 0.66,
        
        defaultBackgroundMachines: 0x484848,
        defaultBackgroundMoney: 0x056703,

        moneyTextConfigTiny: {
            fontFamily: "Cherry Bomb One",
            fontScaleFactor: 0.15,
            color: "#003300",
            stroke: "#50FF4B",
            align: "center"
        },

        moneyTextConfig: {
            fontFamily: "Cherry Bomb One",
            fontScaleFactor: 0.33,
            color: "#50FF4B",
            stroke: "#000000",
            align: "center"
        }
    },

    types: {
        ingredientBounds: { min: 3, max: 6 },
        machineBounds: { min: 2, max: 4 },
        moneyTypeBounds: { min: 0.33, max: 0.66 }, // what percentage of all types should be bought for MONEY
        moneyTargetBounds: { min: 0.5, max: 0.75 },
        maxPower: 3, // 0-3
        maxMoney: 7,
        maxValueForMoneyCell: 4, // should be lower than maxMoney, otherwise you can buy anything with ONE square,
        maxMoneyDrawProb: 3, // at the highest possible need, this is the probability of adding a money square
        fixedFingerBounds: { min: 0.1, max: 0.33 },
        sheetData: { frameWidth: 256, frameHeight: 256 }
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
        this.load.spritesheet("tutorials_spritesheet", base + 'tutorials_spritesheet.webp', config.types.sheetData);
        this.load.spritesheet("custom_spritesheet", base + 'custom_spritesheet.webp', config.types.sheetData);

        this.load.spritesheet("ingredient_spritesheet", base + 'ingredient_spritesheet.webp', config.types.sheetData);
        this.load.spritesheet("ingredient_tutorials_spritesheet", base + 'ingredient_tutorials_spritesheet.webp', config.types.sheetData);
        this.load.spritesheet("machine_spritesheet", base + 'machine_spritesheet.webp', config.types.sheetData);
        this.load.spritesheet("machine_tutorials_spritesheet", base + 'ingredient_tutorials_spritesheet.webp', config.types.sheetData);

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
