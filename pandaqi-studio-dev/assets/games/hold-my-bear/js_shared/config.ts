import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)

    configKey: "holdMyBearConfig",
    fileName: "[Material] Hold my Bear",
    resLoader: null,
    animals: [],

    // set through user config on page
    inkFriendly: false,
    animalsBase: {},
    animalsExpansion: {},
    cardSize: "regular",

    fonts:
    {
        heading: "Sloval",
        body: "Ciscopic"
    },

    // assets
    assetsBase: "/hold-my-bear/assets/",
    assets:
    {
        icons:
        {
            path: "icons.webp",
            frames: new Point(8,1)
        },

        icons_expansion:
        {
            path: "icons_expansion.webp",
            expansion: true,
            frames: new Point(8,2)
        },

        animals:
        {
            path: "animals.webp",
            frames: new Point(8,1)
        },

        animals_expansion:
        {
            path: "animals_expansion.webp",
            expansion: true,
            frames: new Point(8,2)
        },

        bg:
        {
            path: "bg.webp"
        },

        bg_power:
        {
            path: "bg_power.webp",
            expansion: true,
        },

        decoration:
        {
            path: "decoration.webp",
            frames: new Point(4,1)
        },

        ciscopic:
        {
            key: "Ciscopic",
            expansion: true,
            path: "fonts/Ciscopic-Regular.woff2"
        },

        sloval:
        {
            key: "Sloval",
            path: "fonts/sloval-Regular.woff2"
        }
    },

    // how generation/balancing happens
    generation:
    {
        numberDistribution: [3,2,1,1,1] // 3x1, 2x2, 1xother
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        // @TODO: maybe make these smaller, as cards really don't need to be this big?
        dims: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
        },
        dimsElement: new Point(1, 1.4),
        size: new Point(),

        icons:
        {
            offset: new Point(0.135, 0.135), // relative to sizeUnit
            fontSize: 0.2, // relative to sizeUnit
            scaleFactor: 0.18, // relative to sizeUnit
            bgScaleFactor: 2.6, // relative to icon scaleFactor (above)
            bgOffset: new Point(0.135, 0.18), 
            textShadow: true, // (shadow is SLOW, but looks much better/more legible)
        },

        illustration:
        {
            sizeFactor: 0.8, // relative to sizeUnit
            splatNum: new Bounds(6, 9),
            splatAlphaBounds: new Bounds(0.05, 0.1),
            splatRadiusBounds: new Bounds(0.05, 0.2), // relative to sizeUnit; basically sphere around center card
            splatDimsBounds: new Bounds(0.4, 0.6), // relative to sizeUnit
        },

        power:
        {
            width: 0.915, // relative to width of card
            yPos: 0.72, // relative to height of card
            fontSize: 0.055, // relative to sizeUnit
            textBoxSidePadding: 0.875, // size of text box relative to full width of bg
        },

        outline:
        {
            size: 0.036, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG