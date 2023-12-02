import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "hastyAccusationsConfig",
    fileName: "[Material] Hasty Accusations",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    includeCards: true,
    includeCharacters: true,
    cardSet: "base", // base, advanced, expert

    expansions:
    {
        traitor: false
    },
    
    fonts:
    {
        heading: "canoe",
        body: "caslon"
    },

    // assets
    assetsBase: "/hasty-accusations/assets/",
    assets:
    {
        canoe:
        {
            path: "fonts/DraggingCanoeRegular.woff2"
        },

        caslon:
        {
            path: "fonts/LibreCaslonText-Regular.woff2",
            cardsOnly: true
        },

        caslon_bold:
        {
            key: "caslon",
            path: "fonts/LibreCaslonText-Bold.woff2",
            textConfig: new TextConfig({
                weight: TextWeight.BOLD
            }),
            cardsOnly: true
        },

        base:
        {
            path: "base.webp",
            frames: new Point(8,2),
            cardSet: true,
            cardsOnly: true
        },

        advanced:
        {
            path: "advanced.webp",
            frames: new Point(8,2),
            cardSet: true,
            cardsOnly: true
        },

        expert:
        {
            path: "expert.webp",
            frames: new Point(8,2),
            cardSet: true,
            cardsOnly: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        suspects:
        {
            path: "suspects.webp",
            frames: new Point(11,1),
            //suspectsOnly: true
        },

        papers:
        {
            path: "papers.webp",
            cardsOnly: true
        },

        fingerprints:
        {
            path: "fingerprints.webp",
            suspectsOnly: true
        },
    },

    // how generation/balancing happens
    generation:
    {
       numPlayingCardsInDeck: 56,
       defFreqBounds: new Bounds(2, 10),
       defFrequencyForSuspect: 3,
       suspectsBase: ["loupe", "scarlett", "green", "mustard", "professor", "peacock"],
       suspectsTraitor: ["traitor", "doctor", "brunette", "rose"],

       murderQuotientTarget: new Bounds(0.25, 0.325), // ~deckSize
       protectQuotientTarget: new Bounds(0.15, 0.2), // ~deckSize
    },

    suspects:
    {
        // @NOTE: the WIDTH should be identical to the cards, as this ensures they line up when placed on the table
        // height is whatever fits without shrinking it further
        dims: { 
            small: new Point(4,9),
            regular: new Point(3,7),
            huge: new Point(2,5)
        },
        dimsElement: new Point(2, 1),

        shared:
        {

        },

        illustration:
        {
            fontSize: 0.15, // ~sizeUnit
            textColorLighten: 75,
            scaleFactor: 0.9, // ~sizeUnit
            shadowRadius: 0.1, // ~sizeUnit
            paperClipScale: 0.375, // ~sizeUnit
        },

        bg:
        {
            alpha: 1.0,
        }
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        dims: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
        },
        dimsElement: new Point(1, 1.4),
        
        shared:
        {
            bgColor: "#210B00",
            shadowColor: "#00000077", // transparent black
        },

        photographs:
        {
            yPos: 0.325, // ~sizeY
            rectSize: new Point(0.735), // ~sizeUnit
            rectHeightTitle: 0.2, // ~rectSizeY
            padding: new Point(0.05), // ~rectSizeUnit
            maxRotation: new Bounds(0.025 * Math.PI, 0.04*Math.PI),
            numPerCard: new Bounds(2,4),

            shadowRadius: 0.02, // ~rectSize
            shadowOffset: 0.05, // ~rectSize

            requirementDims: 0.125, // ~rectSizeUnit
            requirementPadding: new Point(0.0225), // rectSizeUnit
            requirementPaddingBetween: 0.5, // ~requirementPadding
            requirementShadowRadius: 0.1, // ~reqsDims

            titleFontSize: 0.14, // ~rectSizeUnit
            titleColorLighten: 75,
            titleShadowRadius: 0.2, // ~fontSize
        },

        illustration:
        {
            scaleFactor: 1.0, // ~innerRectSize
            paperClipScale: 0.2, // ~sizeUnit
            paperClipOffset: new Point(0.2, 0.0925), // ~sizeUnit, X is from the center, Y is from the top
        },

        text:
        {
            yPos: 0.78,
            rectSize: new Point(0.8, 0.33), // ~size
            rectColor: "#FFEFE6",
            rectBlur: 0.065, // ~rectSizeUnit
            fontSize: 0.07, // ~sizeUnit
            hardShadowOffset: 0.015, // ~fontSize (a very slight shadow that "thickens" the text and makes it slightly more legible)
        },
        
        outline:
        {
            size: 0.03, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG