import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "nobleFloodConfig",
    fileName: "[Material] Noble Flood",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "romespalace",
        body: "cardo",
        special: "rechtman" // @TODO: not sure if I want/need to load this one in the end
    },

    generatePlayingCards: true,
    generateContracts: true,

    sets:
    {
        base: true,
        fullFlood: false,
        straightShake: false
    },

    // assets
    assetsBase: "/noble-flood/assets/",
    assets:
    {
        cardo:
        {
            path: "fonts/Cardo-Regular.woff2",
        },

        cardo_bold:
        {
            key: "cardo",
            path: "fonts/Cardo-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        cardo_italic:
        {
            key: "cardo",
            path: "fonts/Cardo-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        rechtman:
        {
            path: "fonts/RechtmanPlain.woff2",
        },

        romespalace:
        {
            path: "fonts/ROMESPALACE3.woff2",
        },

        suits:
        {
            path: "suits.webp",
            frames: new Point(4,1)
        },

        custom_illustrations:
        {
            path: "custom_illustrations.webp",
            frames: new Point(8,2)
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(3,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(11,1)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,4), // for SIMULATION it's probably better to do = new Bounds(3,6),
        startingRowSize: 3,
        boardCanvasSize: new Point(1440, 1000),
        numCardsPerPlayer: 3,
        surplusContractCardsMultiplier: 2,
        itemSize: new Point(750, 1050),

        maxMapSize: new Point(5,5),
        drawContractProb: 0.8,

        lengthOfFlushes: 5,
        lengthOfRoyalFlush: 3,
        lengthOfStraights: 5,
        lengthOfHardStraights: 4,
        lengthOfAdjacentStraightFlushes: 3,

        validMoves:
        {
            ifAnySuitMatch: false,
            ifAllSuitsMatch: true,
            ifDistToNumberAtMost: 0,
            allowPickingWildcard: true,
        }
    },

    generation:
    {
        numSuits: 4,
        numbersUsedPerSuit: 10, //NUMBERS.length,
        defaultFrequencyContracts:
        {
            base: 1,
            straightShake: 1
        }
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },

        shared:
        {
            bannerDims: new CVal(new Point(0.475), "sizeUnit"),
            bannerFontSize: new CVal(0.065, "sizeUnit"),
        },

        suitNumber:
        {
            offsetFromEdge: new CVal(new Point(0.085, 0.0925), "sizeUnit"),
            fontSize: new CVal(0.125, "sizeUnit"),
            iconDims: new CVal(new Point(0.125), "sizeUnit"),

            iconDimsCenter: new CVal(new Point(0.25), "sizeUnit"),
            iconDimsCenterSingle: new CVal(new Point(0.66), "sizeUnit"),
            iconArrangeScalar: new CVal(new Point(0.185,0.275), "size"),

            iconShadow:
            {
                enabled: false,
                offset: new CVal(new Point(0, 0.025), "sizeUnit"),
                color: "#00000099",
                blur: new CVal(0.005, "sizeUnit")
            },
        },

        action:
        {
            textBoxPos: new CVal(new Point(0.5), "size"),
            textBoxDims: new CVal(new Point(0.8, 0.375), "size"),
            fontSize: new CVal(0.0745, "sizeUnit")
        },

        contract:
        {
            rectBlur: new CVal(0.01, "sizeUnit"),
            rectAlpha: 0.75,
            fontSize: new CVal(0.071, "sizeUnit"),
            textBoxPos: new CVal(new Point(0.5, 0.8), "size"),
            textBoxDims: new CVal(new Point(0.9, 0.3), "size"),
            textBoxPosAlt: new CVal(new Point(0.5, 0.66), "size"),
            textBoxDimsAlt: new CVal(new Point(0.9, 0.25), "size"),

            illustration:
            {
                pos: new CVal(new Point(0.5, 0.38), "size"),
                dims: new CVal(new Point(0.875), "sizeUnit"),
            },

            rule:
            {
                scaleFactor: 0.675,
                textBoxPos: new CVal(new Point(0.5, 0.885), "size"),
                textBoxDims: new CVal(new Point(0.875, 0.15), "size")
            },

            score:
            {
                offset: new CVal(new Point(0.165, 0.18), "sizeUnit"),
                fontSize: new CVal(0.125, "sizeUnit"),
                textColor:
                {
                    good: "#F4FFDB",
                    bad: "#FCBFBF"
                }
            }
        },

        contractDraw:
        {
            itemSize: new Point(1024),
            itemSizeUnit: 1024,
            card: 
            {
                itemSizeUnit: 750,
                itemSize: new Point(750, 1050),
                strokeWidth: new CVal(0.066, "cards.contractDraw.card.itemSizeUnit"),

                suitPos: new CVal(new Point(0.5, 0.725), "cards.contractDraw.card.itemSize"),
                suitDims: new CVal(new Point(0.45), "cards.contractDraw.card.itemSizeUnit"),

                fontSize: new CVal(0.5, "cards.contractDraw.card.itemSizeUnit"),
                numberPos: new CVal(new Point(0.5, 0.275), "cards.contractDraw.card.itemSize"),
                numberDims: new CVal(new Point(0.5), "cards.contractDraw.card.itemSizeUnit"),

                iconDims:
                {
                    betweenCard: 0.45,
                    overSet: 0.7,
                }
            },

            iconDims:
            {
                union: new CVal(new Point(0.166), "cards.contractDraw.itemSize"),
            },

            shadow:
            {
                enabled: true,
                offset: new CVal(new Point(0, 0.025), "cards.contractDraw.itemSizeUnit"),
                color: "#00000099",
                blur: new CVal(0.005, "cards.contractDraw.itemSizeUnit")
            },
        }
    },
}

export default CONFIG