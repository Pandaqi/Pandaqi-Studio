import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
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
            shadowOffset: new CVal(0.05, "sizeUnit")
        },

        numbers:
        {
            boxOffset: new CVal(new Point(0.1), "sizeUnit"),
            boxDims: new CVal(new Point(0.15), "sizeUnit"),
            fontSize: new CVal(0.15, "sizeUnit"),
            strokeWidth: new CVal(0.05, "cards.numbers.strokeWidth"),
        },

        mainNumber:
        {
            fontSize: new CVal(0.33, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.4), "size"),
            addWrittenVersion: true,
            written:
            {
                linePos: new CVal(new Point(0.5, 0.125), "size"),
                lineDims: new CVal(new Point(0.3), "sizeUnit"),
                lineAlpha: 0.66,
                fontSize: new CVal(0.075, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.1), "size")
            }
        },

        power:
        {
            fontSize: new CVal(0.075, "sizeUnit"),
            textDims: new CVal(new Point(0.8, 0.2), "size"),
            textBoxDims: new CVal(new Point(0.9), "size"),

            iconOffset: new CVal(new Point(0.1, 0.3), "size"),
            iconDims: new CVal(new Point(0.1), "sizeUnit"),
            iconAlpha: 0.75,

            shieldPos: new CVal(new Point(0.9, 0.5), "size"),
            unseenPos: new CVal(new Point(0.1, 0.5), "size")
        },

        arrow:
        {
            dims: new CVal(new Point(0.1), "sizeUnit"), // probably just the same as power.iconDims
            composite: "overlay",
            alpha: 1.0
        }
    },
}

export default CONFIG