import Color from "js/pq_games/layout/color/color";
import TextConfig from "js/pq_games/layout/text/textConfig";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG = {
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    fileName: "[Slippery Slopes] Material",
    configKey: "slipperySlopesConfig",
    progressBar: null,
    pdfBuilder: null,
    resLoader: null,
    gridMapper: null,
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

    fonts: {
        heading: {
            key: "Super Funtime",
            url: "assets/fonts/SuperFuntime.woff2",
            crasheryCliffs: false,
        },

        // @TODO: create list of special fonts for the words sliders here
        special1: {
            key: "Lala",
            url: "assets/fonts/special/lala.woff2",
            crasheryCliffs: true
        }
    },

    assets: {
        actions: {
            path: "assets/actions.webp",
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