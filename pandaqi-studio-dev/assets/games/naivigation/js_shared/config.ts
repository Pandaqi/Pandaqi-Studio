import mergeObjects from "js/pq_games/tools/collections/mergeObjects"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS"
import CONFIG_NAIVIGATION_SHARED from "./configShared"

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

    sets:
    {
        instructionTokens: true,
        vehicleCards: true,
        healthCards: true,
        actionCards: false,
        GPSCards: false,
        timeCards: false,
    },

    // assets
    assetsBase: "/naivigation/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(8,2)
        },

        icons_shared:
        {
            path: "/naivigation/assets/icons.webp",
            frames: new Point(8,4),
            useAbsolutePath: true,
            loadIf: ["sets.vehicleCards", "sets.actionCards", "sets.instructionTokens"]
        },
    },

    cards:
    {
        generation:
        {
            numGPSCards: 30,
            percentageSingleGPS: 0.25, // how many only have a reward OR penalty, not both
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
            size: new CVal(new Point(0.9), "sizeUnit")
        },
    },
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED);
autoLoadFontCSS(CONFIG);

export default CONFIG