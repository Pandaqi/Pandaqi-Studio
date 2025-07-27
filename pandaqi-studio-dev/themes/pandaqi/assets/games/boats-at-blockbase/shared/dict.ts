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
    rot?: number,
    desc?: string,
    maxNum?: number,
    canHaveSpecial?: boolean,

    label?: string,
    angled?: boolean,
    rotation?: number,
}

const TILE_ACTIONS:Record<TileAction, GeneralData> =
{
    [TileAction.REVEAL]: { frame: 0, label: "Reveal", desc: "Reveal a card at position indicated.", maxNum: 8 }, // it modulates the action number to be between 0-(maxNum-1)
    [TileAction.SWAP]: { frame: 1, label: "Swap", desc: "Swap the movement card at the position indicated with another.", maxNum: 8 },
    [TileAction.STUDY]: { frame: 3, label: "Study", desc: "Secretly look at the number of movement cards indicated.", maxNum: 3 }
}

const MOVEMENT_CARDS:Record<CardMovement, GeneralData> =
{
    [CardMovement.LEFT]: { frame: 0, label: "Left", desc: "Move one tile to the <b>left</b>.", angled: true, rot: Math.PI, canHaveSpecial: true },
    [CardMovement.RIGHT]: { frame: 2, label: "Right", desc: "Move one tile to the <b>right</b>.", angled: true, rot: 0, canHaveSpecial: true },
    [CardMovement.UP]: { frame: 4, label: "Up", desc: "Move one tile <b>up</b>.", angled: true, rot: -0.5*Math.PI, canHaveSpecial: true },
    [CardMovement.DOWN]: { frame: 6, label: "Down", desc: "Move one tile <b>down</b>.", angled: true, rot: 0.5*Math.PI, canHaveSpecial: true },
    [CardMovement.NOTHING]: { frame: 8, label: "None", desc: "Do nothing." },
    [CardMovement.ANY]: { frame: 10, label: "Any", desc: "Move one tile in <b>any direction</b>.", canHaveSpecial: true },
    [CardMovement.COPY]: { frame: 12, label: "Copy", desc: "<b>Copy</b> the same movement as the <b>previous card</b>." },
    [CardMovement.TELEPORT]: { frame: 14, label: "Jump", desc: "Move in <b>any direction</b>, but <b>jump</b> over the first tile." },
    [CardMovement.MATCH]: { frame: 16, label: "Match", desc: "Move to the <b>closest tile</b> with an icon that <b>matches</b> this card.", angled: true },
    [CardMovement.INVERT]: { frame: 18, label: "Invert", desc: "All directions after this one are <b>inverted</b>. (Ex: RIGHT becomes LEFT.)" },
}

const MOVEMENT_SPECIAL:Record<string, GeneralData> =
{
    score_self_fishlack: { frame: 0, label: "Fishless", desc: "If your destination tile has <b>no fish</b>, <b>score</b> this card (worth +1 point)." },
    score_self_fish: { frame: 1, label: "Fishful", desc: "If your destination tile <b>has fishes</b>, <b>score</b> this card instead (worth +1 point)." },
    remove: { frame: 2, label: "Remove", desc: "<b>Discard</b> one of your movement cards." },
    draw: { frame: 3, label: "Draw", desc: "<b>Draw</b> an extra movement card and insert it anywhere." },
    hand_swap: { frame: 4, label: "Hand Swap", desc: "<b>Swap</b> your hand of tiles with those of another player." },
    move_swap: { frame: 5, label: "Move Swap", desc: "<b>Swap</b> two revealed <b>movement cards</b>." },
    reveal_ultra: { frame: 6, label: "Ultra Reveal", desc: "<b>Reveal</b> 3 movement cards." },
    change_start: { frame: 7, label: "Change Start", desc: "<b>Move</b> your pawn to <b>any adjacent tile</b>." },
}

const MAP_SPECIAL:Record<string, GeneralData> =
{
    island: { frame: 0, label: "Island", desc: "<b>On Visit</b>: go back to where you came from." },
    tunnel: { frame: 1, label: "Tunnel", desc: "<b>On Visit</b>: instantly move your pawn to a different Tunnel (if possible)." },
    return: { frame: 2, label: "Go Home", desc: "<b>On Visit</b>: return to the starting tile." },
    remove: { frame: 3, label: "Destructor", desc: "<b>On Play</b>: remove up to 3 map tiles." },
    swap: { frame: 4, label: "Swapper", desc: "<b>On Play</b>: have 2 map tiles swap places." },
    score: { frame: 5, label: "Score", desc: "<b>On Score</b>: scores %num% points, always." },
    plugholes: { frame: 6, label: "Corker", desc: "<b>On Play</b>: plug any holes in the map ( = empty space surrounded) using your hand tiles." },
    pawnmove: { frame: 7, label: "Teleporter", desc: "<b>On Visit</b>: move all player pawns, which are adjacent to you, to another tile." },
    superscore: { frame: 8, label: "Superscore", desc: "<b>On Score</b>: if you only score tiles of my type, and nothing else, you get +6 points." },
    combo: { frame: 9, label: "Combo", desc: "<b>On Score</b>: if you score at least one fish of every type, I am worth +6 points." },
}

const MISC:Record<string, GeneralData> =
{
    action_reveal: { frame: 0 },
    action_swap: { frame: 1 },
    action_study: { frame: 2 },
    pawn_0: { frame: 3 },
    pawn_1: { frame: 4 },
    pawn_2: { frame: 5 },
    sonar: { frame: 6 },
    tile_corner: { frame: 7 },
    [FishType.FISH1]: { frame: 8 }, // the outline for each fish is its frame + 4
    [FishType.FISH2]: { frame: 9 },
    [FishType.FISH3]: { frame: 10 },
    [FishType.FISH4]: { frame: 11 },
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