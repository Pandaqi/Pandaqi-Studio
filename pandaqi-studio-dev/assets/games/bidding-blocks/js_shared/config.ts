import Point from "js/pq_games/tools/geometry/point"

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
    },

    rulebook:
    {
        
    },

    generation:
    {

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
    },
}

export default CONFIG