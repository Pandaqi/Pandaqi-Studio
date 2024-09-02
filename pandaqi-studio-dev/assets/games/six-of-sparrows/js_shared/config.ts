import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "Six of Sparrows",
    fileName: "[Material] Six of Sparrows",

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
    assetsBase: "/six-of-sparrows/assets/",
    assets:
    {
        sedan:
        {
            path: "fonts/Sedan-Regular.woff2",
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
            frames: new Point(8,4)
        },
    },

    rulebook:
    {
        
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
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        regular:
        {
            numberOffset: new CVal(new Point(0.1), "sizeUnit"),
            fontSize: new CVal(0.2, "sizeUnit"),
            suitIconArrangeScalar: new CVal(new Point(0.35, 0.45), "size"),
            suitIconDims: new CVal(new Point(0.2), "sizeUnit")
        },

        bid:
        {
            icon:
            {
                pos: new CVal(new Point(0.5, 0.4), "size"),
                dims: new CVal(new Point(0.8), "sizeUnit")
            },

            score: 
            {
                fontSize: new CVal(0.1, "sizeUnit"),
                pos: new CVal(new Point(0.75, 0.15), "size")
            },

            bonus:
            {
                pos: new CVal(new Point(0.25, 0.15), "size"),
                dims: new CVal(new Point(0.1), "sizeUnit")
            },

            textBox:
            {
                pos: new CVal(new Point(0.5, 0.8), "size"),
                dims: new CVal(new Point(0.75, 0.25), "size"),
                fontSize: new CVal(0.1, "sizeUnit")
            }
        },

        token:
        {
            pos: new CVal(new Point(0.5), "size"),
            fontSize: new CVal(0.6, "sizeUnit"),
            fontColor: "#890e63",

            small:
            {
                anchor: new CVal(new Point(0.5, 0.2), "size"),
                offset: new CVal(new Point(0.25, 0), "sizeUnit"),
                fontSize: new CVal(0.1, "sizeUnit")
            }
        }

    },
}

export default CONFIG