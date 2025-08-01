import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator"
import Point from "js/pq_games/tools/geometry/point"

export const CONFIG:any = 
{
    _settings:
    {
        addText:
        {
            type: SettingType.CHECK,
            label: "Add Text",
            default: true,
            remark: "Adds text that explains what a tile does on the tile itself."
        },

        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Base Game"
            },

            pawns:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Pawns"
            },

            passports:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Animal Passports",
            },

            zooperative:
            {
                type: SettingType.CHECK,
                label: "Zooperative",
                remark: "Allows playing the game cooperatively."
            },

            strong:
            {
                type: SettingType.CHECK,
                label: "Strong Species",
            },

            wildlife:
            {
                type: SettingType.CHECK,
                label: "Wildlife Wishes",
            },

            utilities:
            {
                type: SettingType.CHECK,
                label: "Unnatural Utilities",
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "zooParqueConfig",
    fileName: "Zoo Parque",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addText: true,

    fonts:
    {
        heading: "ceviche",
        body: "noticia",
    },

    sets:
    {
        pawns: true,
        base: true,
        passports: true,
        zooperative: false,
        strong: false,
        wildlife: false,
        utilities: false,
    },

    // assets
    assetsBase: "/the-domino-diaries/place/zoo-parque/assets/",
    assets:
    {
        noticia:
        {
            path: "fonts/NoticiaText-Regular.woff2",
        },

        noticia_bold:
        {
            key: "noticia",
            path: "fonts/NoticiaText-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        noticia_italic:
        {
            key: "noticia",
            path: "fonts/NoticiaText-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        noticia_bold_italic:
        {
            key: "noticia",
            path: "fonts/NoticiaText-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        ceviche:
        {
            path: "fonts/CevicheOne-Regular.woff2",
        },

        pawns:
        {
            path: "pawns.webp",
            frames: new Point(6,1),
            loadIf: ["sets.pawns"],
        },

        animals:
        {
            path: "animals.webp",
            frames: new Point(4,4),
        },

        terrains:
        {
            path: "terrains.webp",
            frames: new Point(6,1),
        },

        objects:
        {
            path: "objects.webp",
            frames: new Point(4,2),
        },

        stalls:
        {
            path: "stalls.webp",
            frames: new Point(4,2),
        },

        animal_passport:
        {
            path: "animal_passport.webp",
            loadIf: ["sets.passports"]
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1),
        },

        campaign_templates:
        {
            path: "campaign_templates.webp",
            frames: new Point(3,1),
            loadIf: ["sets.zooperative"]
        }

    },

    rulebook:
    {

    },

    generation:
    {
        numUniquePawns: 6,
        numPawnsPerPlayer: 4,
        numDominoes:
        {
            base: 56,
            strong: 36,
            wildlife: 36,
            utilities: 36
        },

        percAllWithoutTerrain: 0.175,
        percHalfWithoutTerrain: 0.2,
        percAllWithTerrain: 0.625,

        fenceNumDistribution:
        {
            0: 0.1,
            1: 0.35,
            2: 0.325,
            3: 0.175,
            4: 0.0
        },

        fenceTypeDistribution:
        {
            fence_weak: 0.6,
            fence_strong: 0.4
        },

        zooperative:
        {
            ruleProbability: 0.33,
            cardsPerLevel:
            {
                1: 6,
                2: 6,
                3: 6,
                4: 5,
                5: 5,
                6: 5,
                7: 5,
                8: 5
            }
        }
    },

    dominoes:
    {
        drawerConfig:
        {
            preset: GridSizePreset.DOMINO
        },

        bg:
        {
            color: "#FFEFCF",
            sizeTerrain: new CVal(new Point(0.9), "sizeUnit"),
            terrainShadowSize: new CVal(0.01, "sizeUnit"),
        },

        main:
        {
            size: new CVal(new Point(0.66), "sizeUnit"),
            shadowSize: new CVal(0.02, "sizeUnit"),
        },

        fences:
        {
            size: new CVal(new Point(0.88), "sizeUnit")
        },

        entrance:
        {
            size: new CVal(new Point(0.8), "sizeUnit")
        },

        text:
        {
            fontSize: new CVal(0.05825, "sizeUnit")
        },

        setText:
        {
            fontSize: new CVal(0.065, "sizeUnit")
        },

        campaign:
        {
            textBoxSize: new CVal(new Point(0.9, 0.4), "size"),
            fontSize: new CVal(0.07, "sizeUnit"),
            posMission: new CVal(new Point(0.5, 0.5), "size"),
            posRule: new CVal(new Point(0.5, 0.86), "size"),

            score:
            {
                pos: new CVal(new Point(0.48, 0.09), "size"),
                fontSize: new CVal(0.3, "sizeUnit"),
            },

            expansions:
            {
                pos: new CVal(new Point(0.8, 0.0915), "size"),
                fontSize: new CVal(0.045, "sizeUnit"),
                alpha: 0.75
            }
        }
    },

    tiles:
    {
        drawerConfig:
        {
            sizeElement: new Point(2, 1),
            size: { 
                small: new Point(2,5),
                regular: new Point(1,4),
                large: new Point(1,2)
            },  
            autoStroke: true
        },

        animal:
        {
            pos: new CVal(new Point(0.22, 0.5), "size"),
            size: new CVal(new Point(0.435), "sizeUnit")
        },

        extinct:
        {
            pos: new CVal(new Point(0.275, 0.325), "size"),
            size: new CVal(new Point(0.2), "sizeUnit")
        },

        funFact:
        {
            pos: new CVal(new Point(0.225, 0.815), "size"),
            size: new CVal(new Point(0.225, 0.45), "size"),
            fontSize: new CVal(0.033, "sizeUnit")
        },

        terrains:
        {
            posAnchor: new CVal(new Point(0.615, 0.38), "size"),
            size: new CVal(new Point(0.1225), "sizeUnit"),
            shadowBlur: new CVal(0.005, "sizeUnit")
        },

        food:
        {
            pos: new CVal(new Point(0.815, 0.2875), "size"),
            size: new CVal(new Point(0.4, 0.2), "sizeUnit"),
            fontSize: new CVal(0.0475, "sizeUnit")
        },

        power:
        {
            pos: new CVal(new Point(0.51, 0.735), "size"),
            size: new CVal(new Point(0.285, 0.3), "size"),
            fontSize: new CVal(0.033, "sizeUnit")
        },

        // these are all the specific positions of the checkmarks, hardcoded for speed and simplicity
        checkmarks:
        {
            size: new CVal(new Point(0.075), "sizeUnit"),
            strong: new CVal(new Point(0.4415, 0.2875 - 0.025), "size"),
            herbivore: new CVal(new Point(0.4415, 0.51), "size"),
            carnivore: new CVal(new Point(0.65, 0.51), "size"),
            social: new CVal(new Point(0.4415, 0.615), "size"),
            solitary: new CVal(new Point(0.65, 0.615), "size"),
        }
    },
}