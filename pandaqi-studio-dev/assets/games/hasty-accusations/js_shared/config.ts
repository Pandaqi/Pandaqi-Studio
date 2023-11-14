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
        heading: "puss",
        body: "catcafe"
    },

    // assets
    assetsBase: "/nine-lives/assets/",
    assets:
    {
        puss:
        {
            path: "fonts/puss.woff2"
        },

        catcafe:
        {
            path: "fonts/catcafe.woff2"
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(10,1)
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