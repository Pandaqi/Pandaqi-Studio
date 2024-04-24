import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "sleighwellConfig",
    fileName: "[Material] Sleighwell",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    set: "baseGame", // baseGame, specialSleighs, toughTrees

    fonts:
    {
        heading: "grace",
        body: "roboto"
    },

    // assets
    assetsBase: "/sleighwell/assets/",
    assets:
    {
        grace:
        {
            path: "fonts/Good-Grace.woff2"
        },

        roboto:
        {
            path: "fonts/RobotoSlab-Regular.woff2"
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        tiles:
        {
            path: "tiles.webp",
            frames: new Point(8,1),
        },
    },

    // how generation/balancing happens
    generation:
    {
        maxComboSize: 3,

        baseGame:
        {
            numTiles: 50,
            numWildcardNumbers: 8,
            numSleighs: 2,
        },

        toughTrees:
        {
            numTiles: 8,
            numHouses: 4,
            numDoubleNumbers: 5,
            numSpecialActions: 9
        },

        reindeerWay:
        {
            numTiles: 8,
            numHouses: 3,
            numDoubleTypes: 7
        },
    },

    // how to draw/layout cards (mostly visually)
    tiles:
    {
        dims: { 
            small: new Point(5,6),
            regular: new Point(4,5),
            large: new Point(3,4)
        },
        dimsElement: new Point(1, 1),
        
        shared:
        {
            defaultBGColor: "#FFFFFF",
            glowColor: "#FFFFFF",
            glowRadius: 0.0175, // ~sizeUnit
        },

        main:
        {
            iconSize: 0.66, // ~sizeUnit

            house:
            {
                xPosLeft: 0.35, // ~sizeX
                xPosRight: 0.75, // ~sizeX
                iconSizeFactor: 0.8125, // ~original iconSize
                iconSizePresent: 0.175, // ~sizeUnit
                iconPresentEmptySpace: 0.075, // ~1.0 = total icon size

                iconSizeStar: 0.15, // ~sizeUnit
                yPosStar: 0.115, // ~sizeY
            }
        },

        numbers:
        {
            fontSize: 0.15, // ~sizeUnit
            fontSizeTiny: 0.066, // ~sizeUnit
            fontAlphaTiny: 0.75,
            offset: new Point(0.12, 0.12), // ~sizeUnit
            numberIconSizeFactor: 0.975, // ~fontSize; it looks better if images in corners (wildcard numbers) are slightly smaller
        
            stroke: "#000000",
            strokeWidth: 0.05, // ~fontSize
        },

        specialAction:
        {
            fontSize: 0.0775, // ~sizeUnit
            textDims: new Point(0.8, 0.8), // ~size
            textColor: "#111111", // should be on light present background (present_circle), so dark text
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    },

    rulebook:
    {
        boardDims: new Point(4,4),
        minBoardDim: 2,
        minNumBoardTiles: 7,
        sleighMaxDistFromCenter: 0.75,
        tileSize: 192,
        highlightColor: "#FFAAAA",
        highlightStrokeColor: "#994444",
        lineWidth: 0.035, // ~tilesize,
        moveSleighProb: 0.5
    }
}

export default CONFIG