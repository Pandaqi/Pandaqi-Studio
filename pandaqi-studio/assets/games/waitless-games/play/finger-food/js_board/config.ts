import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG =
{
    visualizer: null,
    configKey: "fingerFoodConfig",
    assetsBase: "/waitless-games/play/finger-food/assets/",
    assets:
    {
        cherrybomb:
        {
            path: "fonts/CherryBombOne-Regular.woff2"
        },

        tutorials_spritesheet:
        {
            path: "tutorials_spritesheet.webp",
            frames: new Point(6,1)
        },

        custom_spritesheet:
        {
            path: "custom_spritesheet.webp",
            frames: new Point(8,1)
        },

        fixed_fingers_spritesheet:
        {
            path: "fixed_fingers_spritesheet.webp",
            frames: new Point(6,1)
        },

        ingredient_tuts:
        {
            path: "ingredient_tuts.webp",
            frames: new Point(8,3)
        },

        ingredient_spritesheet:
        {
            path: "ingredient_spritesheet.webp",
            frames: new Point(8,3)
        },

        machine_spritesheet:
        {
            path: "machine_spritesheet.webp",
            frames: new Point(8,3)
        },

        machine_tuts:
        {
            path: "machine_tuts.webp",
            frames: new Point(8,3)
        },
    },

    inkFriendly: false,
    includeRules: true,
    expansions: 
    {
        machines: false,
        recipeBook: false,
        money: false,
        fixedFingers: false
    },

    board: 
    {
        size: new Point(8, 6),
        resolutionPerCell: 5,
        maxGridLineVariation: 0.1,

        useWobblyLines: true,
        smoothingResolution: 8,
        outerMarginFactor: new Point(0.05, 0.05), // empty space around the board, fraction of total paper size
        grid: 
        {
            lines: 
            {
                width: 0.05, // fraction of CellSizeUnit
                color: "#FFFFFF",
                alpha: 0.66
            },
            linesInkfriendly: 
            {
                width: 0.025,
                color: "#333333",
                alpha: 1.0
            }
            
        },
        outerEdge: 
        {
            lineWidth: 0.02,
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
        forbiddenRecipeProb: 0.3, // you are PENALIZED for getting this recipe (with inverted score)
        
        paddingWithinRecipe: 0.025,
        paddingBetweenRecipes: 0.025,
        marginAroundRecipeBook: 0.02,

        textConfig: {
            fontFamily: "cherrybomb",
            fontScaleFactor: 0.33,
            color: "#222222",
            stroke: "#EEEEEE",
        }
    },

    tutorials: 
    {
        cornerIconSize: 0.175 // relative to CELL size (of the tutorial on which it's placed)
    },

    evaluator: 
    {
        timerRelevantCellsMinimum: 4
    },

    fixedFingers: 
    {
        handScale: 0.35, // relative to entire height of the "extra data frame"
    }
}

export default CONFIG;