import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "teamturnsConfig",
    fileName: "[Material] Teamturns",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "sledge",
        body: "chizz",
    },

    sets:
    {
        base: true,
        megaMoves: false,
        cookyClasses: false
    },

    // assets
    assetsBase: "/teamturns/assets/",
    assets:
    {
        chizz:
        {
            path: "fonts/Chizz.woff2",
        },

        chizz_italic:
        {
            key: "sourceserif",
            path: "fonts/Chizz-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        sledge:
        {
            path: "fonts/Sledge.woff2",
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