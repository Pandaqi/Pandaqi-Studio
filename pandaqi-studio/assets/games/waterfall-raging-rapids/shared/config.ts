import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "waterfallRagingRapidsConfig",
    fileName: "Waterfall: Raging Rapids",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    useIconsForDefaultActions: false,
    useConditionalActions: false,
    
    sets:
    {
        pawns: true,
        base: true,
        gates: false,
    },

    fonts:
    {
        heading: "merienda",
        body: "avrile",
    },

    // assets
    assetsBase: "/waterfall-raging-rapids/assets/",
    assets:
    {
        avrile:
        {
            path: "fonts/AvrileSerif-Regular.woff2",
        },

        avrile_bold:
        {
            key: "avrile",
            path: "fonts/AvrileSerif-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD }),
        },

        avrile_italic:
        {
            key: "avrile",
            path: "fonts/AvrileSerif-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
        },

        avrile_bold_italic:
        {
            key: "avrile",
            path: "fonts/AvrileSerif-BlackItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD }),
        },

        merienda:
        {
            path: "fonts/Merienda-Black.woff2",
        },

        gemstones:
        {
            path: "gemstones.webp",
            frames: new Point(6,1)
        },

        decoration:
        {
            path: "decoration.webp",
            frames: new Point(8,2)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,2)
        },
    },

    rulebook:
    {
        
    },

    generation:
    {
        numBaseTiles: 36,
        numGateTiles: 15,

        numPawnFrames: 3,
        bgDirtTextureBounds: new Bounds(0,3),
        gemstonesPerTileBounds: new Bounds(1,3),
        numGemstonesMultiplierBounds: new Bounds(1,3),
        maxGemstonesPerTile: 8,
        minGemstonesPerTile: 3,
        
        conditionalActionsPercentage: 0.2,

        scoreDistribution:
        {
            1: 0.15,
            2: 0.25,
            3: 0.35,
            4: 0.2,
            5: 0.05
        },

        numInputsOutputsDistribution:
        {
            input:
            {
                1: 0.75,
                2: 0.25
            },

            output:
            {
                1: 0.25,
                2: 0.72
            }
        },

        randomDecorationProbability: 0.65,
        boulderDecorationProbability: 0.5,
        boulderDoubleProbability: 0.66,
        decorationFrameBounds: new Bounds(0,3),
        
        // relative to width/height; 
        // anything OUTSIDE is room for gemstones, anything INSIDE is action text + score
        innerRectangleSize: 0.7, 
        gemstoneRectangleSize: 0.885
    },

    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            sizeElement: new Point(1, 1),
            size: 
            { 
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            }, 
        },

        score:
        {
            fontSize: new CVal(0.135, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.125), "sizeUnit"),
            textColor: "#372B00",
            strokeColor: "#FFFFFF",
            strokeWidth: new CVal(0.1, "tiles.score.fontSize"),
        },

        action:
        {
            fontSize: new CVal(0.085, "sizeUnit"),
            fontSizeWithGate: new CVal(0.06, "sizeUnit"),
            textColor: "#FFEEEE",
            textBoxDims: new CVal(new Point(0.66, 0.66), "size"),
            textBoxDimsWithGate: new CVal(new Point(0.66, 0.4), "size"),
            pos: new CVal(new Point(0.5), "size"),
            posWithGate: new CVal(new Point(0.5, 0.382), "size"),
        },

        gate:
        {
            fontSize: new CVal(0.04, "sizeUnit"),
            textColor: "#110000",
            textBoxDims: new CVal(new Point(0.7, 0.35), "size"),
            pos: new CVal(new Point(0.5, 0.715), "size")
        },

        gemstones:
        {
            iconDims: new CVal(new Point(0.07), "sizeUnit")
        },

        decoration:
        {
            iconDims: new CVal(new Point(0.1), "sizeUnit"),
            iconDimsBoulder: new CVal(new Point(0.12), "sizeUnit"),
            boulderOffset: new CVal(0.0375, "sizeUnit")
        },

        water:
        {
            fillColor: "#B1FEEF",
            circleRadius: new CVal(0.0335, "sizeUnit"), // should be same or close to decoration.boulderOffset
        }
    },
}


export default CONFIG