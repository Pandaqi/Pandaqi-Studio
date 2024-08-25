enum CardType
{
    MOVEMENT = "movement",
    MAP = "map",
    PAWN = "pawn",
}

enum FishType
{
    FISH1 = "fish1",
    FISH2 = "fish2",
    FISH3 = "fish3",
    FISH4 = "fish4",
}

enum TileAction
{
    REVEAL = "reveal",
    SWAP = "swap",
    STUDY = "study"
}

enum CardMovement
{
    LEFT = "left",
    RIGHT = "right",
    UP = "up",
    DOWN = "down",
    NOTHING = "nothing",
    ANY = "any",
    COPY = "copy",
    TELEPORT = "teleport",
    MATCH = "match",
    INVERT = "invert"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    maxNum?: number,
}

const TILE_ACTIONS:Record<TileAction, GeneralData> =
{
    [TileAction.REVEAL]: { frame: 0, desc: "Reveal a card at position indicated.", maxNum: 8 }, // it modulates the action number to be between 0-(maxNum-1)
    [TileAction.SWAP]: { frame: 1, desc: "Swap the movement card at the position indicated with another.", maxNum: 8 },
    [TileAction.STUDY]: { frame: 3, desc: "Secretly look at the number of movement cards indicated.", maxNum: 3 }
}

const MOVEMENT_CARDS:Record<CardMovement, GeneralData> =
{
    [CardMovement.LEFT]: { frame: 0, desc: "Move one tile to the left." },
    [CardMovement.RIGHT]: { frame: 1, desc: "Move one tile to the right." },
    [CardMovement.UP]: { frame: 2, desc: "Move one tile up." },
    [CardMovement.DOWN]: { frame: 3, desc: "Move one tile down." },
    [CardMovement.NOTHING]: { frame: 4, desc: "Do nothing." },
    [CardMovement.ANY]: { frame: 5, desc: "Move one tile in any direction." },
    [CardMovement.COPY]: { frame: 6, desc: "Copy the same movement as previous card." },
    [CardMovement.TELEPORT]: { frame: 7, desc: "Move in any direction, but jump over the first tile." },
    [CardMovement.MATCH]: { frame: 8, desc: "Move to the closest tile with an icon that matches this card." },
    [CardMovement.INVERT]: { frame: 9, desc: "All directions after this one are inverted. (Ex: RIGHT becomes LEFT.)" },
}

const MOVEMENT_SPECIAL:Record<string, GeneralData> =
{
    score_self_fishlack: { frame: 0, desc: "If your destination tile has no fish, score this card (which is always worth +1 point)." },
    score_self_fish: { frame: 1, desc: "If your destination tile has fishes, score this card instead (which is always worth +1 point)." },
    remove: { frame: 2, desc: "Discard one of your movement cards." },
    draw: { frame: 3, desc: "Draw an extra movement card and insert it anywhere." },
    hand_swap: { frame: 4, desc: "Swap your hand of tiles with those of another player." },
    move_swap: { frame: 5, desc: "Swap one revealed movement card of yours with a revealed movement card of another player." },
    reveal_ultra: { frame: 6, desc: "Reveal 3 movement cards." },
    change_start: { frame: 7, desc: "Move your pawn to any adjacent tile." },
}

const MAP_SPECIAL:Record<string, GeneralData> =
{
    island: { frame: 0, desc: "<b>On Visit</b>: go back to where you came from." },
    tunnel: { frame: 1, desc: "<b>On Visit</b>: instantly move your pawn to a different tunnel (if possible)." },
    return: { frame: 2, desc: "<b>On Visit</b>: return to the starting tile." },
    remove: { frame: 3, desc: "<b>On Play</b>: remove up to 3 map tiles." },
    swap: { frame: 4, desc: "<b>On Play</b>: have 2 map tiles swap places." },
    score: { frame: 5, desc: "<b>On Score</b>: scores %num% points, always." },
    plugholes: { frame: 6, desc: "<b>On Play</b>: plug any holes in the map ( = empty space surrounded) using your hand tiles." },
    pawnmove: { frame: 7, desc: "<b>On Visit</b>: move all player pawns, which are adjacent to you, to another tile." },
    superscore: { frame: 8, desc: "<b>On Score</b>: if you only score tiles of my type, and nothing else, you get +6 points." },
    combo: { frame: 9, desc: "<b>On Score</b>: if you score at least one fish of every type, I am worth +6 points." },
}

const MISC:Record<string, GeneralData> =
{

}

export {
    CardMovement,
    CardType,
    FishType,
    TileAction,
    MISC,
    MOVEMENT_CARDS,
    MOVEMENT_SPECIAL,
    MAP_SPECIAL,
    TILE_ACTIONS
};