import Point from "js/pq_games/tools/geometry/point";
import { KEEBBLE_TYPES, KEEBBLE_LETTER_VALUES } from "./dict"

export default 
{
    inkFriendly: false,
    playerColors: [],
    letterDictionary: {},
    numPlayers: 4,
    addWalls: false,

    expansions:
    {
        specialCells: false,
        scrabbleScoring: false,
        tinyBackpacks: false
    },

    gameTitle: "Keebble",
    numCellsX: 8,
    numCellsY: 8,
    gridColor: "#000000",
    gridAlpha: 0.5,
    lineWidth: 4,
    backpackGridColor: "#000000",
    backpackGridAlpha: 0.5,
    backpackGridSize: new Point(4, 4),
    backpackLineWidth: 2,
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numLetters: { min: 0.03, max: 0.08 }, // percentage of total num tiles
    numSpecial: { min: 0.025, max: 0.08 },
    numWalls: { min: 0.04, max: 0.09 },
    startHandSize: { min: 1, max: 4 }, // not a percentage, just #starting letters
    fontFamily: "Arbutus Slab",
    letterMargin: 15,
    spriteMargin: 15,

    baseCellBackgroundHue: Math.random() * 360, // 20 seems a good value
    cellBackgroundHueVariation: 50,
    baseCellBackgroundRandomness: 0.1, // percentage of cell size

    disallowedNeighborsOnPlacement: 4,
    createStartingHands: true,
    addStartingCell: true,
    showLetterValues: false,

    types: KEEBBLE_TYPES,
    scrabbleScores: KEEBBLE_LETTER_VALUES,

    spriteAlpha: 1.0,
    forPrinting: false,
    boardSize: "regular",
    totalNumCells: 0,

    cellSizeX: 0,
    cellSizeY: 0,
    cellSize: new Point(),
    cellSizeUnit: 0,

    spriteSize: 0,
    letterFontSize: 0,
    maxLetterStrokeOffset: 0,
    handFontSize: 0,

    letterTextConfig: null,
    letterTextStrokeConfig: null,
    handTextConfig: null,
};