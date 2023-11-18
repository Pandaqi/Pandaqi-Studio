import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "meadowMightConfig",
    fileName: "[Material] Meadowmight",

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    
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
        numPlayers: 5,
        defaultNumEmpty: 4,
        defaultNumSheep: 4,
        defaultNumWolf: 1,
    },

    // how to draw/layout cards (mostly visually)
    tiles:
    {
        dims: { 
            small: new Point(5,6),
            regular: new Point(4,5),
            huge: new Point(3,4)
        },
        dimsElement: new Point(1, 1),
        
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