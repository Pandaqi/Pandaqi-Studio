import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
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
            path: "fonts/LibreCaslonText-Regular.woff2"
        },

        base:
        {
            path: "base.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        advanced:
        {
            path: "advanced.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        expert:
        {
            path: "expert.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        suspects:
        {
            path: "suspects.webp",
            frames: new Point(10,1)
        },

        papers:
        {
            path: "papers.webp",
        },

        fingerprints:
        {
            path: "fingerprints.webp",
        },
    },

    // how generation/balancing happens
    generation:
    {
       numPlayingCardsInDeck: 50,
       defFreqBounds: new Bounds(1, 10),
       defFrequencyForSuspect: 3,
       suspectsBase: ["spyglass", "scarlett", "green", "mustard", "professor", "peacock"],
       suspectsTraitor: ["traitor", "doctor", "brunette", "rose"]
    },

    suspects:
    {
        // @NOTE: the WIDTH should be identical to the cards, as this ensures they line up when placed on the table
        // height is whatever fits without shrinking it further
        dims: { 
            small: new Point(4,7),
            regular: new Point(3,5),
            huge: new Point(2,3)
        },
        dimsElement: new Point(2, 1),

        shared:
        {

        },

        illustration:
        {
            fontSize: 0.1, // ~sizeUnit
            textColorLighten: 75,
            scaleFactor: 0.9, // ~sizeUnit
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
        },

        photographs:
        {
            yPos: 0.4, // ~sizeY
            rectSize: new Point(0.66), // ~sizeUnit
            rectHeightTitle: 0.2, // ~rectSizeY
            padding: new Point(0.05), // ~rectSizeUnit
            maxRotation: 0.15 * Math.PI,
            numPerCard: new Bounds(2,4),

            requirementDims: 0.15, // ~rectSizeUnit
            requirementPadding: new Point(0.05), // rectSizeUnit

            titleFontSize: 0.1, // ~rectSizeUnit
            titleColorLighten: 75
        },

        illustration:
        {
            scaleFactor: 1.0, // ~innerRectSize
        },

        text:
        {
            yPos: 0.66,
            rectSize: new Point(0.8, 0.4), // ~size
            rectColor: "#FFEFE6",
            rectBlur: 0.08, // ~rectSizeUnit
            fontSize: 0.1, // ~sizeUnit
        },
        
        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG