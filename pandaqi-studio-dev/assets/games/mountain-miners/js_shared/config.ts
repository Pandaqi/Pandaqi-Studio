import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
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
    },

    fonts:
    {
        heading: "ambery",
        body: "k2d"
    },

    // assets
    assetsBase: "/mountain-miners/assets/",
    assets:
    {
        tiles:
        {
            path: "tiles.webp",
            frames: new Point(4,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },
    },

    tiles:
    {
        generation:
        {
            defFreq: 3,
            numArrowTiles: 2,
            numTilesPerGemstoneValue: 
            {
                1: 6,
                2: 5,
                3: 4,
                4: 3
            }
        },

        icon:
        {
            dims: new CVal(new Point(0.66), "sizeUnit")
        },

        gemstones:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            textFillColor: "#000000",
            textStrokeColor: "#FFFFFF",
            strokeWidth: new CVal(0.05, "sizeUnit"),
        }
    },
}

export default CONFIG