import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

export const CONFIG:any = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Base Game"
            },

            wackyNumbers:
            {
                type: SettingType.CHECK,
                label: "Wacky Numbers",
                remark: "Introduces cards with special actions."
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "championsOfChanceConfig",
    fileName: "Champions of Chance",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "luckiest",
        body: "nunito"
    },

    sets:
    {
        base: true,
        wackyNumbers : false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/champions-of-chance/assets/",
    assets:
    {
        nunito:
        {
            path: "fonts/NunitoSans10pt-Regular.woff2",
        },

        nunito_italic:
        {
            key: "nunito",
            path: "fonts/NunitoSans10pt-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        nunito_bold:
        {
            key: "nunito",
            path: "fonts/NunitoSans10pt-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        luckiest:
        {
            path: "fonts/LuckiestGuy-Regular.woff2",
            loadIf: ["sets.expansion"]
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(4,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        numCardsPerPlayer: 6,
        itemSize: new Point(750, 1050)
    },

    generation:
    {
        minNum: 1,
        maxNum: 6,
        numCardsPerNumber: 6,

        numIconsMin: 2,
        numIconsMax: 4,
        numIconsRandomness: new Bounds(-1.5, 1.5),
        numIconsPerNumber:
        {
            1: 2,
            2: 3,
            3: 4,
            4: 4,
            5: 3,
            6: 2
        },

        numCardsWacky: 18,
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

        bg:
        {
            alpha: 0.15,
        },

        numbers:
        {
            offset: new CVal(new Point(0.1, 0.13), "sizeUnit"),
            fontSize: new CVal(0.225, "sizeUnit"),
            centerPos: new CVal(new Point(0.5), "size"),
            centerDims: new CVal(new Point(0.4), "sizeUnit"),
            writtenPos: new CVal(new Point(0.5, 0.68), "size"),
            writtenFontSize: new CVal(0.12, "sizeUnit"),
        },

        power:
        {
            fontSize: new CVal(0.05075, "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.815), "size"),
            textBoxDims: new CVal(new Point(0.475, 0.175), "size"),
            textColor: "#101010"
        },

        icons:
        {
            offset: new CVal(new Point(0.1, 0.195), "size"),
            size: new CVal(new Point(0.1), "sizeUnit")
        }
    },
}