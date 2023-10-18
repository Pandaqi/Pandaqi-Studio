import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { TYPES } from "./dict"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)

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
    assetsBase: "/hold-my-bear/assets/",
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
        defaultCardFrequency: 3,
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
        size: new Point(),

        wonkyRect:
        {
            pointOffset: new Bounds(0.01, 0.15), // relative to box Y height
        },

        icons:
        {

        },

        illustration:
        {
            sizeFactor: 0.5, // relative to sizeUnit
            bgSize: new Point(0.7, 0.55), // should always be bigger than sizeFactor above

            addShadow: true,
            shadowRadius: 0.02, // relative to spriteSize
            shadowOffset: new Point(0.15), // relative to spriteSize
        },

        power:
        {
           gapIconAndText: 0.05, // relative to sizeUnit
           fontSize: 0.15, // relative to sizeUnit
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