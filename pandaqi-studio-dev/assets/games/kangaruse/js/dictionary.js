import Point from "js/pq_games/tools/geometry/point";

const CONFIG = {
    mainFont: "Mail Ray Stuff",
    bodyFont: "Poppins",
    maxNumPlayers: 6,
    maxNumPlayersForScoreSheets: 4,

    inkFriendly: false,
    sideBarType: "rules", // "no", "rules" or "score"
    boardSize: "regular", // tiny, small, regular, large, huge
    expansions: {
        collector: false
    },

    sideBar: {
        gap: 0.05, // gap between board and sidebar, relative to WIDTH of entire page
        percentageOfBoardWidth: 0.25,
        scoreSheetRatio: (977/729.0),
        scoreSheetTexture: "score_sheet",
        tutorialSpriteHeight: 0.066, // relative to HEIGHT of sidebar
        tutorialTextConfig: { 
            fontFamily: 'Poppins',
            fontScaleFactor: 0.047,
            color: '#000000',
        } 
    },

    board: {
        randomizeAxes: true, // numbers are given to columns 50% of the time, to rows the other 50%

        cellDisplay: {
            icon: {
                corner: "center center",
                scale: 0.8
            },

            space: {
                corner: "bottom center",
                scale: 0.33
            },

            text: {
                corner: "center center",
                scale: 0.4
            },

            cornerMargin: 0.1, // relative to cell size
            color: 0xFFFFFF,
            alpha: 1.0,
            widthStroke: 0.05, // relative to cell size
            colorStroke: 0x000000,
            alphaStroke: 1.0
        },

        dimsPerSize: {
            tiny: { x: 6, y: 5 },
            small: { x: 8, y: 6 },
            regular: { x: 12, y: 8 },
            large: { x: 14, y: 10 },
            huge: { x: 16, y: 12 }
        },

        holes: {
            enable: true,
            percentageOfBoard: 0.125,
            sizeBounds: { min: 1, max: 4 }
        },
        rivers: {
            enable: true,
            percentageBounds: { min: 0.125, max: 0.2 },
            sizeBounds: { min: 0.2, max: 0.5 }, // relative to longest side of grid
            lineWidth: 0.1, // relative to cell size
            color: 0x0000FF,
            alpha: 1.0  
        },
        numbers: {
            axis: "column",
            bounds: { min: 1, max: 4 },
            offsetFromGrid: 0.25,
            scaleFactor: 0.33,
            textConfig: { 
                fontFamily: 'Mail Ray Stuff',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 10
            } 
        },
        dirs: {
            options: ["right", "down", "left", "up"],
            offsetFromGrid: 0.25,
            scaleFactor: 0.33
        },
        outerMarginFactor: { x: 0.08, y: 0.08 }, // empty space around the board, fraction of total paper size
        grid: {
            lineWidth: 0.05, // fraction of CellSizeUnit
            lineColor: 0xFFFFFF,
            lineAlpha: 0.66
        },
    },

    types: {
        sheetData: { frameWidth: 256, frameHeight: 256 },
        iconScale: 0.8,
        numUniqueTypes: { min: 5, max: 7 },
        scoreBounds: { min: 30, max: 50 },
        textScaleFactor: 0.35,
        textConfig: { 
            fontFamily: 'Mail Ray Stuff',
            fontScaleFactor: 0.35,
            strokeScaleFactor: 0.1,
            color: '#ffffff',
            stroke: '#000000',
        } 
    }
}

// This is an easy reminder/link what every frame stands for in the general spritesheet
const GENERAL = {
    "dir": { frame: 0 },
    "writingSpace": { frame: 1 },
    "tutorialIcon": { frame: 2 }
}

