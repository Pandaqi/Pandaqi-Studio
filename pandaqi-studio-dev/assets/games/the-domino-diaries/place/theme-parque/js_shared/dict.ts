
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
    COASTER = "coaster"
}

// Attractions are your biggest scorers, but they depend on their queue length (and if it's finished)
// value = its point value (or an indication/guess towards it), 
// but the inverse is also used for probabilities (it appears 1/value percentage, so higher value things appear LESS often)
const ATTRACTIONS =
{
    carousel: { frame: 0, desc: "", value: 1, set: "base" },
    swinging_ship: { frame: 1, desc: "", value: 2, set: "base" },
    boats: { frame: 2, desc: "If <b>1 Decoration</b> nearby.", value: 3, set: "base" },
    wooden_coaster: { frame: 3, desc: "If <b>2 Decoration</b> nearby.", value: 4, set: "base" },

    ferris_wheel: { frame: 4, desc: "Can be <b>claimed twice</b>.", value: 1, set: "wishneyland" },
    spiral_slide: { frame: 5, desc: "If queue <b>longer than 3</b> parts.", value: 2, set: "wishneyland" },
    launch_tower: { frame: 6, desc: "If nearest scorable item is <b>more than 4 parts away</b>.", value: 3, set: "wishneyland" },
    bumper_cars: { frame: 7, desc: "If <b>Queue Rare</b> is used.", value: 4, set: "wishneyland" }, // river rapids? teacups?

    haunted_house: { frame: 8, desc: "<b>Must be claimed</b> when placed.", value: 1, set: "unibearsal" },
    wave_swinger: { frame: 9, desc: "If queue <b>shorter than 3</b> parts", value: 2, set: "unibearsal" },
    playground: { frame: 10, desc: "If connected to <b>Entrance</b> through a regular path.", value: 3, set: "unibearsal" },
    steel_coaster: { frame: 11, desc: "If <b>3(+) decorations adjacent</b> to its queue.", value: 4, set: "unibearsal" },
}

// "Simpler" scoring methods. Don't need a queue or any other setup, often just a raw number of points with nothing else.
const STALLS = 
{
    toilet: { frame: 0, desc: "Worth <b>#Toilets</b> along its adjacent path(s).", value: 1, dynamic: true, set: "base" },
    food: { frame: 1, desc: "", value: 2, set: "base" },
    souvenir: { frame: 2, desc: "If <b>no souvenir shop</b> nearby.", value: 3, set: "base" },
    kiosk: { frame: 3, desc: "If <b>3(+) regular paths</b> adjacent.", value: 4, set: "base" },

    drinks: { frame: 4, desc: "If <b>adjacent to queue</b>.", value: 1, set: "wishneyland" },
    balloons: { frame: 5, desc: "If <b>not adjacent</b> to a <b>scorable item</b>.", value: 2, set: "wishneyland" },
    photo_booth: { frame: 6, desc: "Worth <b>half</b> the value of an <b>adjacent attraction</b>.", value: 3, dynamic: true, set: "wishneyland" },
    cash_machine: { frame: 7, desc: "Worth <b>#Stalls</b> adjacent to the <b>same path(s)</b> as me.", value: 4, dynamic: true, set: "wishneyland" },

    vending_machine: { frame: 8, desc: "Worth <b>#Vending Machines</b> nearby.", value: 1, dynamic: true, set: "unibearsal" },
    umbrellas: { frame: 9, desc: "Worth <b>#Pawns</b> nearby.", value: 2, dynamic: true, set: "unibearsal" },
    merchandise: { frame: 10, desc: "When claimed, <b>move any Pawn</b> (even to claimed items).", value: 3, valueDisplay: -4, set: "unibearsal" },
    first_aid: { frame: 11, desc: "", value: 4, set: "unibearsal" }
}

// Decoration never scores on its own. It fulfills the role of modifier; special actions/changes/abilities to what's around it
const DECORATIONS =
{
    tree: { frame: 0, desc: "", value: 1, set: "base" },
    dump: { frame: 1, desc: "Adds <b>-2</b> to each <b>adjacent scorable item</b>.", value: 2, set: "base" },
    statue: { frame: 2, desc: "If <b>adjacent to queue</b>, adds <b>+2</b> to its attraction.", value: 3, set: "base" },
    bulldozer: { frame: 3, desc: "This turn, you may <b>overlap</b> existing tiles.", value: 4, set: "base" },

    lantern: { frame: 4, desc: "Every <b>adjacent path</b> counts as <b>2 paths</b>.", value: 3, set: "wishneyland" },
    rocks: { frame: 5, desc: "This turn, <b>only place 1 domino</b>.", value: 2, set: "wishneyland" },
    fountain: { frame: 6, desc: "This turn, you <b>must claim</b>. You're allowed to <b>claim twice</b>.", value: 4, set: "wishneyland" },
    flowers: { frame: 7, desc: "Adds <b>+2</b> to each <b>adjacent scorable item</b>.", value: 1, set: "wishneyland" },

    bin: { frame: 8, desc: "If placed <b>adjacent to Pawn</b>, it returns to its owner.", value: 4, set: "unibearsal" },
    bench: { frame: 9, desc: "At turn end, draw <b>2 extra dominoes</b>.", value: 3, set: "unibearsal" },
    office: { frame: 10, desc: "<b>No scorable item</b> can be placed <b>adjacent</b> to me.", value: 1, set: "unibearsal" },
    sign: { frame: 11, desc: "<b>Move</b> or <b>rotate</b> an existing tile.", value: 2, set: "unibearsal" },
}

const PATHS_ORDER = [PathType.REGULAR, PathType.QUEUE1, PathType.QUEUE2];
const PATHS =
{
    deadend: { frame: 0, sides: [true, false, false, false], value: 5 },
    corner: { frame: 1, sides: [true, true, false, false], value: 1 },
    straight: { frame: 2, sides: [true, false, true, false], value: 1 },
    tsplit: { frame: 3, sides: [true, true, true, false], value: 3 },
    all: { frame: 4, sides: [true, true, true, true], value: 4 }
}

const COASTER_PARTS =
{
    station: { frame: 15, sides: [true, false, true, false], value: 2 },
    straight: { frame: 16, sides: [true, false, true, false], value: 1 },
    corner: { frame: 17, sides: [true, true, false, false], value: 1 },
    tunnel: { frame: 18, sides: [false, false, true, false], value: 2.5 }
}

const MISC =
{
    score_star: { frame: 0 },
    tunnel: { frame: 1 },
    bg_dot_texture: { frame: 2 },
    bg_gradient: { frame: 3 },
    entrance: { frame: 4 }
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
    PATHS_ORDER,
    ITEMS,
    COASTER_PARTS,
    ItemType,
    DominoType,
    PathType,
}