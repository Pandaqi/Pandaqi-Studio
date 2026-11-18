import { CVal, SettingType, MapperPreset, Vector2, Bounds } from "lib/pq-games";
import { boardPicker } from "./boardPicker";
import { MAX_NUM_PLAYERS } from "../shared/dict";

export const CONFIG = 
{
    _settings:
    {
        sideBarType:
        {
            type: SettingType.ENUM,
            values: ["no", "rules", "score"],
            value: "no",
            label: "Side Bar",
            remark: "Add the rules or a score tracker on the paper itself?"
        },

        startingPositions:
        {
            type: SettingType.CHECK,
            label: "Include Starting Positions",
            value: false,
            remark: "Marks a few squares as possible starting positions."
        },

        boardSize:
        {
            type: SettingType.ENUM,
            values: ["tiny", "small", "regular", "large", "huge"],
            value: "regular",
            label: "Board Size",
            remark: "For a really short or really long game. Changes #elements on page, not page size."
        },

        simplifiedIcons:
        {
            type: SettingType.CHECK,
            label: "Simplified Icons",
            value: false,
            remark: "Uses simple icons for all types, instead of realistic illustrations."
        }
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _material:
    {
        board:
        {
            picker: () => boardPicker,
            mapper: MapperPreset.FULL_PAGE,
        }
    },

    _resources:
    {    
        base: "/kangaruse/assets/",
        files:
        {
            mailray:
            {
                path: "fonts/MailRayStuff-Regular.woff2"
            },

            poppins:
            {
                path: "fonts/Poppins-Regular.woff2"
            },

            general_spritesheet:
            {
                path: "general_spritesheet.webp",
                frames: new Vector2(8,1),
            },

            cell_types:
            {
                path: "cell_types.webp",
                frames: new Vector2(8,4),
            },

            cell_types_simplified:
            {
                path: "cell_types_simplified.webp",
                frames: new Vector2(8,4),
            },

            sidebar_tutorial:
            {
                path: "sidebar_tutorial.webp",
            }
        },
    },

    _game:
    {
        fileName: "Kangaruse",
    },

    cellTexture: "cell_types", // changed to the inkfriendly/simplified version when needed

    // how generation/balancing happens
    generation:
    {
        maxNumPlayers: MAX_NUM_PLAYERS,

        minScoreTypes: 2,
        maxScoreTypes: 3,

        negativeScoreBounds: new Bounds(0.05, 0.2), // relative to total number of score cells
        allowNegativePoints: true,

        types:
        {
            numUniqueTypes: new Bounds(5, 7),
            scoreBounds: new Bounds(30, 50), // when the regular "score cell" is added, how high should the summed score numbers be from all those cells?
        },

        board:
        {
            sizePerSize: 
            {
                tiny: new Vector2(6, 5),
                small: new Vector2(8, 6),
                regular: new Vector2(12, 8),
                large: new Vector2(14, 10),
                huge: new Vector2(16, 12)
            },

            randomizeAxes: true, // numbers are given to columns 50% of the time, to rows the other 50%

            holes: 
            {
                enable: true,
                percentageOfBoard: 0.0866,
                sizeBounds: new Bounds(1, 4)
            },

            rivers: 
            {
                enable: true,
                percentageBounds: new Bounds(0.125, 0.2),
                sizeBounds: new Bounds(0.2, 0.5), // relative to longest side of grid
            },

            numbers: 
            {
                axis: "column",
                bounds: new Bounds(1, 4),
            },

            dirs: 
            {
                options: ["right", "down", "left", "up"],
            }
        },

        evaluator: 
        {
            minDistBetweenStartingPositions: 3,
            minScoreCellsPerQuadrant: 2,
            maxScoreDifferencePerQuadrant: 5,
            maxHoleClumpSize: 5,
            maxRiverCells: 0.166 // percentage of total # cells
        }
    },

    // how to draw stuff
    _drawing:
    {
        fonts:
        {
            heading: "mailray",
            body: "poppins"
        },

        sideBar: 
        {
            backgroundColor: "#FFCCAA",
            borderRadius: new CVal(0.03, "sideBarWidth"),
            padding: new CVal(0.025, "sideBarWidth"),

            gap: new CVal(0.05, "sizeX"), // gap between board and sidebar
            percentageOfBoardWidth: 0.3,
            scoreSheetRatio: (977/729.0),
            scoreSheetTexture: "score_sheet",
            tutorialHeight: new CVal(0.066, "sideBarHeight"),
            tutorialFontSize: new CVal(0.041, "sideBarWidth"),
            tutorialFontColor: "#000000",

            scoreTextAlpha: 0.35,
            scoreFontSize: new CVal(0.05, "sideBarWidth"),
            scoreFontColor: "#000000"
        },

        board: 
        {
            backgroundColor: "#461F09",
            padding: new CVal(0.0, "sizeUnit"),

            outerMarginFactor: new Vector2(0.08, 0.08), // empty space around the board, fraction of total paper size

            cellDisplay: 
            {
                icon: 
                {
                    corner: "center center",
                    scale: 0.8
                },

                space: 
                {
                    corner: "bottom center",
                    scale: 0.385
                },

                text: 
                {
                    corner: "center center",
                    scale: 0.4
                },

                stroke: 
                {
                    width: new CVal(0.035, "cellSizeUnit"),
                    color: "#EEEEEE",
                    alpha: 0.05
                },

                strokeInkfriendly: 
                {
                    width: new CVal(0.035, "cellSizeUnit"),
                    color: "#333333",
                    alpha: 0.66
                },

                cornerMargin: new CVal(0.1, "cellSizeUnit"),
                maxOffsetBG: new CVal(0.0, "cellSizeUnit"),
                scaleBG: 0.95,
                borderRadius: new CVal(0.1, "cellSizeUnit"),
            },

            rivers: 
            {
                lineWidth: new CVal(0.1, "cellSizeUnit"),
                color: "#BBAAFF",
                colorInkfriendly: "#2211FF",
                alpha: 1.0  
            },

            numbers: 
            {
                offsetFromGrid: new CVal(0.25, "cellSizeUnit"),
                fontSize: new CVal(0.375, "cellSizeUnit"),
                color: "#332211",
                strokeColor: "#FFDDBB",
                strokeWidth: 5, // absolute pixels, a text stroke of a few pixels is plenty at any size
            },

            dirs: 
            {
                offsetFromGrid: new CVal(0.275, "cellSizeUnit"),
                size: new CVal(0.4, "cellSizeUnit")
            },

            grid: 
            {
                lineWidth: new CVal(0.05, "cellSizeUnit"),
                lineColor: "#FFFFFF",
                lineAlpha: 0.66
            },
        },

        types: 
        {
            iconScale: new CVal(0.8, "cellSizeUnit"),
            fontSize: new CVal(0.35, "cellSizeUnit"),
            strokeWidth: new CVal(0.035, "cellSizeUnit"),
            color: "#FFFFFF",
            strokeColor: "#000000",
        }
    }
}
