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
    },
}

export default CONFIG