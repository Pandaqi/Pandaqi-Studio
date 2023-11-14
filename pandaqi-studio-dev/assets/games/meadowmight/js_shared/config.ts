import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "meadowMightConfig",
    fileName: "[Material] Meadowmight",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    
    expansions:
    {
        wolf: false
    },
    
    fonts:
    {
        heading: "puss",
        body: "catcafe"
    },

    // assets
    assetsBase: "/meadowmight/assets/",
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
            small: new Point(6,5),
            regular: new Point(5,4),
            huge: new Point(4,3)
        },
        dimsElement: new Point(1, 1),
        
        shared:
        {
            
        },

        outline:
        {
            size: 0.025, // ~sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG