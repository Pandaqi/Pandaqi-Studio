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
            lineWidth: 0.05, // fraction of CellSizeUnit
            lineColor: 0xFFFFFF,
            lineAlpha: 0.66
        },
        outerEdge: {
            lineWidth: 0.05,
            lineColor: 0x000000,
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
        ingredientBounds: { min: 3, max: 6 },
        machineBounds: { min: 2, max: 4 },
        moneyTypeBounds: { min: 0.33, max: 0.66 }, // what percentage of all types should be bought for MONEY
        moneyTargetBounds: { min: 0.5, max: 0.75 },
        maxPower: 3, // 0-3
        maxMoney: 7,
        maxValueForMoneyCell: 4, // should be lower than maxMoney, otherwise you can buy anything with ONE square,
        maxMoneyDrawProb: 3, // at the highest possible need, this is the probability of adding a money square
        fixedFingerBounds: { min: 0.1, max: 0.33 },
        sheetData: { frameWidth: 256, frameHeight: 256 }
    },

    recipes: {
        bounds: { min: 3, max: 5 },
        recipeLength: { min: 2, max: 4 },
        maxScoreMostValuableIngredient: 5,
        forbiddenRecipeProb: 0.3 // you are PENALIZED for getting this recipe (with inverted score)
    }
}