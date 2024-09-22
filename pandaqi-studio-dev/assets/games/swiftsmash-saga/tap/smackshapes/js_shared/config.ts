import Point from "js/pq_games/tools/geometry/point";
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