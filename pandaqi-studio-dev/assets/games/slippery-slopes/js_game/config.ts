import Color from "js/pq_games/layout/color/color";
import TextConfig from "js/pq_games/layout/text/textConfig";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const assetsURL = "/slippery-slopes/assets/"
const CONFIG = {
    debugWithoutPDF: false, // @DEBUGGING (should be false)

    asGame: false,
    fileName: "[Slippery Slopes] Material",
    configKey: "slipperySlopesConfig",
    progressBar: null,
    pdfBuilder: null,

    assetsURL: "/slippery-slopes/assets/",
    resLoader: null,
    gridMapper: null,
    pandaqiWords: null,
    cardSize: "regular",

    inkFriendly: false,
    generateWords: false,
    generateSliders: false,
    expansions:
    {
        glidyGifts: true,
        crasheryCliffs: false,
    },

    actionSpritesheetKey: "actions",
    numSpecialFonts: 10,
    maxWordLength: 11,

    fonts: {
        special0: {
            key: "Super Funtime",
            url: "fonts/SuperFuntime.woff2",
            crasheryCliffs: false,
        },

        // @TODO: create list of special fonts for the words sliders here (8 of them)
        // slab serif, old-timey
        special1: {
            key: "Abril Fatface",
            url: "fonts/special/AbrilFatface-Regular.woff2",
            crasheryCliffs: true
        },

        // sans-serif
        special2: {
            key: "Advent Pro",
            url: "fonts/special/AdventPro-Bold.woff2",
            crasheryCliffs: true
        },

        // serif, book
        special3: {
            key: "Alegreya",
            url: "fonts/special/Alegreya-Italic.woff2",
            crasheryCliffs: true
        },

        // handwritten, small-caps
        special4: {
            key: "Amatic",
            url: "fonts/special/AmaticSC-Regular.woff2",
            crasheryCliffs: true
        },

        // grunge, chaotic
        special5: {
            key: "AnuDaw",
            url: "fonts/special/AnuDawItalic.woff2",
            crasheryCliffs: true
        },

        // cursive, curly, handwritten
        special6: {
            key: "BlackJack",
            url: "fonts/special/BlackJack.woff2",
            crasheryCliffs: true
        },

        // blackletter, medieval, fantasy
        special7: {
            key: "Chomsky",
            url: "fonts/special/Chomsky.woff2",
            crasheryCliffs: true
        },

        // monotype, typewriter
        special8: {
            key: "Courier",
            url: "fonts/special/CourierNewPS-ItalicMT.woff2",
            crasheryCliffs: true
        },

        // display, cursive, thick, swooshy
        special9: {
            key: "Pacifico",
            url: "fonts/special/Pacifico-Regular.woff2",
            crasheryCliffs: true
        }
    },

    assets: {
        actions: {
            path: "actions.webp",
            frames: new Point(8, 1)
        },
    },

    wordCards:
    {
        num: 36,
        numPerCard: 4,
        dims: { 
            small: new Point(4,5),
            regular: new Point(3,4),
            huge: new Point(2,3)
        },
        dimsElement: new Point(1, 1),
        size: new Point()
    },

    sliderCards:
    {
        num: 36,
        numColorSteps: 6,
        meterBackgroundColor: new Color(1,1,1,0.8),
        actionIconSize: 0.75, // relative to block height = height of one wavy rectangle step
        numActionBounds: new Bounds(1,3),
        dims: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
        },
        dimsElement: new Point(1,2),
        size: new Point(),

        words:
        {
            useRealWordProb: 0.33,
            stringLengthBounds: new Bounds(1,4)
        },

        shapes:
        {
            completelyRandomizeProb: 0.25,
        }
    },

    cards: {
        textDarkenFactor: 50,
        outline: {
            color: "#111111",
            width: 0.05,
        },
        textScale: 0.8, // relative to block height 
        textConfig: new TextConfig({
            font: "Super Funtime"
        })
    }
}


export default CONFIG;