export default 
{
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

        useWobblyLines: true,
        smoothingResolution: 8,
        outerMarginFactor: { x: 0.05, y: 0.05 }, // empty space around the board, fraction of total paper size
        grid: {
            lines: {
                width: 0.05, // fraction of CellSizeUnit
                color: 0xFFFFFF,
                alpha: 0.66
            },
            linesInkfriendly: {
                width: 0.025,
                color: 0x333333,
                alpha: 1.0
            }
            
        },
        outerEdge: {
            lineWidth: 0.02,
            lineColor: 0x333333,
            lineAlpha: 1.0
        },
        iconScale: 0.75,
        extraFrameScale: 0.66,
        moneySpriteScale: 0.66,

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
        ingredientBoundsBaseGame: { min: 4, max: 6 },
        ingredientBoundsWithMachines: { min: 3, max: 4 },
        machineBounds: { min: 2, max: 4 },
        numPlaced: {
            machine: { min: 0.1, max: 0.3 },
            money: { min: 0.135, max: 0.215 }
        },

        moneyTypeBounds: { min: 0.25, max: 0.5 }, // what percentage of all types should be bought for MONEY
        moneyPercentagePayable: { min: 0.5, max: 0.75 }, // what percentage of TOTAL money is available as cells on the board
        maxPower: 3, // so, 0-2
        maxMoney: 7,
        maxValueForMoneyCell: 5, // should be lower than maxMoney, otherwise you can buy anything with ONE square,
        fixedFingerBounds: { min: 0.25, max: 0.5 },
        sheetData: { frameWidth: 256, frameHeight: 256 }
    },

    recipes: {
        bounds: { min: 3, max: 5 },
        recipeLength: { min: 2, max: 4 },
        maxScoreMostValuableIngredient: 5,
        forbiddenRecipeProb: 0.3, // you are PENALIZED for getting this recipe (with inverted score)
        
        paddingWithinRecipe: 0.025,
        paddingBetweenRecipes: 0.025,
        marginAroundRecipeBook: 0.02,

        textConfig: {
            fontFamily: "Cherry Bomb One",
            fontScaleFactor: 0.33,
            color: "#222222",
            stroke: "#EEEEEE",
        }
    },

    tutorials: {
        cornerIconSize: 0.175 // relative to CELL size (of the tutorial on which it's placed)
    },

    evaluator: {
        timerRelevantCellsMinimum: 4
    },

    fixedFingers: {
        handScale: 0.35, // relative to entire height of the "extra data frame"
    }
}