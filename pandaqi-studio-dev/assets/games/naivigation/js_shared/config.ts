import ColorSet from "js/pq_games/layout/color/colorSet"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationConfig",
    fileName: "[Material] Naivigation (Shared)",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    includeInstructionTokens: true,
    includeVehicleCards: true,
    includeHealthCards: true,
    includeActionTokens: false,
    includeGPSCards: false,
    includeTimeDeck: false,
    includeFuelDeck: false,
    
    fonts:
    {
        heading: "boblox",
        body: "caveman"
    },

    // assets
    assetsBase: "/naivigation/assets/",
    assets:
    {
        /*boblox:
        {
            path: "fonts/BobloxClassic.woff2"
        },

        caveman:
        {
            path: "fonts/Caveman.woff2"
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },
        */
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

        generation:
        {
            numGPSCards: 30,
            numFuelCards: 10,
        },

        fontSize: new CVal(0.05, "sizeUnit"),
        textBox: new CVal(new Point(0.1, 0.1), "size"),
        backgroundColor: new CVal(new ColorSet("#FFAAAA", "#FFFFFF"), "inkFriendly")
    },

    tokens:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                // @TODO: figure out nice dimensions
                small: new Point(4,4),
                regular: new Point(6,6),
                large: new Point(8,8)
            },
        }, 
    }
}

export default CONFIG