const CELLS = {
    "tree": { frame: 0, desc: "Can't jump on or over it.", unpickable: true },
    "starting_position": { frame: 1, desc: "A player must start here.", unpickable: true, minAbs: CONFIG.maxNumPlayers, maxAbs: (CONFIG.maxNumPlayers + 1) },
    "score": { frame: 2, desc: "Scores the number of points shown.", minRel: 0.2, maxRel: 0.33, score: true },
    "kangaroo": { frame: 3, desc: "Immediately jump again." },
    "crocodile": { frame: 4, desc: "While here, nobody can score from squares in the same row or column." },
    "echidna": { frame: 5, desc: "You can only visit if its number is higher than the previous one you visited (of this type)." },
    "tasmanian_devil": { frame: 6, desc: "Destroy all (unused) adjacent squares." },
    "thorny_devil": { frame: 7, desc: "If this is your only valid jump, you're out of the game." },
    "tasmanian_tiger": { frame: 8, desc: "Destroy two (unused) squares in the same row or column." },
    "koala": { frame: 9, desc: "You can't jump OVER or NEXT TO other players." },
    "platypus": { frame: 10, desc: "You may jump with any direction or number, and may jump over trees." },
    "sugar_glider": { frame: 11, desc: "If you jump on a used square, continue in that direction until you land on an unused square." },
    "dingo": { frame: 12, desc: "While here, ALL players must obey BOTH commands of this cell (if possible)." },
    "mistletoebird": { frame: 13, desc: "Your jump may wrap around the board." },
    "kiwi": { frame: 14, desc: "Nobody can jump OVER or NEXT TO you." },
    "quoll": { frame: 15, desc: "While here, NO other player may pick the direction or number from this cell." },
    "moth": { frame: 16, desc: "Fits multiple kangaroos.", maxAbs: 5, multiPosition: true }, 

    // These are all expansion parts
    "numbat": { frame: 17, desc: "If you CAN jump to a score square, you MUST do so.", expansion: "collector" },
    "cacketoo": { frame: 18, desc: "You CAN'T jump towards a score square.", expansion: "collector" },
    "frog": { frame: 19, desc: "You may jump to any other (unused) frog.", expansion: "collector", minAbs: 3 },
    "water": { frame: 20, desc: "Each food is worth as many points as how much water you have.", expansion: "collector", requiredTypes: ["food"], score: true },
    "shelter": { frame: 21, desc: "Those with the least shelter at the end get -10 points. Those with the most shelter get +10 points.", expansion: "collector", score: true },
    "food": { frame: 22, desc: "Each food is worth as many points as how much water you have.", expansion: "collector", requiredTypes: ["water"], score: true },
    "toys": { frame: 23, desc: "Every set of 3 toys is worth 5 points. (Incomplete sets at the end are worth 0.)", expansion: "collector", score: true },
    "gems": { frame: 24, desc: "Worth 1, 1, 3, 5, 8, 12, 16, 22, 30 points (depending on how many you have)", expansion: "collector", score: true },
    "coins": { frame: 25, desc: "Each coin is worth +1 if you have the most coins at the end, otherwise -1.", expansion: "collector", score: true },
    "chests": { frame: 26, desc: "Worth +5 points, but rare.", expansion: "collector", maxAbs: 4, score: true }
}

const TUTORIALS = {

}

const NB_OFFSETS = {
    "right": new Point().setXY(1,0),
    "left": new Point().setXY(-1,0),
    "bottom": new Point().setXY(0,1),
    "top": new Point().setXY(0,-1)
}

const CORNER_OFFSETS = {
    "bottom right": new Point().setXY(1,1),
    "bottom center": new Point().setXY(0,1),
    "bottom left": new Point().setXY(-1,1),
    "center left": new Point().setXY(-1,0),
    "center center": new Point().setXY(0,0),
    "center right": new Point().setXY(1,0),
    "top left": new Point().setXY(-1,-1),
    "top center": new Point().setXY(0,-1),
    "top right": new Point().setXY(1,-1),
};

export {
    CONFIG,
    GENERAL,
    CELLS,
    TUTORIALS,
    NB_OFFSETS,
    CORNER_OFFSETS
}