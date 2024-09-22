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

    configKey: "booksmackConfig",
    fileName: "[Material] Booksmack",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "abril",
        body: "andika",
    },

    sets:
    {
        base: true,
        powerPunctuation: false,
        niftyNumbers: false,
        gigglingGlyphs: false,
        cursedCritics: false
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/booksmack/assets/",
    assets:
    {
        /*
        whackadoo:
        {
            path: "fonts/Whackadoo.woff2",
        },

        whackadoo_italic:
        {
            key: "whackadoo",
            path: "fonts/WhackadooUpper-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        whackadoo_bold:
        {
            key: "whackadoo",
            path: "fonts/WhackadooUpper.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },
        */
        
        andika:
        {
            path: "fonts/Andika.woff2",
        },

        andika_italic:
        {
            key: "whackadoo",
            path: "fonts/Andika-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        andika_bold:
        {
            key: "whackadoo",
            path: "fonts/Andika-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        andika_bold_italic:
        {
            key: "whackadoo",
            path: "fonts/Andika-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        abril:
        {
            path: "fonts/AbrilFatface-Regular.woff2",
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