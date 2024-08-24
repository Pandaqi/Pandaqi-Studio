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

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
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
    },
}

export default CONFIG