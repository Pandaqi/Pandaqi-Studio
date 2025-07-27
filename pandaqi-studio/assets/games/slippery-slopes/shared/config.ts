import Color from "js/pq_games/layout/color/color";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    debugAllPossibleProperties: false, // @DEBUGGING (should be false)

    configKey: "slipperySlopesConfig",
    fileName: "[Slippery Slopes] Material",
    configKeyDigital: "slipperySlopesTrippyTouchesConfig", // @TODO: properly select this one when using digital

    fonts:
    {
        heading: "superfuntime",
        body: "superfuntime",
    },

    assetsBase: "/slippery-slopes/assets/", // same for both versions, hence only one URL
    assets:
    {
        special0: 
        {
            key: "superfuntime",
            path: "fonts/SuperFuntime.woff2",
        },

        actions: 
        {
            path: "actions.webp",
            frames: new Point(8, 1)
        },

        // slab serif, old-timey
        special1: 
        {
            key: "abril",
            path: "fonts/special/AbrilFatface-Regular.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // sans-serif
        special2: 
        {
            key: "adventpro",
            path: "fonts/special/AdventPro-Bold.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // serif, book
        special3: 
        {
            key: "alegreya",
            path: "fonts/special/Alegreya-Italic.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // handwritten, small-caps
        special4: 
        {
            key: "amatic",
            path: "fonts/special/AmaticSC-Regular.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // grunge, chaotic
        special5: 
        {
            key: "anudaw",
            path: "fonts/special/AnuDawItalic.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // cursive, curly, handwritten
        special6: 
        {
            key: "blackJack",
            path: "fonts/special/BlackJack.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // blackletter, medieval, fantasy
        special7: 
        {
            key: "chomsky",
            path: "fonts/special/Chomsky.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // monotype, typewriter
        special8: 
        {
            key: "courier",
            path: "fonts/special/CourierNewPS-ItalicMT.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        },

        // display, cursive, thick, swooshy
        special9: 
        {
            key: "pacifico",
            path: "fonts/special/Pacifico-Regular.woff2",
            loadIf: ["expansions.crasheryCliffs"],
        }
    },

    pandaqiWords: null,

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
        drawerConfig:
        {
            preset: GridSizePreset.TILE
        },

        num: 48, // 12 per page on regular settings
        numPerCard: 4,
        textScale: 0.5, // relative to block height 
    },

    sliderCards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.DOMINO
        },

        interactiveBaseSize: new Point(450, 900),

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

    cards: 
    {
        textDarkenFactor: 55,
        outline: 
        {
            color: "#111111",
            width: 0.02,
            radius: 0.1, // relative to card size x 
        },

        textConfig: new TextConfig({
            font: "superfuntime",
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        }),

        subTextConfig: new TextConfig({
            font: "superfuntime",
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
    }
}


export default CONFIG;