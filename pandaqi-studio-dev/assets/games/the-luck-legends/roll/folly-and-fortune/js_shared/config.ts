import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "follyAndFortuneConfig",
    fileName: "[Material] Folly & Fortune",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "antique",
        body: "goodfish"
    },

    sets:
    {
        base: true,
        superPowers: false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/folly-and-fortune/assets/",
    assets:
    {
        goodfish:
        {
            path: "fonts/Goodfish-Regular.woff2",
        },

        goodfish_italic:
        {
            key: "goodfish",
            path: "fonts/Goodfish-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        goodfish_bold:
        {
            key: "goodfish",
            path: "fonts/Goodfish-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        antique:
        {
            path: "fonts/AntiqueNo14-Regular.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(1,1)
        },

        actions:
        {
            path: "actions.webp",
            frames: new Point(8,5)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2)
        },
    },

    rulebook:
    {

    },

    generation:
    {
        baseCardsNum: 50,
        baseNumbersPossible: [1,2,3,4,5,6], // 0 is not included in base game---too harsh/stagnant---but is in expansions

        superCardsNum: 25,
        superNumbersPossible: [-1,0,1,3,5,6,7],

        defHealth: 2,
        numHealthPerNumber:
        {
            "-1": 6,
            0: 6,
            1: 5,
            2: 4,
            3: 3,
            4: 3,
            5: 2,
            6: 1,
            7: 0
        },
        numHealthRandomness: new Bounds(-1,1),
        numHealthReductionUnseen: -2,
        numHealthMin: 1,
        numHealthMax: 6,
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        shared:
        {
            shadowOffset: new CVal(new Point(0, 0.01), "sizeUnit")
        },

        bg:
        {
            alpha: 0.1
        },

        numbers:
        {
            boxOffset: new CVal(new Point(0.16, 0.1725), "sizeUnit"),
            boxDims: new CVal(new Point(0.325), "sizeUnit"),
            fontSize: new CVal(0.175, "sizeUnit"),
            strokeWidth: new CVal(0.05, "cards.numbers.fontSize"),
            textInBoxOffset: new CVal(new Point(0.03), "sizeUnit")
        },

        mainNumber:
        {
            fontSize: new CVal(0.6, "sizeUnit"),
            strokeWidth: new CVal(0.04, "cards.mainNumber.fontSize"),
            pos: new CVal(new Point(0.5, 0.35), "size"),
            addWrittenVersion: true,
            written:
            {
                linePos: new CVal(new Point(0.5, 0.125), "size"),
                lineDims: new CVal(new Point(0.2), "sizeUnit"),
                lineAlpha: 0.5,
                fontSize: new CVal(0.058, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.09), "size")
            }
        },

        power:
        {
            textPos: new CVal(new Point(0.5, 0.77), "size"),
            fontSize: new CVal(0.0575, "sizeUnit"),
            textDims: new CVal(new Point(0.7, 0.33), "size"),
            textBoxDims: new CVal(new Point(1.0), "sizeUnit"),

            iconOffset: new CVal(new Point(0.1, 0.2975), "size"),
            iconDims: new CVal(new Point(0.125), "sizeUnit"),
            iconAlpha: 0.825,

            shieldPos: new CVal(new Point(0.9, 0.5), "size"),
            unseenPos: new CVal(new Point(0.1, 0.5), "size")
        },

        arrow:
        {
            dims: new CVal(new Point(0.1), "sizeUnit"), // probably just the same as power.iconDims
            composite: "overlay",
            alpha: 0.5
        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG