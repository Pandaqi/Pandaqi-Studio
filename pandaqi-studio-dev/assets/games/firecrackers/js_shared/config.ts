import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "firecrackersConfig",
    fileName: "[Material] Firecrackers",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    packs: {},

    fonts:
    {
        heading: "grace",
        body: "roboto"
    },

    // assets
    assetsBase: "/firecrackers/assets/",
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
        defNumberDistribution: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 },
        coinsPerNumber: { 0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 },
        defCoinsPerAction: 1,
        defActionPercentages: { 0: 0, 1: 0, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.5 },
        starterDeck: {
            highPlayerCountThreshold: 7,
            numColors: 3,
            numColorsHighPlayerCount: 4,
            colorFreq: 1,
            numBlack: 2,
            numBlackHighPlayerCount: 1
        }
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        dims: { 
            small: new Point(5,5),
            regular: new Point(4,4),
            large: new Point(3,3)
        },
        dimsElement: new Point(1, 1.4),
        
        shared:
        {
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG