import WordsPhotomone from "./wordsPhotomone";
import Map from "./map";
import MapVisualizer from "./mapVisualizer";
import CanvasDrawable from "./canvasDrawable";
import dataPhotomone from "./gameDictionary";
import dataPhotomoneDigital from "./gameDictionaryDigital";
import Color from "js/pq_games/canvas/color";
import ResourceLoader from "js/pq_games/canvas/resourceLoader";
import InterfaceWordOptions from "./interfaceWordOptions";
import Point from "./point";
import Line from "./line";

const PHOTOMONE_BASE_PARAMS = {
    width: 512,
    height: 512 * (1/1.4142), // A4/A5 paper ratio
    resizePolicy: "width", // width, height or full
    resolution: 2,

    wordsToGuessForWinning: 7,
    numberRounding: {
        types: 2,
        points: 2,
        lines: 4,
    },

    pointBounds: { min: 150, max: 200 },
    typeBounds: { min: 0.166, max: 0.185 }, // this is a percentage of the total number of points

    pointRadiusFactor: 0.0075,
    pointRadiusSpecialFactor: 0.02,
    pointTypesDictionary: null,
    pointTypesDictionaries: {
        photomone: dataPhotomone.POINT_TYPES,
        photomoneDigital: dataPhotomoneDigital.POINT_TYPES,
    },
    tutorialParams: dataPhotomoneDigital.TUTORIAL_PARAMS,

    pointTypes: [],
    colors: [
        new Color(284, 79, 24), new Color(46, 100, 62), new Color(145, 100, 61), new Color(347, 83, 60),
        new Color(217, 100, 56), new Color(30, 13, 33), new Color(194, 100, 66), new Color(237, 77, 77)
    ],
    pointColor: new Color(100, 18, 13),
    lightPointColor: new Color(0, 0, 50),
    lineColor: new Color(100, 18, 13),
    lineWidthFactor: 0.005,

    numTurnBounds: { min: 6, max: 10 },
    timerLength: 45,
    
    activeLineWidthFactor: 0.01,
    activeLineColor: "#FF0000",
    activePointColor: "#FF0000",
    activePointRadiusScale: 1.5,

    expansions: {},
    categories: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
    pointSpritePath: null,
    pointSpritePaths: {
        photomone: "/photomone/assets/point_types.webp",
        photomoneDigital: "/photomone-digital-antists/assets/point_types.webp",
    },
    pointSpriteFrames: null,
    pointSpriteFrameSets: {
        photomone: { x: 8, y: 3 },
        photomoneDigital: { x: 8, y: 2 }
    },

    printWordsOnPaper: false,
    numWordColumns: 4,
    numWordRows: 8,
    spaceReservedForWordsFactor: 0.2,
    wordsOnPaperLineValues: [12,24,36],
    wordsOnPaperPointsScalar: 0.725,

    addStartingLines: false,
    addUI: false,
    transparentBackground: true,

    fontSizeFactor: 0.025,
    fontFamily: 'GelDoticaLowerCase',
    wordMarginFactor: 0.0075,
    maxWordColumns: 4,

    wordInterface: {
        listenToExpansions: true
    }
}
window.PHOTOMONE_BASE_PARAMS = PHOTOMONE_BASE_PARAMS;

const PHOTOMONES = []; // just for easy debugging
const PHOTOMONE = {

    Map: Map,
    WordsPhotomone: WordsPhotomone,
    MapVisualizer: MapVisualizer,
    Point: Point,
    Line: Line,
    InterfaceWordOptions: InterfaceWordOptions,
    CanvasDrawable: CanvasDrawable,

    Game: class {
        constructor(params) { this.start(params); }
        
        // Creates a dictionary only with the point types we want to use (given user configuration)
        preparePointTypes(cfg)
        {
            const dict = cfg.pointTypesDictionary;
            const newDict = {};
            for(const [key, value] of Object.entries(dict))
            {
                if(value.expansion && !cfg.expansions[value.expansion]) { continue; }
                newDict[key] = value;
            }
            return newDict;
        }
    
        async start(params)
        {
            const gameTitle = params.gameTitle || "photomone";
    
            let configString = window.localStorage.photomoneConfig;
            if(gameTitle == "photomoneDigital") { 
                configString = window.localStorage.photomoneDigitalAntistsConfig; 
            }
        
            let config = Object.assign({}, PHOTOMONE_BASE_PARAMS);
            let userConfig = JSON.parse(configString || "{}");
            Object.assign(config, userConfig);
        
            config.pointTypesDictionary = config.pointTypesDictionaries[gameTitle];
            config.pointTypes = this.preparePointTypes(config);
            config.pointSpritePath = config.pointSpritePaths[gameTitle];
            config.pointSpriteFrames = config.pointSpriteFrameSets[gameTitle];
            
            config.WORDS = new WordsPhotomone();
            await config.WORDS.prepare(config);
        
            config.RESOURCE_LOADER = new ResourceLoader();
            config.RESOURCE_LOADER.planLoad("point_types", { path: config.pointSpritePath, frames: config.pointSpriteFrames });
            await config.RESOURCE_LOADER.loadPlannedResources();
            
            const canvasNodes = document.getElementsByClassName("photomone-canvas");
            for(const canv of canvasNodes)
            {
                const c = new CanvasDrawable(canv, config);
                PHOTOMONES.push(c);
            }
        
            if(params.loadGame) { startPhotomoneGame(config); }
        }
    }
}

window.PHOTOMONE = PHOTOMONE;
export default PHOTOMONE;