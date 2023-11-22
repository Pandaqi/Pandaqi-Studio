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
    includeCards: true,
    includeCharacters: true,
    cardSet: "base", // base, advanced, expert
    
    fonts:
    {
        heading: "canoe",
        body: "caslon"
    },

    // assets
    assetsBase: "/hasty-accusations/assets/",
    assets:
    {
        canoe:
        {
            path: "fonts/DraggingCanoeRegular.woff2"
        },

        caslon:
        {
            path: "fonts/LibreCaslonText-Regular.woff2"
        },

        base:
        {
            path: "base.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        advanced:
        {
            path: "advanced.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        expert:
        {
            path: "expert.webp",
            frames: new Point(8,2),
            cardSet: true
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