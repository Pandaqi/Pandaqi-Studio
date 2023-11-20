import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "splitTheFoodyConfig",
    fileName: "[Material] Split The Foody",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    cardSet: "base", // base, advanced, expert
    
    fonts:
    {
        heading: "primitive",
        body: "rosarivo"
    },

    // assets
    assetsBase: "/split-the-foody/assets/",
    assets:
    {
        primitive:
        {
            path: "fonts/Primitive.woff2"
        },

        rosarivo:
        {
            path: "fonts/Rosarivo-Regular.woff2"
        },

        base:
        {
            path: "base.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        appetite:
        {
            path: "appetite.webp",
            frames: new Point(8,2),
            cardSet: true
        },

        coins:
        {
            path: "coins.webp",
            frames: new Point(10,1),
            cardSet: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },

        bgs:
        {
            path: "bgs.webp",
            frames: new Point(4,1)
        },
    },

    // how generation/balancing happens
    generation:
    {
       
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
            shadowRadius: 0.033, // ~sizeUnit
            shadowColor: "#00000099", // semi-transparent black
        },

        heading:
        {
            yPos: 0.925,
            fontSize: 0.075, // ~sizeUnit
            fillColor: "#FFFFFF",
            strokeColor: "#240C00",
            strokeWidth: 0.1, // ~fontSize
            shadowOffset: 0.1, // ~fontSize
        },

        corners:
        {
            edgeOffsetBig: new Point(0.15, 0.15), // ~sizeUnit
            coinScaleBig: 0.235, // ~sizeUnit
            fontSizeBig: 0.15, // ~sizeUnit

            edgeOffsetSmall: new Point(0.1, 0.1), // ~sizeUnit
            coinScaleSmall: 0.15, // ~sizeUnit
            fontSizeSmall: 0.075, // ~sizeUnit

            fillColor: "#FFFFFF",
            strokeColor: "#240C00",
            strokeWidth: 0.1, // ~fontSize
        },

        illustration:
        {
            yPos: 0.33, // ~sizeY
            scale: 0.66 // ~sizeUnit
        },

        power:
        {
            yPos: 0.725, // ~sizeY
            scrollScale: new Point(0.95, 0.95/2.13), // ~size => the image is about 2.13:1
            textBoxWidth: 0.844, // ~scrollWidth
            fontSize: 0.066, // ~sizeUnit
            shadowOffset: 0.033, // ~fontSize
        },
        
        outline:
        {
            size: 0.025, // ~sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG