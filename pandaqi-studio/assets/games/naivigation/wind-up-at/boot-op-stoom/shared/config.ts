import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point"
;

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(9,1)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(6,2)
        },

        pakje_cards:
        {
            path: "pakje_cards.webp",
            frames: new Point(6,1)
        },

        stoom_cards:
        {
            path: "stoom_cards.webp",
            frames: new Point(4,2)
        },

        vaar_cards:
        {
            path: "vaar_cards.webp",
            frames: new Point(4,2)
        },

        kalender_cards:
        {
            path: "kalender_cards.webp",
            frames: new Point(4,3),
            loadIf: ["sets.krappeKalender"]
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
            coveragePercentageOnTiles: 0.85,
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
            number: 2 // 2 per tile = 4 total
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

        shared:
        {
            icon:
            {
                pos: new CVal(new Point(0.5, 0.3), "size"),
                size: new CVal(new Point(0.7), "sizeUnit")
            },

            text:
            {
                fontSize: new CVal(0.08, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.825), "size"),
                boxSize: new CVal(new Point(0.85, 0.275), "size")
            }
        },

        stoom:
        {
            iconPos: new CVal(new Point(0.135, 0.365), "size"),
            iconSize: new CVal(new Point(0.225), "sizeUnit"),
            composite: "source-over", // might be "luminosity" too?
        },

        kalender:
        {
            icon:
            {
                pos: new CVal(new Point(0.5, 0.225), "size"),
                size: new CVal(new Point(0.5), "sizeUnit")
            },

            label:
            {
                fontSize: new CVal(0.085, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.505), "size"),
                boxSize: new CVal(new Point(0.75, 0.225), "size")
            },

            text:
            {
                fontSize: new CVal(0.085, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.7875), "size"),
                boxSize: new CVal(new Point(0.85, 0.45), "size")
            }
        }
    },

    tiles:
    {
        drawerConfig:
        {
            preset: GridSizePreset.TILE
        },

        giftsWanted:
        {
            pos: new CVal(new Point(0.5, 0.66), "size"),
            size: new CVal(new Point(0.285), "sizeUnit")
        }
    },
}


export default CONFIG