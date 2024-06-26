
enum DominoType
{
    REGULAR = "regular",
    PAWN = "pawn"
}

enum ItemType
{
    PATH = "path",
    ATTRACTION = "attraction",
    STALL = "stall",
    DECORATION = "decoration"
}

enum PathType
{
    REGULAR = "regular",
    QUEUE1 = "queue1",
    QUEUE2 = "queue2",
    ATTRACTION = "attraction"
}

enum CoasterType
{
    STATION = "station",
    STRAIGHT = "straight",
    CURVE = "curve"
}


// Attractions are your biggest scorers, but they depend on their queue length (and if it's finished)
// value = its point value (or an indication/guess towards it), 
// but the inverse is also used for probabilities (it appears 1/value percentage, so higher value things appear LESS often)
const ATTRACTIONS =
{
    carousel: { frame: 0, desc: "", value: 1, set: "base" },
    swinging_ship: { frame: 1, desc: "", value: 2, set: "base" },
    boats: { frame: 2, desc: "If 1 Decoration nearby.", value: 3, set: "base" },
    wooden_coaster: { frame: 3, desc: "If 2 Decoration nearby.", value: 4, set: "base" },

    ferris_wheel: { frame: 4, desc: "Can be claimed twice.", value: 1, set: "wishneyland" },
    teacups: { frame: 5, desc: "If queue longer than 4 parts.", value: 2, set: "wishneyland" }, // spiral slide? bumper cars?
    launch_tower: { frame: 6, desc: "If nearest scorable item is more than 4 parts away.", value: 3, set: "wishneyland" },
    river_rapids: { frame: 7, desc: "If Queue Rare is used.", value: 4, set: "wishneyland" },

    haunted_house: { frame: 8, desc: "Must be claimed when placed.", value: 1, set: "unibearsal" },
    wave_swinger: { frame: 9, desc: "If queue shorter than 5 parts", value: 2, set: "unibearsal" },
    enterprise: { frame: 10, desc: "If nearest attraction is more than 4 parts away.", value: 3, set: "unibearsal" },
    steel_coaster: { frame: 11, desc: "If 3(+) decorations adjacent to its queue.", value: 4, set: "unibearsal" },
}

// "Simpler" scoring methods. Don't need a queue or any other setup, often just a raw number of points with nothing else.
const STALLS = 
{
    toilet: { frame: 0, desc: "Worth the number of toilets along its adjacent path(s).", value: 1, dynamic: true, set: "base" },
    food: { frame: 1, desc: "", value: 2, set: "base" },
    souvenir: { frame: 2, desc: "If no souvenir shop nearby.", value: 3, set: "base" },
    kiosk: { frame: 3, desc: "Must be next to a regular path.", value: 4, set: "base" },

    drinks: { frame: 4, desc: "If adjacent to a queue.", value: 1, set: "wishneyland" },
    balloons: { frame: 5, desc: "If not adjacent to a scorable item.", value: 2, set: "wishneyland" },
    photo_booth: { frame: 6, desc: "Worth half the value of the highest-scoring adjacent attraction.", value: 3, dynamic: true, set: "wishneyland" },
    cash_machine: { frame: 7, desc: "Worth the number of Stalls adjacent to the same path(s) as this one.", value: 4, dynamic: true, set: "wishneyland" },

    vending_machine: { frame: 8, desc: "Worth the number of vending machines nearby.", value: 1, dynamic: true, set: "unibearsal" },
    umbrellas: { frame: 9, desc: "Worth the number of Pawns nearby.", value: 2, dynamic: true, set: "unibearsal" },
    merchandise: { frame: 10, desc: "When claimed, you may move any Pawn, even to an item that's already claimed.", value: 3, valueDisplay: -4, set: "unibearsal" },
    first_aid: { frame: 11, desc: "", value: 4, set: "unibearsal" }
}

// Decoration never scores on its own. It fulfills the role of modifier; special actions/changes/abilities to what's around it
const DECORATIONS =
{
    tree: { frame: 0, desc: "", value: 1, set: "base" },
    dump: { frame: 1, desc: "Adds -1 to each adjacent scorable item.", value: 2, set: "base" },
    statue: { frame: 2, desc: "If next to a queue, adds +1 point to the Attraction it belongs to.", value: 3, set: "base" },
    bulldozer: { frame: 3, desc: "This turn, you may overlap existing tiles (as long as placement is valid)", value: 4, set: "base" },

    lantern: { frame: 4, desc: "Every adjacent path counts as 2 paths.", value: 3, set: "wishneyland" },
    rocks: { frame: 5, desc: "You can only place 1 domino this turn.", value: 2, set: "wishneyland" },
    fountain: { frame: 6, desc: "You must claim this turn. But you're allowed to claim twice.", value: 4, set: "wishneyland" },
    flowers: { frame: 7, desc: "Adds +1 value to each adjacent scorable item.", value: 1, set: "wishneyland" },

    bin: { frame: 8, desc: "When placed next to a Pawn, it returns to its owner.", value: 4, set: "unibearsal" },
    bench: { frame: 9, desc: "Draw 2 extra dominoes at the end of your turn.", value: 3, set: "unibearsal" },
    office: { frame: 10, desc: "No scorable item can be placed adjacent to me.", value: 1, set: "unibearsal" },
    sign: { frame: 11, desc: "Move or rotate an existing tile (as long as placement is valid)", value: 2, set: "unibearsal" },
}

const PATHS =
{
    deadend: { frame: 0, sides: [true, false, false, false], value: 5 },
    corner: { frame: 1, sides: [true, true, false, false], value: 1 },
    straight: { frame: 2, sides: [true, false, true, false], value: 1 },
    tsplit: { frame: 3, sides: [true, true, true, false], value: 3 },
    all: { frame: 4, sides: [true, true, true, true], value: 4 }
}

const MISC =
{
    score_star: { frame: 0 },
    tunnel: { frame: 1 }
}

const ITEMS =
{
    [ItemType.PATH]: {},
    [ItemType.ATTRACTION]: ATTRACTIONS,
    [ItemType.STALL]: STALLS,
    [ItemType.DECORATION]: DECORATIONS
}

export
{
    ATTRACTIONS,
    STALLS,
    DECORATIONS,
    MISC,
    PATHS,
    ITEMS,
    ItemType,
    DominoType,
    PathType,
    CoasterType
}