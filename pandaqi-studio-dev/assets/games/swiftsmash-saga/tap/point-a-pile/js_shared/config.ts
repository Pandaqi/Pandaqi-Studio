import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
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

    configKey: "pointAPileConfig",
    fileName: "[Material] Point-a-Pile",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "auntbertha",
        body: "amaranth",
    },

    sets:
    {
        base: true,
        completeAMission: false,
        dontATouchme: false
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/point-a-pile/assets/",
    assets:
    {
        amaranth:
        {
            path: "fonts/Amaranth-Regular.woff2",
        },

        amaranth_italic:
        {
            key: "amaranth",
            path: "fonts/Amaranth-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        amaranth_bold:
        {
            key: "amaranth",
            path: "fonts/Amaranth-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        amaranth_italic_bold:
        {
            key: "amaranth",
            path: "fonts/Amaranth-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        auntbertha:
        {
            path: "fonts/AuntBertha.woff2",
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