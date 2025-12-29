import { Vector2, Color } from "lib/pq-games";

export const CONFIG_SHARED = 
{
    width: 512,
    height: 512 * (1/1.4142), // A4/A5 paper ratio
    resizePolicy: "width", // width, height or full
    resolution: 2,

    WORDS: null,
    RESOURCE_LOADER: null,

    _game:
    {
        fileName: "Photomone"
    },

    _resources:
    {    
        base: "/photomone-games/assets/",
        files:
        {
            geldotica:
            {
                path: "fonts/GelDoticaLowerCaseThick.woff2"
            },

            proza:
            {
                path: "fonts/ProzaLibre-Medium.woff2"
            },

            point_types:
            {
                path: "/photomone-games/draw/photomone/assets/point_types.webp",
                frames: new Vector2(8,3),
                useAbsolutePath: true
            },

            icon_points:
            {
                path: "icon_points.webp"
            },

            icon_lines:
            {
                path: "icon_lines.webp"
            }
        },
    },

    wordsToGuessForWinning: 7,
    numberRounding: 
    {
        types: 2,
        points: 2,
        lines: 4,
    },

    pointBounds: { min: 150, max: 200 },
    typeBounds: { min: 0.166, max: 0.185 }, // this is a percentage of the total number of points

    pointRadiusFactor: 0.0075,
    pointRadiusSpecialFactor: 0.02,
    pointTypesDictionary: null,
    tutorialParams: {},

    pointTypes: {},
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
        photomone: "/photomone-games/draw/photomone/assets/point_types.webp",
        photomoneDigital: "/photomone-games/draw/photomone-digital-antists/assets/point_types.webp",
    },
    pointSpriteFrames: null,
    pointSpriteFrameSets: {
        photomone: new Vector2(8, 3),
        photomoneDigital: new Vector2(8, 2)
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
    fontFamily: "geldotica",
    wordMarginFactor: 0.0075,
    maxWordColumns: 4,

    wordInterface: 
    {
        listenToExpansions: true
    }
}

// @ts-ignore
window.PHOTOMONE_BASE_PARAMS = PHOTOMONE_BASE_PARAMS;

export default PHOTOMONE_BASE_PARAMS;


