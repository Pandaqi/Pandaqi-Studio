import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene } from "js/pq_games/phaser.esm"
import Tutorial from "./tutorial"
import Board from "./board"
import Evaluator from "./evaluator"
import Types from "./types"

const sceneKey = "boardGeneration"
const config = {
    teams: {
        num: 2,
        maxStartingScoreDifference: 4,
        textureKey: "teams",
        sheetData: { frameWidth: 256, frameHeight: 256 },
        iconScale: 0.4, // both relative to iconSize = spriteSize of cell
        iconOffset: 0.4,
    },

    evaluator: {
        debug: false, // @DEBUGGING (should be false)
        forbidNegativeScores: true,
        font: {
            size: 0.1,
            color: "#333333",
            strokeColor: "#999999",
            strokeThickness: 0.02,
            margin: 0.05
        }
    },

    types: {
        debug: [], // @DEBUGGING (should be empty)
        setTemplate: ["required", "score", "rotation"],
        textureKey: "types",
        emptyKey: "empty",
        sheetData: { frameWidth: 256, frameHeight: 256 },
        maxSetSize: { min: 4, max: 5 },
        generalMaxPerType: 7,
        generalMaxPerTeam: 7,
    },

    board: {
        position: "center",
        modifyEdgeCells: true,
        addHalfLines: true,
        dims: { x: 7, y: 5 },
        percentageEmpty: {
            easy: { min: 0.1, max: 0.2 }, // relative to total number of cells
            medium: { min: 0.2, max: 0.25 },
            hard: { min: 0.25, max: 0.3 }
        },
        outerMargin: { x: 0.05, y: 0.05 }, // relative to total page size
        iconScale: 0.9,
        tutScale: 0.9,
        grid: {
            colorNeutral: "#CCFFCC",
            colorModifyPercentage: 10,
            colorBackgroundAlpha: 1.0,
            lineWidth: 0.015, // relative to cell size
            lineColor: 0x333333,
            halfLineWidth: 0.015*0.5, // relative to cell size; just half lineWidth
            halfLineColor: 0x333333,
            halfLineAlpha: 0.5,
        },
        outline: {
            width: 0.03, // relative to cell size
            color: 0x333333
        },
        font: {
            family: 'Jockey One',
            size: 0.3, // relative to cell size
            color: '#000000',
            strokeColor: "#FFFFFF",
            strokeWidth: 0.05, // relative to cell size
        }
    },

    tutorial: {
        textureKey: "tutorial",
        sheetData: { frameWidth: 256, frameHeight: 256 },
        insideCells: true,
        outerMargin: { x: 0.05, y: 0.05 },
        texts: {
            heading: "How to Play?"
        }
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
        this.load.spritesheet(config.types.textureKey, base + config.types.textureKey + '.webp', config.types.sheetData);
        this.load.spritesheet(config.tutorial.textureKey, base + config.tutorial.textureKey + '.webp', config.tutorial.sheetData);
        this.load.spritesheet(config.teams.textureKey, base + config.teams.textureKey + '.webp', config.teams.sheetData);
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

        this.types = new Types(this);
        this.board = new Board(this);
        this.tutorial = new Tutorial(this);
        this.evaluator = new Evaluator(this);
    }

    async generate()
    {
        let validBoard = false;
        do {
            this.board.generate();
            validBoard = this.evaluator.evaluate(this.board);
        } while(!validBoard);

        this.tutorial.generate();
    }

    draw()
    {
        this.board.draw();
        this.tutorial.draw();
        this.evaluator.draw(this.board);
    }    
}

export default () => { PandaqiPhaser.linkTo(BoardGeneration, sceneKey); }
