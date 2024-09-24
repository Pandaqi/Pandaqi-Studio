import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";
import { CardDisplayType, ColorType } from "./dict";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "racesmackConfig",
    fileName: "[Material] Racesmack",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "amsterdam",
        body: "whackadoo",
    },

    sets:
    {
        base: true,
        shiftingGears: false,
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/racesmack/assets/",
    assets:
    {
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
        
        amsterdam:
        {
            path: "fonts/NewAmsterdam-Regular.woff2",
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
        numSymbolsDist:
        {
            1: 0.1, // "this percentage of cards has 1 symbol"
            2: 0.2,
            3: 0.3,
            4: 0.2,
            5: 0.1,
            6: 0.1
        },

        numCardsPerSet:
        {
            base: 36,
            shiftingGears: 18,
        },

        numRulesCardsPerSet:
        {
            base: 18,
            shiftingGears: 0
        },

        colorDist:
        {
            [ColorType.RED]: 0.25,
            [ColorType.GREEN]: 0.25,
            [ColorType.BLUE]: 0.25,
            [ColorType.PURPLE]: 0.25
        },

        displayTypesPerSet:
        {
            base: [CardDisplayType.SYMBOLS],
            shiftingGears: Object.values(CardDisplayType)
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