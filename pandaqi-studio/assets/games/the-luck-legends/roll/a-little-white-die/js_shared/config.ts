import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "aLittleWhiteDieConfig",
    fileName: "[Material] A Little White Die",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "rumraisin",
        body: "rumraisin"
    },

    sets:
    {
        base: true,
        wildCards: false,
        powerCards: false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/a-little-white-die/assets/",
    assets:
    {
        rumraisin:
        {
            path: "fonts/RumRaisin-Regular.woff2",
        },

        powers:
        {
            path: "powers.webp",
            frames: new Point(4,4),
            loadIf: ["sets.powerCards"]
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,2)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        numCardsPerPlayer: 6,
        itemSize: new Point(375, 525),

        startingCardsArePerfectDice: true,
        startingCardsAreRandom: false,

        keepGuessingProb: 0.735,
        minTurnsBeforeChallenge: 2,
        maxTurnsBeforeChallenge: 10
    },

    generation:
    {
        baseNumbers: new Bounds(1,6),
        baseCardsPerNumber: 6, // so you can play with 6 people at most

        wildCardsNum: 9, 

        powerCardFreqDefault: 1,
        maxPowerCards: 12,
        powerNumbers: new Bounds(7,9),
        powerCardsPerNumber: 4,
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
            alpha: 1.0
        },

        mainNumber:
        {
            fontSize: new CVal(0.5, "sizeUnit"),
            fontSizeSmall: new CVal(0.35, "sizeUnit"),
            offset: new CVal(new Point(0, 0.275), "size"),
            offsetSmall: new CVal(new Point(0,0.2), "size"),
            shadowOffset: new CVal(new Point(0,0.03), "cards.mainNumber.fontSize"),
            strokeDarken: 60,
            strokeWidth: new CVal(0.0175, "cards.mainNumber.fontSize")
        },

        numbers:
        {
            wackyBoxDims: new CVal(new Point(0.2), "sizeUnit"),
            wackyBoxDotDims: new CVal(new Point(0.15), "sizeUnit"),
            offsetFromCenter: new CVal(new Point(0.35, 0.4), "size"),
        },

        power:
        {
            offset: new CVal(new Point(0, 0.2), "size"),
            fontSize: new CVal(0.06, "sizeUnit"),
            iconDims: new CVal(new Point(0.175), "sizeUnit"),
            shadowOffset: new CVal(0.06, "cards.power.iconDims"),
            textBoxDims: new CVal(new Point(0.72), "sizeUnit"),
            textDims: new CVal(new Point(0.65, 0.4), "size")
        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG