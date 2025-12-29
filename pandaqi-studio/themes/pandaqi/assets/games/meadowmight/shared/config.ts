import { SettingType, Vector2 } from "lib/pq-games"
import { tilePicker } from "../game/tilePicker"

export const CONFIG = 
{
    _settings:
    {
        wolf:
        {
            type: SettingType.CHECK,
            value: false,
            label: "Wool Wolves (Expansion",
            remark: "Adds four special tiles with unique actions!"
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
        fileName: "Meadowmight",
    },

    // assets
    _resources:
    {    
        base: "/meadowmight/assets/",
        files:
        {
            player_sheep:
            {
                path: "player_sheep.webp",
                frames: new Vector2(6,1)
            },

            files:
            {
                path: "assets.webp",
                frames: new Vector2(8,2)
            },

        }
    },

    // how generation/balancing happens
    generation:
    {
        numPlayers: 6,
        defaultNumEmpty: 4,
        defaultNumSheep: 4,
        defaultNumSpecial: 2,
        defaultSpecialAllowed: ["wolf", "tree", "pond", "house"],

        numRandomExtra: 8, // how many tiles to randomly add on top of the default generation (for slightly larger/randomized decks)
        randomExtras: {
            open: { prob: 1.0 }, // and this one for preventing too many fences/too easy meadow closing 
            double_corner: { prob: 1.0 }, // this is by far the most interesting one for rot
        }
    },

    _material:
    {
        tiles:
        {
            picker: tilePicker,
            mapper:
            {
                size: { 
                    small: new Vector2(5,6),
                    regular: new Vector2(4,5),
                    large: new Vector2(3,4)
                },
                sizeElement: new Vector2(1, 1),
            }
        }
    },

    _drawing:
    {
        // @NOTE: That's right, no fonts in this one.
        tiles:
        {
            fences:
            {
                scale: [0.775, 0.75, 0.705],
                edgeOffset: [0.08, 0.11, 0.115], // ~sizeUnit
            },

            sheep:
            {
                scale: 0.6, // ~sizeUnit, cut in half further for multiple sheep on a tile
            },

            outline:
            {
                size: 0.025, // ~sizeUnit
                color: "#000000"
            }
        }
    }
}