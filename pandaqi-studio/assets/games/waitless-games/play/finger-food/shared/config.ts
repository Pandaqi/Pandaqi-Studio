import { boardPicker } from "../board/boardPicker";
import { CVal, SettingType, MapperPreset, Bounds, Vector2 } from "lib/pq-games";

export const CONFIG =
{
    _game:
    {
        fileName: "Finger Food",
    },

    _settings:
    {
        includeRules:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Include Rules",
            remark: "Only turn off if you're familiar with all the rules."
        },

        expansions:
        {
            machines:
            {
                type: SettingType.CHECK,
                label: "Mighty Machines",
                value: false,
                remark: "Adds squares with a special action when you pick them."
            },

            recipeBook:
            {
                type: SettingType.CHECK,
                label: "Recipe Book",
                value: false,
                remark: "Adds more ways to score by combining specific ingredients!"
            },

            money:
            {
                type: SettingType.CHECK,
                label: "Dining Dollars",
                value: false,
                remark: "Adds the element of money, causing longer and more tactical games."
            },

            fixedFingers:
            {
                type: SettingType.CHECK,
                label: "Fixed Fingers",
                value: false,
                remark: "Adds restrictions to which finger you're allowed to use for something."
            }
        }
    },
    
    _resources:
    {    
        base: "/waitless-games/play/finger-food/assets/",
        files:
        {
            cherrybomb:
            {
                path: "fonts/CherryBombOne-Regular.woff2"
            },

            tutorials_spritesheet:
            {
                path: "tutorials_spritesheet.webp",
                frames: new Vector2(6,1)
            },

            custom_spritesheet:
            {
                path: "custom_spritesheet.webp",
                frames: new Vector2(8,1)
            },

            fixed_fingers_spritesheet:
            {
                path: "fixed_fingers_spritesheet.webp",
                frames: new Vector2(6,1)
            },

            ingredient_tuts:
            {
                path: "ingredient_tuts.webp",
                frames: new Vector2(8,3)
            },

            ingredient_spritesheet:
            {
                path: "ingredient_spritesheet.webp",
                frames: new Vector2(8,3)
            },

            machine_spritesheet:
            {
                path: "machine_spritesheet.webp",
                frames: new Vector2(8,3)
            },

            machine_tuts:
            {
                path: "machine_tuts.webp",
                frames: new Vector2(8,3)
            },
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
        board:
        {
            size: new Vector2(8, 6)
        },

        types:
        {
            globalMaxPerType: 0.225, // percentage of total cells, NO type can have more than this
            ingredientBoundsBaseGame: new Bounds(4, 6),
            ingredientBoundsWithMachines: new Bounds(3, 4),
            machineBounds: new Bounds(2, 4),
            numPlaced: {
                machine: new Bounds(0.1, 0.3),
                money: new Bounds(0.135, 0.215)
            },

            moneyTypeBounds: new Bounds(0.25, 0.5), // what percentage of all types should be bought for MONEY
            moneyPercentagePayable: new Bounds(0.5, 0.75), // what percentage of TOTAL money is available as cells on the board
            maxPower: 3, // so, 0-2
            maxMoney: 7,
            maxValueForMoneyCell: 5, // should be lower than maxMoney, otherwise you can buy anything with ONE square,
            fixedFingerBounds: new Bounds(0.25, 0.5),
            sheetData: { frameWidth: 256, frameHeight: 256 }
        },

        recipes:
        {
            bounds: new Bounds(3, 5),
            recipeLength: new Bounds(2, 4),
            maxScoreMostValuableIngredient: 5,
            forbiddenRecipeProb: 0.3 // you are PENALIZED for getting this recipe (with inverted score)
        },

        evaluator:
        {
            timerRelevantCellsMinimum: 4
        }
    },

    // how to draw stuff
    _drawing:
    {
        board: 
        {
            resolutionPerCell: 5,
            maxGridLineVariation: new CVal(0.1, "cellSizeUnit"),

            useWobblyLines: true,
            smoothingResolution: 8,
            outerMarginFactor: new Vector2(0.05, 0.05), // empty space around the board, fraction of total paper size
            grid: 
            {
                lines: 
                {
                    width: new CVal(0.05, "cellSizeUnit"),
                    color: "#FFFFFF",
                    alpha: 0.66
                },
                linesInkfriendly: 
                {
                    width: new CVal(0.025, "cellSizeUnit"),
                    color: "#333333",
                    alpha: 1.0
                }
            },
            outerEdge: 
            {
                lineWidth: new CVal(0.02, "cellSizeUnit"),
                lineColor: "#333333",
                lineAlpha: 1.0
            },
            iconScale: 0.75,
            extraFrameScale: 0.66,
            moneySpriteScale: 0.66,

            moneyTextConfigTiny: 
            {
                fontFamily: "cherrybomb",
                fontScaleFactor: 0.15,
                color: "#003300",
                stroke: "#50FF4B",
                align: "center"
            },

            moneyTextConfig: 
            {
                fontFamily: "cherrybomb",
                fontScaleFactor: 0.33,
                color: "#50FF4B",
                stroke: "#000000",
                align: "center"
            }
        },

        recipes:
        {
            paddingWithinRecipe: new CVal(0.025, "cellSizeUnit"),
            paddingBetweenRecipes: new CVal(0.025, "cellSizeUnit"),
            marginAroundRecipeBook: new CVal(0.02, "cellSizeUnit"),

            textConfig: 
            {
                fontFamily: "cherrybomb",
                fontScaleFactor: 0.33,
                color: "#222222",
                stroke: "#EEEEEE",
            }
        },

        tutorials:
        {
            cornerIconSize: 0.175 // relative to CELL size (of the tutorial on which it is placed)
        },

        fixedFingers:
        {
            handScale: 0.35 // relative to entire height of the "extra data frame"
        }
    }
}
