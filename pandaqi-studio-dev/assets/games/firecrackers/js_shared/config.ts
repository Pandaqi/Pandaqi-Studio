import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "firecrackersConfig",
    fileName: "[Material] Firecrackers",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    packs: {},

    fonts:
    {
        heading: "fourth",
        body: "neuton"
    },

    // assets
    assetsBase: "/firecrackers/assets/",
    assets:
    {
        fourth:
        {
            path: "fonts/2Peas4thofJuly.woff2"
        },

        neuton:
        {
            path: "fonts/Neuton-Regular.woff2"
        },

        neuton_bold:
        {
            key: "neuton",
            path: "fonts/Neuton-ExtraBold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        types:
        {
            path: "types.webp",
            frames: new Point(8,2),
        },

        types_bg:
        {
            path: "types_bg.webp",
            frames: new Point(8,2),
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
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(5,5),
                regular: new Point(4,4),
                large: new Point(3,3)
            },
            
        }, 
        
        shared:
        {
        },

        illustration:
        {
            yPos: 0.33, // ~sizeY
            scale: 0.66, // ~sizeUnit
            bgAlpha: 0.2,
            bgComposite: "luminosity",
            blackFrames: [0,11,12,13,14,15]
        },

        title:
        {
            yPos: 0.55, // ~sizeY
            fontSize: 0.15, // ~sizeUnit
        },

        action:
        {
            yPos: 0.7, // ~sizeY
            fontSize: 0.05, // ~sizeUnit
            textDims: new Point(0.8, 0.35), // ~size
        },

        corners:
        {
            edgeOffsetBig: new Point(0.05, 0.05), // ~sizeUnit
            edgeOffsetSmall: new Point(0.05, 0.05), // ~sizeUnit
            starScaleBig: 0.15, // ~sizeUnit
            starScaleSmall: 0.05, // ~sizeUnit
            fontSizeBig: 0.1, // ~sizeUnit
            fontSizeSmall: 0.05, // ~sizeUnit
            strokeWidth: 0.025, // ~fontSize
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG