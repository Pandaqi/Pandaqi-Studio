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

    configKey: "biddingBlocksConfig",
    fileName: "[Material] Bidding Blocks",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "vadamecum",
        body: "josefin",
    },

    sets:
    {
        base: true
    },

    // assets
    assetsBase: "/bidding-blocks/assets/",
    assets:
    {
        josefin:
        {
            path: "fonts/JosefinSlab-Regular.woff2",
        },

        vadamecum:
        {
            path: "fonts/Vademecum-Regular.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(4,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,5),
        numCardsPerPlayer: 8,
        itemSize: new Point(375, 525),

        bidNumWinsBounds: new Bounds(1,4),
        bidHandSizeBounds: new Bounds(3,8),

        simulTurnProb: 0.35,
        dontGiveUpProb: 0.875,
        minTurnsPerChallenge: 2,
        maxTurnsPerChallenge: 8,
    },

    generation:
    {
        numberBounds: new Bounds(1,10),
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        main:
        {
            pos: new CVal(new Point(0.5), "size"),
            dims: new CVal(new Point(0.92), "sizeUnit"),
        },

        fitsOnTop:
        {
            pos: new CVal(new Point(0.5, 0.115), "size"),
            dims: new CVal(new Point(0.235), "sizeUnit")
        },

        numbers:
        {
            fontSize: new CVal(0.175, "sizeUnit"),
            offset: new CVal(new Point(0.1, 0.135), "sizeUnit"),
            doubleDigitsScaleDown: 0.775,
        },

        suitIcons:
        {
            offset: new CVal(new Point(0.27, 0.17), "sizeUnit"), // should fit perfectly in this background circles
            dims: new CVal(new Point(0.0775), "sizeUnit")
        }
    },
}

export default CONFIG