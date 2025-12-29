import { KEEBBLE_TYPES, KEEBBLE_LETTER_VALUES } from "./dict"
import { boardPicker } from "./boardGeneration";
import { Vector2, MapperPreset } from "lib/pq-games";

export const CONFIG =
{
    playerColors: [],
    letterDictionary: {},

    _resources:
    {    
        base: "/keebble-games/spell/keebble/assets/",
        files:
        {
            arbutus:
            {
                path: "/keebble-games/assets/fonts/ArbutusSlab-Regular.woff2",
                useAbsolutePath: true,
            },

            special_cells:
            {
                path: "special_cells.webp",
                frames: new Vector2(8,2)
            }	
        },
    },

    // @NOTE: this is for the BOARD; Keebble Domino just overwrites with its own custom material
    _material:
    {
        board:
        {
            picker: boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    _game:
    {
        fileName: "Keebble"
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    numCellsX: 8,
    numCellsY: 8,
    gridColor: "#000000",
    gridAlpha: 0.5,
    lineWidth: 4,
    backpackGridColor: "#000000",
    backpackGridAlpha: 0.5,
    backpackGridSize: new Vector2(4, 4),
    backpackLineWidth: 2,
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numLetters: { min: 0.03, max: 0.08 }, // percentage of total num tiles
    numSpecial: { min: 0.025, max: 0.08 },
    numWalls: { min: 0.04, max: 0.09 },
    startHandSize: { min: 1, max: 4 }, // not a percentage, just #starting letters
    fontFamily: "arbutus",
    letterMargin: 15,
    spriteMargin: 15,

    cellBackgroundHueVariation: 50,
    baseCellBackgroundRandomness: 0.1, // percentage of cell size

    disallowedNeighborsOnPlacement: 4,
    createStartingHands: true,
    addStartingCell: true,
    showLetterValues: false,

    typesOriginal: KEEBBLE_TYPES,
    types: {},
    scrabbleScores: KEEBBLE_LETTER_VALUES,

    spriteAlpha: 1.0,
    forPrinting: false,
    boardSize: "regular",
    totalNumCells: 0,

    cellSizeX: 0,
    cellSizeY: 0,
    cellSize: new Vector2(),
    cellSizeUnit: 0,

    spriteSize: 0,
    letterFontSize: 0,
    maxLetterStrokeOffset: 0,
    handFontSize: 0,

    letterTextConfig: null,
    letterTextStrokeConfig: null,
    handTextConfig: null,
}