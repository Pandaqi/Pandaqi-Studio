import Color from "js/pq_games/layout/color/color";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG = {
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    debugAllPossibleProperties: false, // @DEBUGGING (should be false)

    fileName: "[Slippery Slopes] Material",
    configKeyBaseGame: "slipperySlopesConfig",
    configKeyDigital: "slipperySlopesTrippyTouchesConfig",
    progressBar: null,
    pdfBuilder: null,

    assetsURL: "/slippery-slopes/assets/", // same for both versions, hence only one URL
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
    signalManager: null,

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

    game:
    {
        timerDuration: 60, // seconds
        scoreBounds: new Bounds(1,5),
        maxTurns: 10,
        maxSliderReplacementsPerTurn: 10,
    },

    wavyRect:
    {
        amplitude: 0.1, // relative to block height
        frequency: 3,
        stepSize: 3,

        saturation: 100,
        lightness: 64
    },

    wordCards:
    {
        num: 48, // 12 per page on regular settings
        numPerCard: 4,
        dims: { 
            small: new Point(4,5),
            regular: new Point(3,4),
            huge: new Point(2,3)
        },
        dimsElement: new Point(1, 1),
        size: new Point(),
        textScale: 0.5, // relative to block height 
    },

    sliderCards:
    {
        num: 48, // 12 per page on regular settings
        numColorSteps: 6,
        meter: 
        {
            backgroundColor: new Color().fromRGBA(255,255,255,0.8),
            extents: new Point(0.275, 0.66),
            borderRadius: 0.05, // relative to card size x
            lineWidth: 0.01, // relative to card size x
        },
        actionIconSize: 0.66, // relative to block height = height of one wavy rectangle step
        actionBGColor: "rgba(255,255,255,1.0)",
        numActionBounds: new Bounds(1,3),
        dims: { 
            small: new Point(5,4),
            regular: new Point(4,3),
            huge: new Point(3,2)
        },
        dimsElement: new Point(1,2),
        size: new Point(),

        words:
        {
            useRealWordProb: 0.33,
            stringLengthBounds: new Bounds(2,6)
        },

        shapes:
        {
            completelyRandomizeProb: 0.375,
        },

        textScale: 0.4, // relative to block height
    },

    cards: {
        textDarkenFactor: 55,
        outline: {
            color: "#111111",
            width: 0.02,
            radius: 0.1, // relative to card size x 
        },
        textConfig: new TextConfig({
            font: "Super Funtime",
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        }),
        subTextConfig: new TextConfig({
            font: "Super Funtime",
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
    }
}


export default CONFIG;