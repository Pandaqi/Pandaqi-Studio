import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { SUITS } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "deceptidiceConfig",
    fileName: "[Material] Deceptidice",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "brasspounder",
        body: "caslon"
    },

    sets:
    {
        base: true,
        wildCards: false,
        powerCards: false
    },

    // assets
    assetsBase: "/the-luck-legends/roll/deceptidice/assets/",
    assets:
    {
        caslon:
        {
            path: "fonts/CaslonAntique-Regular.woff2",
        },

        caslon_italic:
        {
            key: "caslon",
            path: "fonts/CaslonAntique-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        caslon_bold:
        {
            key: "caslon",
            path: "fonts/CaslonAntique-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        brasspounder:
        {
            path: "fonts/Brasspounder.woff2", // @TODO: or use SC variant?
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(3,1)
        },

        bids:
        {
            path: "bids.webp",
            frames: new Point(4,3)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        numCardsPerPlayer: 9,
        itemSize: new Point(375, 525),

        numDicePerPlayer:
        {
            2: 4,
            3: 4,
            4: 3,
            5: 3,
            6: 3,
        },

        keepGuessingProb: 0.66,
        minTurnsBeforeChallenge: 2,
        maxTurnsBeforeChallenge: 10,

        cardsLeftForLoss: 3, // if you have this many cards left (or fewer), you lose the game
    },

    generation:
    {
        numSuits: Object.keys(SUITS).length,
        baseCardsPerSuit: new Bounds(1,6),
        baseCopiesPerSuit: 2,
        wildCardsNum: 7,
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
            outlineAlpha: 0.4,
        },

        wildcard:
        {
            tint: "#787878",
            drawAllSuits: true,
        },

        numbers:
        {
            offset: new CVal(new Point(0.13, 0.14), "sizeUnit"),
            boxDims: new CVal(new Point(0.2), "sizeUnit"),
            suitDims: new CVal(new Point(0.15), "sizeUnit"),
            fontSize: new CVal(0.15, "sizeUnit")
        },

        mainNumber:
        {
            circleDims: new CVal(new Point(0.5), "sizeUnit"), // this is only the inner circle, not the numbers
            circleRadius: new CVal(0.341, "sizeUnit"), // this is the numbers
            fontSize: new CVal(0.275, "sizeUnit"),
            shadowOffset: new CVal(new Point(0, 0.033), "cards.mainNumber.fontSize")
        },

        bids:
        {
            bgColor: "#787878",
            tintColor: "#ffffff",

            headingOffset: new CVal(new Point(0.575, 0.1), "size"),
            fontSizeHeading: new CVal(0.1, "sizeUnit"),
            headingDims: new CVal(new Point(1.0, 0.1), "size"),
            iconPos: new CVal(new Point(0.5, 0.375), "size"),
            iconDims: new CVal(new Point(0.475), "sizeUnit"),
            fontSize: new CVal(0.0785, "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.7), "size"),
            textDims: new CVal(new Point(0.8, 0.4), "size")
        },

        overlay:
        {
            alpha: 0.2
        }
    },
}

export default CONFIG