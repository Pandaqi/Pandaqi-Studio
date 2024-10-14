import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1)
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

        corners:
        {
            offset: new CVal(new Point(0.15, 0.125), "sizeUnit"),
            fontSize: new CVal(0.125, "sizeUnit"),
        },

        main:
        {
            pos: new CVal(new Point(0.5), "size"),
            posWithAction: new CVal(new Point(0.5, 0.35), "size"),
            fontSize: new CVal(0.735, "sizeUnit"),
            shadowBlur: new CVal(0.05, "cards.main.fontSize")
        },

        action:
        {
            textColor: "#221500",
            title:
            {
                pos: new CVal(new Point(0.5, 0.635), "size"),
                fontSize: new CVal(0.0475, "sizeUnit"),
            },
            text:
            {
                pos: new CVal(new Point(0.5, 0.8), "size"),
                fontSize: new CVal(0.06, "sizeUnit"),
                boxSize: new CVal(new Point(0.7, 0.25), "size")
            }
        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG