import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
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

    configKey: "naivigationBootOpStoomConfig",
    fileName: "[Materiaal] Boot op Stoom",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "freebie",
        body: "crimson",
    },

    sets:
    {
        base: true,
        krappeKalender: false,
        prachtigePakjes: false,
        pepernootPlekken: false,
        rebelsePietjes: false
    },

    // assets
    assetsBase: "/naivigation/wind-up-at/boot-op-stoom/assets/",
    assets:
    {
        crimson:
        {
            path: "fonts/CrimsonText-Regular.woff2",
        },

        crimson_italic:
        {
            key: "crimson",
            path: "fonts/CrimsonText-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        crimson_bold:
        {
            key: "crimson",
            path: "fonts/CrimsonText-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        crimson_bold_italic:
        {
            key: "crimson",
            path: "fonts/CrimsonText-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        freebie:
        {
            path: "fonts/FreebieRegular.woff2",
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
        pakjes:
        {
            defaultFrequency: 3,
            usagePercentageOnTiles: 0.775,
        },

        varen:
        {
            defaultFrequency: 3
        },

        stoomboot:
        {
            defaultFrequency: 3
        },

        rebelsePietjes:
        {
            number: 4 // 2 per tile = 8 total
        },

        kalenderKaarten:
        {
            defaultFrequency: 1
        }
    },

    cards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.CARD
        },
    },

    tiles:
    {
        drawerConfig:
        {
            preset: GridSizePreset.TILE
        },
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG