import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

export default {
    mainFont: "Mail Ray Stuff",
    bodyFont: "Poppins",
    maxNumPlayers: 5,

    minScoreTypes: 2,
    maxScoreTypes: 3,

    inkFriendly: false,
    startingPositions: false,
    sideBarType: "rules", // "no", "rules" or "score"
    boardSize: "regular", // tiny, small, regular, large, huge
    simplifiedIcons: false,

    negativeScoreBounds: new Bounds(0.05, 0.2), // relative to total number of score cells
    allowNegativePoints: true,

    cellTexture: "cell_types", // changed to inkfriendly version if needed

    sideBar: {
        backgroundColor: 0xFFCCAA,
        borderRadius: 0.03, // relative to WIDTH of sidebar
        padding: 0.025, // relative to WIDTH of sidebar

        gap: 0.05, // gap between board and sidebar, relative to WIDTH of entire page
        percentageOfBoardWidth: 0.3,
        scoreSheetRatio: (977/729.0),
        scoreSheetTexture: "score_sheet",
        tutorialSpriteHeight: 0.066, // relative to HEIGHT of sidebar
        tutorialTextConfig: { 
            fontFamily: 'Poppins',
            fontScaleFactor: 0.047,
            color: '#000000',
        },

        scoreTextAlpha: 0.35,
        scoreTextConfig: { 
            fontFamily: 'Mail Ray Stuff',
            fontSize: null,
            fontScaleFactor: 0.05, // relative to WIDTH of sidebar
            color: '#000000',
        } 
    },

    board: {
        backgroundColor: 0x461F09,
        padding: 0.0, // relative to shortest axis of full paper size
        randomizeAxes: true, // numbers are given to columns 50% of the time, to rows the other 50%

        cellDisplay: {
            icon: {
                corner: "center center",
                scale: 0.8
            },

            space: {
                corner: "bottom center",
                scale: 0.385
            },

            text: {
                corner: "center center",
                scale: 0.4
            },

            stroke: {
                width: 0.035, // relative to cell size
                color: 0xEEEEEE,
                alpha: 0.05
            },

            strokeInkfriendly: {
                width: 0.035, // relative to cell size
                color: 0x333333,
                alpha: 0.66
            },

            maxOffsetBG: 0.0, // 0.075, // relative to cell size
            scaleBG: 0.95, // 1.0 for doing nothing
            borderRadius: 0.1, // relative to cell size

            cornerMargin: 0.1, // relative to cell size
            color: 0xFFFFFF,
            alpha: 1.0,
            
        },

        dimsPerSize: {
            tiny: new Point(6, 5),
            small: new Point(8, 6),
            regular: new Point(12, 8),
            large: new Point(14, 10),
            huge: new Point(16, 12)
        },

        holes: {
            enable: true,
            percentageOfBoard: 0.0866,
            sizeBounds: new Bounds(1, 4)
        },
        rivers: {
            enable: true,
            percentageBounds: new Bounds(0.125, 0.2),
            sizeBounds: new Bounds(0.2, 0.5), // relative to longest side of grid
            lineWidth: 0.1, // relative to cell size
            color: 0xBBAAFF,
            colorInkfriendly: 0x2211FF,
            alpha: 1.0  
        },
        numbers: {
            axis: "column",
            bounds: new Bounds(1, 4),
            offsetFromGrid: 0.25,
            scaleFactor: 0.375,
            textConfig: { 
                fontFamily: 'Mail Ray Stuff',
                fontSize: '16px',
                color: '#332211',
                stroke: '#FFDDBB',
                strokeThickness: 10
            } 
        },
        dirs: {
            options: ["right", "down", "left", "up"],
            offsetFromGrid: 0.275,
            scaleFactor: 0.4
        },
        outerMarginFactor: new Point(0.08, 0.08), // empty space around the board, fraction of total paper size
        grid: {
            lineWidth: 0.05, // fraction of CellSizeUnit
            lineColor: 0xFFFFFF,
            lineAlpha: 0.66
        },
    },

    types: {
        sheetData: { frameWidth: 256, frameHeight: 256 },
        iconScale: 0.8,
        numUniqueTypes: new Bounds(5, 7),
        scoreBounds: new Bounds(30, 50), // when the regular "score cell" is added, how high should the summed score numbers be from all those cells?
        textScaleFactor: 0.35,
        textConfig: { 
            fontFamily: 'Mail Ray Stuff',
            fontScaleFactor: 0.35,
            strokeScaleFactor: 0.1,
            color: '#ffffff',
            stroke: '#000000',
        } 
    },

    evaluator: {
        minDistBetweenStartingPositions: 3,
        minScoreCellsPerQuadrant: 2,
        maxScoreDifferencePerQuadrant: 5,
        maxHoleClumpSize: 5,
        maxRiverCells: 0.166 // percentage of total # cells
    }
}