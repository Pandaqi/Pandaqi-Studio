import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                label: "Base Game",
                default: true
            },

            biddingCards:
            {
                type: SettingType.CHECK,
                label: "Bidding Cards"
            },

            expansion:
            {
                type: SettingType.CHECK,
                label: "Expansion"
            }
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "sixOfSparrowsConfig",
    fileName: "Six of Sparrows",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "sancreek",
        body: "sedan",
    },

    sets:
    {
        base: true,
        biddingCards: true,
        expansion: false,
    },

    // assets
    assetsBase: "/chiptales/bet/six-of-sparrows/assets/",
    assets:
    {
        sedan:
        {
            path: "fonts/Sedan-Regular.woff2",
        },

        sedan_italic:
        {
            key: "sedan",
            path: "fonts/Sedan-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        sancreek:
        {
            path: "fonts/Sancreek-Regular.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(4,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        bid_icons:
        {
            path: "bid_icons.webp",
            frames: new Point(8,4),
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,4),
        numCardsPerPlayer: 6,
        itemSize: new Point(375, 525),
        bidProb: 0.45,
    },

    generation:
    {
        numberBounds: new Bounds(1,10),
        maxNumHandCards: 6,
        numBidTokensExpansion: 6
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            sizeElement: new Point(1, 1.4),
            size: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        regular:
        {
            numberOffset: new CVal(new Point(0.085, 0.125), "sizeUnit"),
            fontSize: new CVal(0.185, "sizeUnit"),
            suitIconArrangeScalar: new CVal(new Point(0.21, 0.35), "size"),
            suitIconDims: new CVal(new Point(0.2), "sizeUnit"),
            doubleDigitsScaleDown: 0.775
        },

        overlay:
        {
            alpha: 0.5
        },

        bid:
        {
            icon:
            {
                pos: new CVal(new Point(0.5, 0.415), "size"),
                size: new CVal(new Point(0.69), "sizeUnit")
            },

            score: 
            {
                fontSize: new CVal(0.08, "sizeUnit"),
                pos: new CVal(new Point(0.81, 0.115), "size")
            },

            bonus:
            {
                pos: new CVal(new Point(0.22, 0.115), "size"),
                size: new CVal(new Point(0.2), "sizeUnit")
            },

            textBox:
            {
                pos: new CVal(new Point(0.5, 0.8), "size"),
                size: new CVal(new Point(0.875, 0.25), "size"),
                fontSize: new CVal(0.069, "sizeUnit")
            }
        },

        token:
        {
            pos: new CVal(new Point(0.5), "size"),
            fontSize: new CVal(0.6, "sizeUnit"),
            fontColor: "#890e63",

            small:
            {
                anchor: new CVal(new Point(0.5, 0.115), "size"),
                offset: new CVal(new Point(0.35, 0), "sizeUnit"),
                fontSize: new CVal(0.08, "sizeUnit")
            }
        }

    },
}

export default CONFIG