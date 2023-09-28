import Point from "js/pq_games/tools/geometry/point"

export default {
    debugWithoutPDF: true, // @DEBUGGING (should be false)
    debugSingleCard: true,
    fileName: "[Creature Quellector] Material",
    configKey: "creatureQuellectorConfig",
    progressBar: null,
    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    cardSize: "regular",
    inkFriendly: false,
    elements: {}, // the elements included by user setting on game page
    elementsReverse: {},

    alwaysAddMainTypeOnce: false,

    assets: {
        creatures_1: {
            path: "assets/quellector_creatures_1.webp",
            frames: { x: 8, y: 2 }
        },
        creatures_2: {
            path: "assets/quellector_creatures_2.webp",
            frames: { x: 8, y: 2 }
        },
        creatures_3: {
            path: "assets/quellector_creatures_3.webp",
            frames: { x: 8, y: 2 }
        },
        backgrounds_1: {
            path: "assets/quellector_backgrounds_1.webp",
            frames: { x: 8, y: 2 }
        },
        backgrounds_2: {
            path: "assets/quellector_backgrounds_2.webp",
            frames: { x: 8, y: 2 }
        },
        backgrounds_3: {
            path: "assets/quellector_backgrounds_3.webp",
            frames: { x: 8, y: 2 }
        },
        icons: {
            path: "assets/quellector_types.webp",
            frames: { x: 8, y: 2 }
        },
        icons_actions: {
            path: "assets/quellector_actions.webp",
            frames: { x: 8, y: 2 }
        },
        counter_icon: {
            path: "assets/counter_icon.webp",
            frames: { x: 1, y: 1 }
        },

        fontHeading: {
            key: "Comica Boom",
            path: "assets/fonts/Comica Boom.otf",
            size: 0.1285
        },

        fontText: {
            key: "Beautiful Humility",
            path: "assets/fonts/Beautiful Humility.otf",
            size: 0.063
        },

        fontDetails: {
            key: "Cabin-Italic",
            path: "assets/fonts/Cabin-Italic.woff2",
            size: 0.0533
        }
    },

    gameplay: {
        // purple defeats green, defeats blue, defeats red, defeats purple
        elementCycle: ["purple", "green", "blue", "red"],
        elementCycleSubtype: [],
        actionProbability: 0.35,
        actionPickThreshold: 5, // we'll only consider adding actions once this number of regular icons have been placed
        actionPercentage: { min: 0.175, max: 0.3 }, // what percentage of icons (in total) should be an action?
        actionPercentagePerType: { min: 0.075, max: 0.5 } // what percentage of icons (within one type) may be an action?
    },

    cards: {
        dims: { 
            small: new Point({ x: 4, y: 4 }),
            regular: new Point({ x: 3, y: 3 }),
            huge: new Point({ x: 2, y: 2 })
        },
        dimsElement: new Point({ x: 1, y: 1.55 }),
        numPerElement: 12,
        iconsPerCard: 4,
        //backgroundColor: "#FFE4B3",
        backgroundColors: {
            red: "#FFD2D2",
            blue: "#D6FEFA",
            green: "#E8FFDF",
            purple: "#F2E3FF"
        },

        icon: {
            backgroundInkFriendly: "#777777",
            backgroundDarkInkFriendly: "#333333"
        },
        
        backgroundScale: 2.0,
        backgroundAlpha: 0.125,
        generator: {
            maxDifferenceBetweenTypes: 5,
            subTypeExtraProb: 0.2,
        },
        size: new Point(),
        stroke: {
            color: "#614100",
            colorInkFriendly: "#999999",
            width: 0.01
        },
        outline: {
            color: "#332211",
            colorInkFriendly: "#333333",
            width: 0.02,
        },
        genericNames: ["mon", "snout", "leg", "fur", "paw", "tail", "speed", "critter", "creat", "monster", "god", "child", "baby", "beak", "wing", "dweller", "kid", "roam", "breath", "blast", "jump", "leap"],

    }
}
