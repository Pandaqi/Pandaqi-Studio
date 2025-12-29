
import { SettingType, TextConfig, TextWeight, TextStyle, Vector2, Bounds, CVal } from "lib/pq-games"
import { tilePicker } from "../game/tilePicker"

export const CONFIG = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Game"
            },

            pawns:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Player Pawns"
            },
        }
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Waterfall",
    },

    // assets
    _resources:
    {    
        base: "/waterfall/assets/",
        files:
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
                frames: new Vector2(6,1)
            },

            actions:
            {
                path: "actions.webp",
                frames: new Vector2(8,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },
        },
    },

    rulebook:
    {
        itemSize: new Vector2(512, 512),

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

    _material:
    {
        tiles:
        {
            itemSize: new Vector2(512, 512),
            picker: tilePicker,
            mapper: 
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1),
                size: 
                { 
                    small: new Vector2(5,7),
                    regular: new Vector2(3,5),
                    large: new Vector2(2,3)
                }, 
            },
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "merienda",
            body: "avrile",
        },

        tiles:
        {
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
                pos: new CVal(new Vector2(0.85, 0.265), "sizeUnit"),
                textColor: "#372B00",
                strokeColor: "#FFFFFF",
                strokeWidth: new CVal(0.08, "tiles.score.fontSize"),
            },

            action:
            {
                pos: new CVal(new Vector2(0.5, 0.825), "size"),
                size: new CVal(new Vector2(0.3), "sizeUnit")
            },

            gemstones:
            {
                pos: new CVal(new Vector2(0.15, 0.265), "sizeUnit"),
                size: new CVal(new Vector2(0.18), "sizeUnit"), // should be close to "score.fontSize", but higher
            },
        },
    }
}