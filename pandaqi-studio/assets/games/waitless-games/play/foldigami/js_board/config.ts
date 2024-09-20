import Point from "js/pq_games/tools/geometry/point";

const CONFIG =
{
    typeDict: {}, // to be filled by type sustem; ugly method, saw no better way when converting to TypeScript
    difficulty: "easy",
    includeRules: true,
    inkFriendly: false,
    noRotation: false,
    resLoader: null,

    configKey: "foldigamiConfig",
    assetsBase: "/waitless-games/play/foldigami/assets/",
    assets:
    {
        jockey:
        {
            path: "fonts/JockeyOne-Regular.woff2"
        },

        types: 
        {
            path: "types.webp",
            frames: new Point(8,2),
        },

        tutorial:
        {
            path: "tutorial.webp",
            frames: new Point(8,3)
        },

        teams:
        {
            path: "teams.webp",
            frames: new Point(4,1)
        },

        scroll_grayscale:
        {
            path: "scroll_grayscale.webp"
        }
    },

    teams: 
    {
        num: 2,
        maxStartingScoreDifference: 3,
        textureKey: "teams",
        iconScale: 0.4, // both relative to iconSize = spriteSize of cell
        iconOffset: 0.4,
    },

    evaluator: 
    {
        debug: false, // @DEBUGGING (should be false)
        forbidNegativeScores: true,
        font: {
            size: 0.1,
            color: "#333333",
            strokeColor: "#999999",
            strokeThickness: 0.02,
            margin: 0.05
        }
    },

    types: 
    {
        debug: [], // @DEBUGGING (should be empty)
        setTemplate: ["required", "score", "rotation"],
        textureKey: "types",
        emptyKey: "empty",
        maxSetSize: { min: 4, max: 5 },
        generalMaxPerType: 7,
        generalMaxPerTeam: 7,
        maxPerDifficulty: {
            easy: 3,
            medium: 4,
            hard: 5
        }
    },

    board: 
    {
        position: "center",
        modifyEdgeCells: true,
        addHalfLines: true,
        dims: new Point(7, 5),
        percentageEmpty: {
            easy: { min: 0.2, max: 0.3 }, // relative to total number of cells
            medium: { min: 0.125, max: 0.2 },
            hard: { min: 0.05, max: 0.125 }
        },
        outerMargin: { x: 0.05, y: 0.05 }, // relative to total page size
        iconScale: 0.9,
        tutScale: 0.9,
        grid: {
            colorNeutral: "#CCFFCC",
            colorModifyPercentage: 10,
            colorBackgroundAlpha: 1.0,
            lineWidth: 0.015, // relative to cell size
            lineColor: "#333333",
            halfLineWidth: 0.015*0.5, // relative to cell size; just half lineWidth
            halfLineColor: "#333333",
            halfLineAlpha: 0.5,
        },
        outline: {
            width: 0.03, // relative to cell size
            color: "#333333"
        },
        font: {
            family: "jockey",
            size: 0.3, // relative to cell size
            color: '#000000',
            strokeColor: "#FFFFFF",
            strokeWidth: 0.05, // relative to cell size
        }
    },

    tutorial: 
    {
        textureKey: "tutorial",
        insideCells: true,
        outerMargin: { x: 0.05, y: 0.05 },
        texts: {
            heading: "How to Play?"
        }
    }
}

export default CONFIG