import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point"
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
        symbolsPerSet:
        {
            base: "ACDEILNOPRSTUabcdefghijklmnopqrstuvwxyz", // the rarest letters don't get an uppercase; all of them = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            powerPunctuation: "?!.",
            niftyNumbers: [2, 5, 8, 10, 12, 15, 18, 20, 25], // don't want to overcrowd the deck with numbers + "weird" numbers are just really hard to calculate while playing
            gigglingGlyphs: "+- &*@~#",
            cursedCritics: "áàâåéèêíîïôøöüúùñçč"
        }
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