
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
    diamond: { frame: 5, color: "white", points: 3, gem: true },
    onyx: { frame: 6, color: "black", points: 4, gem: true },
    amethyst: { frame: 7, color: "purple", points: 4, gem: true, set: "gemShards" },

    // base actions
    arrow_move: { frame: 8, label: "Arrow Move", desc: "Move the Arrow to any of the eight positions. (North, East, South, West, or in-between.)" },
    arrow_lock: { frame: 9, label: "Arrow Lock", desc: "Turn the arrow facedown. It doesn't move automatically anymore at the end of your turn. This is undone when the <em>next</em> Lock is played." },
    swap: { frame: 10, label: "Swap", desc: "Swap 2 tiles on the board. You may also swap with empty space, essentially <em>moving</em> a tile, as long as the board stays connected." },
    double: { frame: 11, label: "Double", desc: "Take 2 turns in a row." },
    steal: { frame: 12, label: "Steal", desc: "Steal a collected tile from another player." },

    // dark tunnels actions
    flashlight: { frame: 13, label: "Flashlight", desc: "Pick a row of tiles and secretly look at them.", set: "darkTunnels" },
    lightbulb: { frame: 14, label: "Lightbulb", desc: "Pick a row of tiles and <em>reveal</em> all of them.", set: "darkTunnels" },
    bomb: { frame: 15, label: "Bomb", desc: "Remove a 2x2 cluster of tiles from the board. The next player must skip their turn to refill this hole from the deck.", set: "darkTunnels" },
    second_arrow: { frame: 16, label: "Second Arrow", desc: "Add the second Arrow Tile at any location. If it's already active, remove it instead.", set: "darkTunnels" },
    ransack: { frame: 17, label: "Ransack", desc: "Flip a facup tile facedown. Then collect an adjacent tile and end your turn.", set: "darkTunnels" },
    trash: { frame: 18, label: "Trash", desc: "Each trash tile is always worth -2 points. It can't be stolen or discarded.", gem: true, points: -2, set: "darkTunnels" },
    multiplier: { frame: 19, label: "Multiplier", desc: "Add this to any gemstone pile to <em>double</em> its score at the end. Once done, however, you may never grab that gemstone again.", gem: true, points: 0, set: "darkTunnels" },

    // Gemshards
    rotate_grabbed: { frame: 20, label: "Rotate Grabbed", desc: "Rotate a tile you already collected. (To make another side point up and be true.)", set: "gemShards" },
    rotate_board: { frame: 21, label: "Rotate Board", desc: "Rotate a tile on the board.", set: "gemShards" },
    teleport: { frame: 22, label: "Teleport", desc: "Move the arrow to any location, or a tile to any location attached to the map.", set: "gemShards" }, // @TODO: not sure about this one, should be able to find something much better.
    rumble: { frame: 23, label: "Rumble", desc: "Move 2 tiles to empty spaces in the mountain. They must be spaces within the original 6x6 grid.", gem: true, points: 0, set: "gemShards" },
    wildcard: { frame: 24, label: "Wildcard", desc: "When received, decide to which gemstone pile to add it. You can't grab a wildcard if you have no regular gemstones yet.", gem: true, points: 0, set: "gemShards" },
    
}

const MISC =
{
    arrow: { frame: 0 }, // need 2 of these in the material
    bg_1: { frame: 1 },
    bg_2: { frame: 2 },
}

export 
{
    TILES,
    MISC,
}
