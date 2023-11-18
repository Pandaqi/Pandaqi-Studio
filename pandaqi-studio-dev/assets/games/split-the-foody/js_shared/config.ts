import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "hastyAccusationsConfig",
    fileName: "[Material] Hasty Accusations",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    cardSet: "base", // base, advanced, expert
    
    fonts:
    {
        heading: "primitive",
        body: "rosarivo"
    },

    // assets
    assetsBase: "/split-the-foody/assets/",
    assets:
    {
        primitive:
        {
            path: "fonts/Primitive.woff2"
        },

        rosarivo:
        {
            path: "fonts/Rosarivo-Regular.woff2"
        },

        base:
        {
            path: "base.webp",
            frames: new Point(8,2)
        },

        appetite:
        {
            path: "appetite.webp",
            frames: new Point(8,2)
        },

        coins:
        {
            path: "coins.webp",
            frames: new Point(8,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    // how generation/balancing happens
    generation:
    {
       
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        dims: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
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