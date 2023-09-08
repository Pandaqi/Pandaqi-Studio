import Point from "js/pq_games/tools/geometry/point"

export default {
    debugWithoutPDF: true, // @DEBUGGING (should be false)
    fileName: "[Creature Quellector] Material",
    configKey: "creatureQuellectorConfig",
    progressBar: null,
    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    cardSize: "regular",
    inkFriendly: false,
    elements: {}, // the elements included by user setting on game page

    assets: {
        creatures: {
            path: "assets/quellector_creatures.webp",
            frames: { x: 8, y: 2 }
        },
        backgrounds: {
            path: "assets/quellector_backgrounds.webp",
            frames: { x: 8, y: 2 }
        },
        icons: {
            path: "assets/quellector_types.webp",
            frames: { x: 8, y: 2 }
        },
        iconActions: {
            path: "assets/quellector_actions.webp",
            frames: { x: 8, y: 2 }
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
        elementCycle: ["red", "blue", "green", "purple"],
        elementCycleSubtype: []
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
        backgroundColor: "#FFE4B3",
        backgroundScale: 2.0,
        backgroundAlpha: 0.25,
        generator: {
            maxDifferenceBetweenTypes: 5,
            subTypeExtraProb: 0.2,
        },
        size: new Point(),
        outline: {
            color: "#111111",
            width: 0.05,
        }
    }
}
