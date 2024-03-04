import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "mountainMinersConfig",
    fileName: "[Material] Mountain Miners",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    sets:
    {
        base: true,
        darkTunnels: false,
        gemShards: false,
        goldenActions: false,
    },

    fonts:
    {
        heading: "vlaanderen",
        body: "rokkitt"
    },

    // assets
    assetsBase: "/mountain-miners/assets/",
    assets:
    {
        vlaanderen:
        {
            path: "fonts/VlaanderenChiseledNF.woff2",
        },

        rokkitt:
        {
            path: "/fonts/Rokkitt-Regular.woff2",
        },

        tiles:
        {
            path: "tiles.webp",
            frames: new Point(8,4)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(5,1)
        },
    },

    rulebook:
    {
        boardDims: new Point(4,4),
        highlightColor: "#FFAAAA",
        nonHighlightColor: "#DDDDDD",
        highlightStrokeColor: "#000000",
        nonHighlightStrokeColor: "#666666",
        lineWidth: 0.05,
        tileSize: 128,
        nonHighlightAlpha: 0.55,
    },

    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            },
        }, 

        generation:
        {
            numBackgrounds: 4,
            defFreq: 3, // default amount of times a specific tile type appears
            numArrowTiles: 2,
            numTilesPerGemstoneValue: 
            {
                1: 8,
                2: 7,
                3: 6,
                4: 5
            }
        },

        icon:
        {
            dims: new CVal(new Point(0.725), "sizeUnit"),
            dropShadowBlur: new CVal(0.025, "sizeUnit")
        },

        gemstones:
        {
            fontSize: new CVal(0.366, "sizeUnit"),
            textFillColor: "#000000",
            textStrokeColor: "#FFFFFF",
            strokeWidth: new CVal(0.016, "sizeUnit"),
            glowBlur: new CVal(0.033, "sizeUnit"),
        },

        background:
        {
            colorAlpha: 0.5,
            textureAlpha: 0.3,
            stroke: "#121212",
            strokeWidth: new CVal(0.015, "sizeUnit")
        }
    },
}

export default CONFIG