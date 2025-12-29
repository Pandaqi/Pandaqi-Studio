import { SettingType, Vector2, CVal } from "lib/pq-games"
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
                label: "Base Set",
            },

            darkTunnels:
            {
                type: SettingType.CHECK,
                label: "Dark Tunnels",
                value: false,
            },

            gemShards:
            {
                type: SettingType.CHECK,
                label: "Gemshards",
                value: false,
            },

            goldenActions:
            {
                type: SettingType.CHECK,
                label: "Golden Actions",
                value: false,
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
        fileName: "Mountain Miners",
    },

    // assets
    _resources:
    {    
        base: "/mountain-miners/assets/",
        files:
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
                frames: new Vector2(8,4)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(5,1)
            },
        },
    },

    rulebook:
    {
        boardDims: new Vector2(4,4),
        highlightColor: "#FFAAAA",
        nonHighlightColor: "#DDDDDD",
        highlightStrokeColor: "#000000",
        nonHighlightStrokeColor: "#666666",
        lineWidth: 0.05,
        tileSize: 128,
        nonHighlightAlpha: 0.55,
    },

    _material:
    {
        tiles:
        {
            itemSize: new Vector2(128),
            picker: () => tilePicker,
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
            heading: "vlaanderen",
            body: "rokkitt"
        },

        tiles:
        {
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
                size: new CVal(new Vector2(0.725), "sizeUnit"),
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
}