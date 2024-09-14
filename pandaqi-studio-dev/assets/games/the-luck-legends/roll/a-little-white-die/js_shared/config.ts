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
            frames: new Point(4,4)
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
        powerNumbers: new Bounds(7,9),
        powerCardsPerNumber: 6,
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

        bg:
        {
            alpha: 0.1
        },

        mainNumber:
        {
            fontSize: new CVal(new Point(0.2), "sizeUnit"),
            offset: new CVal(new Point(0, 0.33), "size"),
            shadowOffset: new CVal(0.1, "cards.mainNumber.fontSize"),
            strokeDarken: 50,
            strokeWidth: new CVal(0.1, "cards.mainNumber.fontSize")
        },

        numbers:
        {
            wackyBoxDims: new CVal(new Point(0.2), "sizeUnit"),
            offsetFromCenter: new CVal(new Point(0.3, 0.3), "size")
        },

        power:
        {
            iconDims: new CVal(new Point(0.2), "sizeUnit"),
            shadowOffset: new CVal(0.1, "cards.power.iconDims"),
            textBoxDims: new CVal(new Point(0.7), "sizeUnit"),
            textDims: new CVal(new Point(0.65, 0.4), "size")
        }
    },
}

export default CONFIG