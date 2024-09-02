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
            path: "fonts/Vadamecum-Regular.woff2",
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
            dims: new CVal(new Point(0.8), "sizeUnit"),
        },

        fitsOnTop:
        {
            pos: new CVal(new Point(0.5, 0.15), "size"),
            dims: new CVal(new Point(0.25), "sizeUnit")
        },

        numbers:
        {
            fontSize: new CVal(0.2, "sizeUnit"),
            offset: new CVal(new Point(0.1), "sizeUnit")
        },

        suitIcons:
        {
            offset: new CVal(new Point(0.2, 0.15), "sizeUnit"), // should fit perfectly in this background circles
            dims: new CVal(new Point(0.1), "sizeUnit")
        }
    },
}

export default CONFIG