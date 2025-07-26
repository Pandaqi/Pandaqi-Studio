import Point from "lib/pq-games/tools/geometry/point"
import autoLoadFontCSS from "lib/pq-games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "boatsAtBlockbaseConfig",
    fileName: "[Material] Boats at Blockbase",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "seagardens",
        body: "chelsea",
    },

    sets:
    {
        base: true,
    },

    // assets
    assetsBase: "/boats-at-blockbase/assets/",
    assets:
    {
        chelsea:
        {
            path: "fonts/Chelsea.woff2",
        },

        seagardens:
        {
            path: "fonts/SeaGardens3DFilled-Regular.woff2",
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
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG