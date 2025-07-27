
interface TileData
{
    frame: number,
    color?: string,
    points?: number,
    gem?: boolean, // true if a gemstone that scores points, false if an action tile
    label?: string
    desc?: string,
    freq?: number, // custom frequency of occurence
    set?: string, // to which set they belong; default is base
}

const TILES:Record<string,TileData> =
{
    // base gemstones
    // (their frequences are determined by point value, set in config)
    ruby: { frame: 0, color: "red", points: 1, gem: true },
    sapphire: { frame: 1, color: "yellow", points: 1, gem: true, set: "darkTunnels" },
    emerald: { frame: 2, color: "green", points: 2, gem: true },
    lapis: { frame: 3, color: "blue", points: 2, gem: true, set: "gemShards" },
    pearl: { frame: 4, color: "pink", points: 3, gem: true, set: "darkTunnels" },
    diamond: { frame: 5, color: "gray", points: 3, gem: true },
    onyx: { frame: 6, color: "black", points: 4, gem: true },
    amethyst: { frame: 7, color: "purple", points: 4, gem: true, set: "gemShards" },

    // base actions
    arrow_move: { frame: 8, label: "Arrow Move", desc: "Move the Arrow to any of the eight positions. (North, East, South, West, or in-between.)", freq: 6 },
    arrow_lock: { frame: 9, label: "Arrow Lock", desc: "Turn the arrow facedown. It can't move anymore. This is undone when the <em>next</em> Lock is played.", freq: 4 },
    swap: { frame: 10, label: "Swap", desc: "Swap 2 tiles on the board. You may also swap with empty space, essentially <em>moving</em> a tile, as long as the board stays connected.", freq: 4 },
    double: { frame: 11, label: "Double", desc: "Grab 1 more tile this turn.", freq: 2 },
    steal: { frame: 12, label: "Steal", desc: "Steal a collected tile from another player.", freq: 2 },

    // Dark Tunnels
    lightbulb: { frame: 14, label: "Lightbulb", desc: "Secretly study 1 row of tiles OR <em>reveal</em> 2 rows to everyone.", set: "darkTunnels", freq: 6 },
    bomb: { frame: 15, label: "Bomb", desc: "Remove a 2x2 cluster of tiles from the board. The next player must skip their turn to refill this hole from the deck.", set: "darkTunnels", freq: 2 },
    second_arrow: { frame: 16, label: "Second Arrow", desc: "Add the second Arrow Tile at any location. If it's already active, remove it instead.", set: "darkTunnels", freq: 2 },
    ransack: { frame: 17, label: "Ransack", desc: "Flip a facup tile facedown. Then collect an adjacent tile and end your turn.", set: "darkTunnels", freq: 3 },
    trash: { frame: 18, label: "Trash", desc: "Each trash tile is always worth -2 points. It can't be stolen or discarded.", gem: true, points: -2, set: "darkTunnels", freq: 5, color: "brown" },
    multiplier: { frame: 19, label: "Multiplier", desc: "Add this to any gemstone pile to <em>double</em> its score at the end. Once done, however, you may never grab that gemstone again.", gem: true, points: 0, set: "darkTunnels", freq: 2, color: "brown" },

    // Gemshards
    rotate_grabbed: { frame: 20, label: "Rotate Grabbed", desc: "Rotate a tile you already collected. (To make another side point up and be true.)", set: "gemShards", freq: 4 },
    rotate_board: { frame: 21, label: "Rotate Board", desc: "Rotate a tile on the board.", set: "gemShards", freq: 3 },
    chameleon: { frame: 22, label: "Chameleon", desc: "Execute any action that's still on the board.", set: "gemShards", freq: 2 },
    artefact: { frame: 25, label: "Artefact", desc: "Throw away one entire gemstone pile of yours.", set: "gemShards", freq: 2 },
    wildcard: { frame: 24, label: "Wildcard", desc: "When received, decide to which gemstone pile to add it. You can't grab a wildcard if you have no regular gemstones yet.", gem: true, points: 0, set: "gemShards", freq: 4, color: "brown" },

    // Golden Actions
    flashlight: { frame: 13, label: "Flashlight", desc: "Grab 1 tile from anywhere on the map.", set: "goldenActions", freq: 3 },
    rumble: { frame: 23, label: "Rumble", desc: "Move 2 tiles to empty spaces in the mountain. They must be spaces within the original boundaries.", set: "goldenActions", freq: 2 },
    ring: { frame: 26, label: "Ring", desc: "Flip the direction the arrow automatically rotates (clockwise <-> counter-clockwise)", set: "goldenActions", freq: 4 },
    wildcard_arrow: { frame: 27, label: "Wildcard Arrow", desc: "Change how much the arrow rotates by default (half turn, quarter turn, or 1/8 turn).", set: "goldenActions", freq: 4 },
    // @TODO/IDEA: Something that DISABLES actions temporarily? So you can prevent others from using an action tile in certain situations?
}

const MISC =
{
    arrow: { frame: 0 }, // need 2 of these in the material
    bg_1: { frame: 1 },
    bg_2: { frame: 2 },
    bg_3: { frame: 3 },
    bg_4: { frame: 4 }
}

const COLORS = 
{
    white: "#FFFFFF",
    gray: "#BBBBBB",
    black: "#000000",
    red: "#FF0000",
    yellow: "#FFFF00",
    green: "#00FF00",
    blue: "#0000FF",
    pink: "#FF00FF",
    purple: "#A020F0",
    brown: "#993300",
}

export 
{
    TILES,
    TileData,
    MISC,
    COLORS
}
