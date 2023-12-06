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
            frames: new Point(4,1)
        },

        types:
        {
            path: "types.webp",
            frames: new Point(9,2),
        },

        types_bg:
        {
            path: "types_bg.webp",
            frames: new Point(4,1),
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
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },
            
        }, 
        
        shared:
        {
            glowRadius: 0.015,
            glowColor: "#FFFFFFCC",
            colorDarkInkFriendly: "#FFFFFF",
            colorLightInkFriendly: "#111111",
            colorMidInkFriendly: "#BCBCBC"
        },

        illustration:
        {
            yPos: 0.5, // ~sizeY
            yPosAction: 0.33,
            scale: 0.775, // ~sizeUnit
            actionScaleDown: 0.75,
            bgAlpha: 0.1,
            bgScale: 1.66,
            bgComposite: "luminosity",
            blackFrames: [0,11,12,13,14,15,16,17]
        },

        coins:
        {
            yPos: 0.925,
            scale: 0.125, // ~sizeUnit
            displayDownScale: 0.875,
            rectDims: new Point(0.46, 0.1),
            rectDimsOffset: 0.8,
            rectDimsAction: new Point(0.7, 0.1), // ~size, X should match innerRectDownScale too
            rectDimsOffsetAction: 0.9,

            shadowBlur: 0.01, // ~coinSize
            shadowOffset: new Point(0.0), // ~coinSize
            shadowColor: "#000000FF",

            fontSize: 0.0395, // ~sizeUnit
            textColor: "#FDFDFD",
            textAlpha: 1.0,
            textRectDarken: 30,
        },

        title:
        {
            yPos: 0.575, // ~sizeY
            fontSize: 0.06, // ~sizeUnit
            rectDims: new Point(0.925, 1.16), // X should generally match innerRectDownScale right?
        },

        action:
        {
            yPos: 0.74, // ~sizeY
            fontSize: 0.0735, // ~sizeUnit
            textDims: new Point(0.8, 0.35), // ~size
            innerRectDownScale: 0.925, 
            strokeWidth: 0.02, // ~fontSize

            titleGlowRadius: 0.1, // ~fontSize
            titleGlowColor: "#FFFFFF88"
        },

        corners:
        {
            edgeOffsetBig: new Point(0.15), // ~sizeUnit
            edgeOffsetSmall: new Point(0.08), // ~sizeUnit
            starScaleBig: 0.125, // ~sizeUnit
            starScaleSmall: 0.06, // ~sizeUnit
            fontSizeBig: 0.15, // ~sizeUnit
            fontSizeSmall: 0.055, // ~sizeUnit
            strokeWidth: 0.075, // ~fontSize
            moveSmallStarsToTitle: false
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG