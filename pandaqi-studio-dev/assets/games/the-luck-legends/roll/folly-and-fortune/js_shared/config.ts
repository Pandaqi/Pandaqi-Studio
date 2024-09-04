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

        numbers:
        {
            offset: new CVal(new Point(0.1), "sizeUnit"),
            fontSize: new CVal(0.3, "sizeUnit"),
            centerPos: new CVal(new Point(0.5), "size"),
            centerDims: new CVal(new Point(0.4), "sizeUnit"),
            writtenPos: new CVal(new Point(0.5, 0.7), "size"),
            writtenFontSize: new CVal(0.15, "sizeUnit"),
        },

        power:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.75), "size"),
            textBoxDims: new CVal(new Point(0.66, 0.175), "size"),
            textColor: "#101010"
        },

        icons:
        {
            offset: new CVal(new Point(0.1, 0.3), "size"),
            dims: new CVal(new Point(0.1), "size")
        }
    },
}

export default CONFIG