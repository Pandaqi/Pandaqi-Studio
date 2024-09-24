import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "smackshapesConfig",
    fileName: "[Material] Smackshapes",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "mousememoirs",
        body: "manuscript",
    },

    sets:
    {
        base: true,
        colorCracks: false,
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/smackshapes/assets/",
    assets:
    {
        manuscript:
        {
            path: "fonts/MANUSCRIPTRegular.woff2",
        },

        mousememoirs:
        {
            path: "fonts/MouseMemoirs-Regular.woff2",
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
        numberSpecial: [3,6,9]
    },

    cards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.CARD
        },
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG