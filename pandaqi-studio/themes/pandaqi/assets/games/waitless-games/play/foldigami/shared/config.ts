import { CVal, SettingType, Vector2, MapperPreset } from "lib/pq-games";
import { RendererPixi } from "lib/pq-games";
import { boardPicker } from "../board/boardPicker";

export const CONFIG =
{   
    _game:
    {
        fileName: "Foldigami",
        renderer: new RendererPixi()
    },

    _settings:
    {
        includeRules:
        {
            type: SettingType.CHECK,
            label: "Include Rules",
            value: true,
            remark: "Only turn off if you're familiar with all the rules."
        },

        difficulty:
        {
            type: SettingType.ENUM,
            values: ["easy", "medium", "hard"],
            value: "easy",
            remark: "Higher difficulties fill more of the board and use more complicated powerups."
        },

        noRotation:
        {
            type: SettingType.CHECK,
            label: "Rotate Icons Identically",
            value: false,
            remark: "Normally, icons rotate towards the player to whom they belong." 
        }
    },

    typeDict: {}, // to be filled by type sustem; ugly method, saw no better way when converting to TypeScript

    _resources:
    {    
        base: "/waitless-games/play/foldigami/assets/",
        files:
        {
            jockey:
            {
                path: "fonts/JockeyOne-Regular.woff2"
            },

            types: 
            {
                path: "types.webp",
                frames: new Vector2(8,2),
            },

            tutorial:
            {
                path: "tutorial.webp",
                frames: new Vector2(8,3)
            },

            teams:
            {
                path: "teams.webp",
                frames: new Vector2(4,1)
            },

            scroll_grayscale:
            {
                path: "scroll_grayscale.webp"
            }
        },
    },

    _material:
    {
        board:
        {
            picker: () => boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    // how generation/balancing happens
    generation:
    {
        teams:
        {
            num: 2,
            maxStartingScoreDifference: 3
        },

        evaluator:
        {
            debug: false, // @DEBUGGING (should be false)
            forbidNegativeScores: true
        },

        types:
        {
            debug: [], // @DEBUGGING (should be empty)
            setTemplate: ["required", "score", "rot"],
            emptyKey: "empty",
            maxSetSize: { min: 4, max: 5 },
            generalMaxPerType: 7,
            generalMaxPerTeam: 7,
            maxPerDifficulty: 
            {
                easy: 3,
                medium: 4,
                hard: 5
            }
        },

        tutorial:
        {
            insideCells: true
        },

        board:
        {
            modifyEdgeCells: true,
            size: new Vector2(7, 5),
            percentageEmpty: 
            {
                easy: { min: 0.2, max: 0.3 }, // relative to total number of cells
                medium: { min: 0.125, max: 0.2 },
                hard: { min: 0.05, max: 0.125 }
            }
        }
    },

    // how to draw stuff
    _drawing:
    {
        teams: 
        {
            textureKey: "teams",
            iconScale: 0.4, // both relative to iconSize = spriteSize of cell
            iconOffset: 0.4,
        },

        evaluator: 
        {
            font: 
            {
                size: new CVal(0.1, "cellSizeUnit"),
                color: "#333333",
                strokeColor: "#999999",
                strokeThickness: new CVal(0.02, "cellSizeUnit"),
                margin: new CVal(0.05, "cellSizeUnit")
            }
        },

        types: 
        {
            textureKey: "types"
        },

        tutorial: 
        {
            textureKey: "tutorial"
        },

        board: 
        {
            position: "center",
            addHalfLines: true,
            outerMargin: { x: 0.05, y: 0.05 }, // relative to total page size
            iconScale: 0.9,
            tutScale: 0.9,

            grid: 
            {
                colorNeutral: "#CCFFCC",
                colorModifyPercentage: 10,
                colorBackgroundAlpha: 1.0,
                lineWidth: new CVal(0.015, "cellSizeUnit"),
                lineColor: "#333333",
                halfLineWidth: new CVal(0.015*0.5, "cellSizeUnit"),
                halfLineColor: "#333333",
                halfLineAlpha: 0.5,
            },

            outline: 
            {
                width: new CVal(0.03, "cellSizeUnit"),
                color: "#333333"
            },

            font: 
            {
                family: "jockey",
                size: new CVal(0.3, "cellSizeUnit"),
                color: "#000000",
                strokeColor: "#FFFFFF",
                strokeWidth: new CVal(0.025, "cellSizeUnit"),
            }
        }
    }
}
