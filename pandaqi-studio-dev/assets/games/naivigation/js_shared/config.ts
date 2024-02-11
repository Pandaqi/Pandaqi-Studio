import ColorSet from "js/pq_games/layout/color/colorSet"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import CONFIG_NAIVIGATION_SHARED from "./configShared"
import mergeObjects from "js/pq_games/tools/collections/mergeObjects"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
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
    includeActionCards: false,
    includeGPSCards: false,
    includeTimeDeck: false,

    // assets
    assetsBase: "/naivigation/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(2,1)
        },
    },

    cards:
    {
        generation:
        {
            numGPSCards: 30,
            numFuelCards: 10,
        },
    
        instruction:
        {
            fontSize: new CVal(0.235, "sizeUnit"),
            textPos: new CVal(new Point(0.2275, 0.25), "sizeUnit"),
            strokeWidth: new CVal(0.025, "sizeUnit"),
        },

        compass:
        {
            dims: new CVal(new Point(0.9), "sizeUnit")
        },

        // @DEBUGGING/testing
        fontSize: new CVal(0.05, "sizeUnit"),
        textBox: new CVal(new Point(0.1, 0.1), "size"),
        backgroundColor: new CVal(new ColorSet("#FFAAAA", "#FFFFFF"), "inkFriendly")
    },
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED);

export default CONFIG