import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)
    debugSingleCard: true, // @DEBUGGING (should be false)
    debugOnlyGenerate: true, // @DEBUGGING (should be false)

    configKey: "sleighwellConfig",
    fileName: "[Material] Sleighwell",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
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
            path: "fonts/Good-Grace.otf"
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
            numTiles: 8
        },

        specialSleighs:
        {

        }
    },

    // how to draw/layout cards (mostly visually)
    tiles:
    {
        dims: { 
            small: new Point(5,6),
            regular: new Point(4,5),
            huge: new Point(3,4)
        },
        dimsElement: new Point(1, 1),
        
        shared:
        {
            defaultBGColor: "#FFFFFF",
            glowColor: "#FFFFFF",
            glowRadius: 0.1, // ~sizeUnit
        },

        main:
        {
            iconSize: 0.66, // ~sizeUnit

            house:
            {
                xPosLeft: 0.33, // ~sizeX
                xPosRight: 0.33, // ~sizeX
                iconSizePresent: 0.35, // ~sizeUnit

                iconSizeStar: 0.2, // ~sizeUnit
                yPosStar: 0.15, // ~sizeY
            }
        },

        numbers:
        {
            fontSize: 0.1, // ~sizeUnit
            fontSizeTiny: 0.05, // ~sizeUnit
            fontAlphaTiny: 0.66,
            offset: new Point(0.1, 0.1) // ~sizeUnit
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG