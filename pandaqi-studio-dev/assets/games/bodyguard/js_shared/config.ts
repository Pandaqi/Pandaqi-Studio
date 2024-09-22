import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { TYPES } from "./dict"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)
    debugSinglePack: false, // @DEBUGGING (should be false)

    configKey: "cookieSmasherConfig",
    fileName: "[Material] Cookie Smasher",
    resLoader: null,

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    cardSet: "starter",

    possibleNumbers: [1,2,3,4,5,6,7,8,9], // @TODO: create helper function to create array with range between numbers
    possibleTypes: Object.keys(TYPES),
    possibleCards: {}, // automatically filled with allowed cards during generation

    fonts:
    {
        heading: "palette",
        body: "pettingill"
    },

    // assets
    assetsBase: "/cookie-smasher/assets/",
    assets:
    {
        palette:
        {
            path: "fonts/PaletteMosaic-Regular.woff2"
        },

        pettingill:
        {
            path: "fonts/PettingillCF-Bold.woff2"
        },

        types:
        {
            path: "types.webp",
            frames: new Point(5,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(5,1)
        },

        starter:
        {
            path: "starter.webp",
            frames: new Point(5,2),
            cardSet: true
        },

        beginner:
        {
            path: "beginner.webp",
            frames: new Point(5,2),
            cardSet: true
        },

        amateur:
        {
            path: "amateur.webp",
            frames: new Point(5,2),
            cardSet: true
        },

        advanced:
        {
            path: "advanced.webp",
            frames: new Point(5,2),
            cardSet: true
        },

        expert:
        {
            path: "expert.webp",
            frames: new Point(5,2),
            cardSet: true
        }

    },

    // how generation/balancing happens
    generation:
    {
        randomSetSize: 10, // all sets are 10 cards exactly
        defaultCardFrequency: 3,
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        size: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
        },
        sizeElement: new Point(1, 1.4),
        size: new Point(),

        wonkyRect:
        {
            pointOffset: new Bounds(0.1, 0.15), // relative to box Y height
            triangleGap: 0.02, // relative to sizeUnit of box
            triangleSize: new Bounds(0.06, 0.1), // roughly x3 to x5 of triangleGap?
        },

        icons:
        {
            fontSizeNumber: 0.13, // relative to sizeUnit
            fontSizeName: 0.065, // relative to sizeUnit
            trapeziumShortSideShrinkFactor: 0.75,
            gapToIllustration: 0.05, // relative to sizeUnit

            trapeziumHeight: 0.625, // preferably roughly as large as bgSize.y of illustration
        },

        illustration:
        {
            sizeFactor: 0.55, // relative to sizeUnit
            bgSize: new Point(0.65, 0.6), // should always be bigger than sizeFactor above

            addShadow: true,
            shadowRadius: 0.01, // relative to spriteSize
            shadowOffset: new Point(0.02), // relative to spriteSize
        },

        power:
        {
           gapIconAndText: 0.05, // relative to sizeUnit
           padding: 0.08, // relative to sizeUnit
           fontSize: 0.075, // relative to sizeUnit
           lineHeight: 0.9,
           iconHeight: 0.55, // relative to text+image container for power
           inlineIconHeight: 0.9, // icon within text, relative to font size = capital letter height
        },

        bg:
        {
            color: "#FEFEFE"
        },

        outline:
        {
            size: 0.036, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG