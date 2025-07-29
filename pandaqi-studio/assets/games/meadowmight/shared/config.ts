import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    _settings:
    {
        wolf:
        {
            type: SettingType.CHECK,
            default: false,
            label: "Wool Wolves (Expansion",
            remark: "Adds four special tiles with unique actions!"
        }
    },

    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "meadowMightConfig",
    fileName: "Meadowmight",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",
    
    expansions:
    {
        wolf: false
    },

    // @NOTE: That's right, no fonts in this one.

    // assets
    assetsBase: "/meadowmight/assets/",
    assets:
    {
        player_sheep:
        {
            path: "player_sheep.webp",
            frames: new Point(6,1)
        },

        assets:
        {
            path: "assets.webp",
            frames: new Point(8,2)
        },

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

    // how to draw/layout cards (mostly visually)
    tiles:
    {
        size: { 
            small: new Point(5,6),
            regular: new Point(4,5),
            large: new Point(3,4)
        },
        sizeElement: new Point(1, 1),
        
        shared:
        {
            
        },

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

export default CONFIG