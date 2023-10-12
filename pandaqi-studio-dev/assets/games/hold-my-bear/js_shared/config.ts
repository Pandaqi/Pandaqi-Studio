import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)

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
        heading: "@TODO",
        body: "@TODO"
    },

    // assets
    assetsBase: "/hold-my-bear/assets/",
    assets:
    {
        // @TODO: animal_icons + animal_icons_expansion
        // @TODO: type_icons + type_icons_expansion
        // @TODO: watercolor_decorations
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
        dimsElement: new Point(1, 1.55),
        size: new Point(),

        icons:
        {
            offset: new Point(0.1, 0.1), // relative to sizeUnit
            fontSize: 0.1, // relative to sizeUnit
            scaleFactor: 0.1, // relative to sizeUnit
        },

        illustration:
        {
            sizeFactor: 0.75, // relative to sizeUnit
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG