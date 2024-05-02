import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { NUMBERS } from "./dict"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "nobleFloodConfig",
    fileName: "[Material] Noble Flood",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "romespalace",
        body: "cardo",
        special: "rechtman" // @TODO: not sure if I want/need to load this one in the end
    },

    generatePlayingCards: true,
    sets:
    {
        base: true,
        fullFlood: false,
        straightShake: false
    },

    // assets
    assetsBase: "/noble-flood/assets/",
    assets:
    {
        cardo:
        {
            path: "fonts/Cardo-Regular.woff2",
        },

        cardo_bold:
        {
            key: "cardo",
            path: "fonts/Cardo-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        cardo_italic:
        {
            key: "cardo",
            path: "fonts/Cardo-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        rechtman:
        {
            path: "fonts/RechtmanPlain.woff2",
        },

        romespalace:
        {
            path: "fonts/ROMESPALACE3.woff2",
        },

        /*
        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
        */
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,5),
        startingRowSize: 3,
        boardCanvasSize: new Point(720, 500),
        numCardsPerPlayer: 3,
        surplusContractCards: 2,
        itemSize: new Point(750, 1050),

        maxMapSize: new Point(5,5),
        drawContractProb: 0.8,

        lengthOfFlushes: 5,
        lengthOfRoyalFlush: 4,
        lengthOfStraights: 5,
        lengthOfHardStraights: 4
    },

    generation:
    {
        numSuits: 4,
        numbersUsedPerSuit: 9, //NUMBERS.length,
        defaultFrequencyContracts:
        {
            base: 1,
            straightShake: 1
        }
    },

    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },
    },
}

export default CONFIG