import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

export const CONFIG:any = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Base Game"
            },

            pawns:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Player Pawns"
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "waterfallConfig",
    fileName: "Waterfall",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",
    
    sets:
    {
        pawns: true,
        base: true,
    },

    fonts:
    {
        heading: "merienda",
        body: "avrile",
    },

    // assets
    assetsBase: "/waterfall/assets/",
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
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        avrile_italic:
        {
            key: "avrile",
            path: "fonts/AvrileSerif-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        avrile_bold_italic:
        {
            key: "avrile",
            path: "fonts/AvrileSerif-BlackItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
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

        actions:
        {
            path: "actions.webp",
            frames: new Point(8,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    rulebook:
    {
        itemSize: new Point(512, 512),

        numPlayers: new Bounds(3,5),
        numStartingTiles: 5,
        numTurnsPreGenerate: new Bounds(2,10),
        maxWaterfallSizeForWin: 20, 
        maxWaterfallHeight: 6, // 6 = 21 max, so perhaps 7 has more freedom here
        leapFrogUseProb: 0.75,
        dontBlockIfBothPathsBlocked: true, // @DEBUGGING: testing a less strict rule
        numTilesPerDrawAction: 3,
        numTilesPerScoreAction: 2,
        preferStayingOnBoardProb: 0.95,
        drawTileIfHandEmpty: true,
        resetPathAfterScoring: false,
        endGameIfDeckEmpty: true
    },

    generation:
    {
        numBaseTiles: 44,
        numPawnFrames: 3,
        bgDirtTextureBounds: new Bounds(0,3),
        scoreDistribution:
        {
            1: 0.05,
            2: 0.25,
            3: 0.4,
            4: 0.25,
            5: 0.05
        },
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

        shared:
        {
            shadow:
            {
                color: "#FFFFFF",
                blur: new CVal(0.02, "sizeUnit")
            }
        },

        score:
        {
            fontSize: new CVal(0.16, "sizeUnit"),
            pos: new CVal(new Point(0.85, 0.265), "sizeUnit"),
            textColor: "#372B00",
            strokeColor: "#FFFFFF",
            strokeWidth: new CVal(0.08, "tiles.score.fontSize"),
        },

        action:
        {
            pos: new CVal(new Point(0.5, 0.825), "size"),
            size: new CVal(new Point(0.3), "sizeUnit")
        },

        gemstones:
        {
            pos: new CVal(new Point(0.15, 0.265), "sizeUnit"),
            size: new CVal(new Point(0.18), "sizeUnit"), // should be close to "score.fontSize", but higher
        },
    },
}