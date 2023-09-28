import Point from "js/pq_games/tools/geometry/point";

export default 
{
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    fileName: "[Kingseat] Material",
    configKey: "kingseatConfig",
    progressBar: null,
    pdfBuilder: null,
    resLoader: null,
    gridMapper: null,
    cardSize: "regular",
    packs: [],

    assetsBase: "/kingseat/assets/",
    fonts: {
        heading: {
            key: "UniFraktur",
            url: "fonts/UnifrakturCook-Bold.woff2",
            size: 0.1285
        },

        text: {
            key: "ModerneFraktur",
            url: "fonts/ModerneFraktur.woff2",
            size: 0.063
        },

        slogan: {
            key: "Gothic",
            url: "fonts/GothicUltraOT.woff2",
            size: 0.0533
        }
    },
    assets: {
        crests_full: {
            path: "crests_full.webp",
            frames: new Point(12, 1)
        },
        crests_simple: {
            path: "crests_simplified.webp",
            frames: new Point(12, 1)
        },
        gradient_overlay: {
            path: "gradient_overlay.webp",
            frames: Point.ONE
        },
        multicolor_bg: {
            path: "multicolor_bg.webp",
            frames: Point.ONE
        },
        decoration_icons: {
            path: "decoration_icons.webp",
            frames: new Point(2,1)
        }
    },
    cards: {
        addShadowToSigil: true, // @DEBUGGING; should be TRUE (but is very slow, hence turned off normally)
        maxDarkCardsPerPack: 2,
        percentageWithAction: 1.0,
        dims: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
        },
        numPerPack: 12,
        dimsElement: new Point(1, 1.55),
        size: new Point(),
        outline: {
            color: "#111111",
            width: 0.025,
        }
    }
}
