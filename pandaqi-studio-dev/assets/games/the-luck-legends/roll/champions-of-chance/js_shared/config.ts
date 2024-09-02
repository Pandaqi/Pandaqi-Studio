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

    configKey: "championsOfChanceConfig",
    fileName: "[Material] Champions of Chance",

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

    },

    generation:
    {
        minNum: 1,
        maxNum: 6,
        numCardsPerNumber: 6,

        numIconsMin: 1,
        numIconsMax: 4,
        numIconsRandomness: new Bounds(-1.5, 1.5),
        numIconsPerNumber:
        {
            1: 1,
            2: 2,
            3: 4,
            4: 4,
            5: 3,
            6: 1
        },

        numCardsWacky: 15,
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