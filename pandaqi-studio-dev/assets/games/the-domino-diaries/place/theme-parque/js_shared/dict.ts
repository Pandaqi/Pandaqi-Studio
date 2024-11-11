
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

interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    value?: number,
    set?: string,
    dynamic?: boolean,
    valueDisplay?: number,
    sheetURL?: string,
}

// Attractions are your biggest scorers, but they depend on their queue length (and if it's finished)
// value = its point value (or an indication/guess towards it), 
// but the inverse is also used for probabilities (it appears 1/value percentage, so higher value things appear LESS often)
const ATTRACTIONS:Record<string,GeneralData> =
{
    carousel: { frame: 0, label: "Carousel", desc: "", value: 1, set: "base" },
    swinging_ship: { frame: 1, label: "Swinging Ship", desc: "", value: 2, set: "base" },
    boats: { frame: 2, label: "Log Flume", desc: "If <b>1 Decoration</b> nearby.", value: 3, set: "base" },
    wooden_coaster: { frame: 3, label: "Wooden Coaster", desc: "If <b>2 Decorations</b> nearby.", value: 4, set: "base" },

    ferris_wheel: { frame: 4, label: "Ferris Wheel", desc: "Can be <b>claimed twice</b>.", value: 1, set: "wishneyland" },
    spiral_slide: { frame: 5, label: "Spiral Slide", desc: "If queue <b>longer than 3</b> parts.", value: 2, set: "wishneyland" },
    launch_tower: { frame: 6, label: "Launch Tower", desc: "If nearest scorable item is <b>more than 4 parts away</b>.", value: 3, set: "wishneyland" },
    bumper_cars: { frame: 7, label: "Bumper Cars", desc: "If <b>Queue Rare</b> is used.", value: 4, set: "wishneyland" }, // river rapids? teacups?

    haunted_house: { frame: 8, label: "Haunted House", desc: "<b>Must be claimed</b> when placed.", value: 1, set: "unibearsal" },
    wave_swinger: { frame: 9, label: "Wave Swinger", desc: "If queue <b>shorter than 3</b> parts", value: 2, set: "unibearsal" },
    playground: { frame: 10, label: "Playground", desc: "If connected to <b>Entrance</b> through a regular path.", value: 3, set: "unibearsal" },
    steel_coaster: { frame: 11, label: "Steel Coaster", desc: "If <b>3(+) Decorations nearby</b> its queue.", value: 4, set: "unibearsal" },
}

// "Simpler" scoring methods. Don't need a queue or any other setup, often just a raw number of points with nothing else.
const STALLS:Record<string,GeneralData> = 
{
    toilet: { frame: 0, label: "Toilet", desc: "Worth <b>#Toilets</b> along its nearby path(s).", value: 1, dynamic: true, set: "base" },
    food: { frame: 1, label: "Food Stall", desc: "", value: 2, set: "base" },
    souvenir: { frame: 2, label: "Souvenir Shop", desc: "If <b>no souvenir shop</b> nearby.", value: 3, set: "base" },
    kiosk: { frame: 3, label: "Info Kiosk", desc: "If <b>3(+) regular paths</b> nearby.", value: 4, set: "base" },

    drinks: { frame: 4, label: "Drinks Stall", desc: "If <b>nearby a queue</b>.", value: 1, set: "wishneyland" },
    balloons: { frame: 5, label: "Balloon Shop", desc: "If <b>not nearby</b> a <b>scorable item</b>.", value: 2, set: "wishneyland" },
    photo_booth: { frame: 6, label: "Photo Booth", desc: "Worth <b>half</b> the value of a <b>nearby Attraction</b>.", value: 3, dynamic: true, set: "wishneyland" },
    cash_machine: { frame: 7, label: "Cash Machine", desc: "Worth <b>#Stalls</b> nearby the <b>same path(s)</b> as me.", value: 4, dynamic: true, set: "wishneyland" },

    vending_machine: { frame: 8, label: "Vending Machine", desc: "Worth <b>#Vending Machines</b> nearby.", value: 1, dynamic: true, set: "unibearsal" },
    umbrellas: { frame: 9, label: "Umbrella Stall", desc: "Worth <b>#Pawns</b> nearby.", value: 2, dynamic: true, set: "unibearsal" },
    merchandise: { frame: 10, label: "Merchandise Shop", desc: "When claimed, <b>move any Pawn</b> (even to claimed items).", value: 3, valueDisplay: -4, set: "unibearsal" },
    first_aid: { frame: 11, label: "First Aid Room", desc: "", value: 4, set: "unibearsal" }
}

// Decoration never scores on its own. It fulfills the role of modifier; special actions/changes/abilities to what's around it
const DECORATIONS:Record<string,GeneralData> =
{
    tree: { frame: 0, label: "Tree", desc: "", value: 1, set: "base" },
    dump: { frame: 1, label: "Dump", desc: "Adds <b>-2</b> to each <b>nearby scorable item</b>.", value: 2, set: "base" },
    statue: { frame: 2, label: "Statue", desc: "If <b>nearby a queue</b>, adds <b>+2</b> to its attraction.", value: 3, set: "base" },
    bulldozer: { frame: 3, label: "Bulldozer", desc: "<b>Overlap</b> an existing (unclaimed) tile with this one.", value: 4, set: "base" },

    lantern: { frame: 4, label: "Lantern", desc: "Every <b>nearby path</b> counts as <b>2 paths</b>.", value: 3, set: "wishneyland" },
    rocks: { frame: 5, label: "Rocks", desc: "This turn, <b>only place 1 domino</b>.", value: 2, set: "wishneyland" },
    fountain: { frame: 6, label: "Fountain", desc: "This turn, you <b>must claim</b>. You're allowed to <b>claim twice</b>.", value: 4, set: "wishneyland" },
    flowers: { frame: 7, label: "Flowers", desc: "Adds <b>+2</b> to each <b>nearby scorable item</b>.", value: 1, set: "wishneyland" },

    bin: { frame: 8, label: "Garbage Bin", desc: "If placed <b>nearby a Pawn</b>, it returns to its owner.", value: 4, set: "unibearsal" },
    bench: { frame: 9, label: "Bench", desc: "At turn end, draw <b>2 extra dominoes</b>.", value: 3, set: "unibearsal" },
    office: { frame: 10, label: "Office", desc: "<b>No scorable item</b> can be placed <b>nearby</b> me.", value: 1, set: "unibearsal" },
    sign: { frame: 11, label: "Signpost", desc: "<b>Move</b> or <b>rotate</b> an existing tile.", value: 2, set: "unibearsal" },
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
    score_star_attraction: { frame: 0 },
    tunnel: { frame: 1 },
    bg_dot_texture: { frame: 2 },
    bg_gradient: { frame: 3 },
    entrance: { frame: 4 },
    score_star_stall: { frame: 5 },
    type_icon_attraction: { frame: 6 },
    type_icon_stall: { frame: 7 }
}

const ITEMS =
{
    [ItemType.PATH]: {},
    [ItemType.ATTRACTION]: ATTRACTIONS,
    [ItemType.STALL]: STALLS,
    [ItemType.DECORATION]: DECORATIONS
}

enum EventType
{
    INSTANT = "instant",
    PERMANENT = "permanent"
}

enum EventVibe
{
    GOOD = "good",
    MIXED = "mixed",
    BAD = "bad"
}

const EVENTS = 
{
    // GOOD
    celeb: { desc: "A celebrity visits!", descPower: "Each player may return a used pawn back to them.", vibe: EventVibe.GOOD, type: EventType.INSTANT },
    sunny: { desc: "Sunny skies predicted!", descPower: "Players may place 3 dominoes per turn.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    mascot: { desc: "Your mascot won prizes!", descPower: "Placing a regular path is free.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    festival: { desc: "You organize a festival!", descPower: "Hand size increases by 1.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    recordbreak: { desc: "A ride broke records!", descPower: "Placing a 4-point ride is free.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    groupbooking: { desc: "A large group visited!", descPower: "Dominoes are allowed to overlap.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    newride: { desc: "New ride unveiled!", descPower: "All players may swap 2 hand tiles for new ones.", vibe: EventVibe.GOOD, type: EventType.INSTANT },
    merchandise: { desc: "Merchandise is selling well!", descPower: "Placing a Stall is free.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    theming: { desc: "You received a theming award!", descPower: "Placing a Decoration is free.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    anniversary: { desc: "It's your park's anniversary!", descPower: "You may ignore path matching rules.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    sponsor: { desc: "You found a great sponsor!", descPower: "All player scores are doubled.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    rideup: { desc: "You upgraded a ride!", descPower: "You may mix different queue types.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    tv: { desc: "Your park was on TV!", descPower: "Remove one Event and draw another.", vibe: EventVibe.GOOD, type: EventType.INSTANT },
    groupphoto: { desc: "Someone posted a viral group photo!", descPower: "Items can be claimed infinitely often.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    performance: { desc: "Musicians perform in your queues!", descPower: "Every finished queue is considered twice as long.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    ecofriendly: { desc: "You improve eco-friendly efforts!", descPower: "Dominoes don't need to be separated on your turn.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },

    // BAD
    coasterbreak: { desc: "Ride breakdown!", descPower: "You can't place any Attractions.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    lostchild: { desc: "Lost child!", descPower: "Each round, pick one player to skip their turn.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    thunderstorm: { desc: "Thunderstorm danger!", descPower: "All Attractions don't count.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    foodpois: { desc: "Food poisoning!", descPower: "All Stalls don't count.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    mascotbad: { desc: "Mascot costume lost!", descPower: "You can't claim.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    vandalism: { desc: "Vandalism!", descPower: "Remove 2 dominoes from the park.", vibe: EventVibe.BAD, type: EventType.INSTANT },
    accident: { desc: "A serious ride accident!", descPower: "All Attraction/Stall scores get -1.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    strike: { desc: "Your employees go on strike!", descPower: "You must play only 1 domino per turn.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    overcrowding: { desc: "Your park is overcrowded!", descPower: "All Decoration doesn't count.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    hauntedride: { desc: "Your park's haunted!", descPower: "Players must draw a deck domino and try to place it first.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    waittimes: { desc: "Wait times are too long!", descPower: "You can't make queues longer than 2 spaces.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    lostfound: { desc: "The Lost & Found overflows!", descPower: "Hand size reduces by 1", vibe: EventVibe.BAD, type: EventType.INSTANT },
    outage: { desc: "A power outage!", descPower: "All paths must always match.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    delay: { desc: "New ride delayed!", descPower: "You can't finish queues shorter than 3 spaces.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    rainy: { desc: "Heavy rains flood the paths!", descPower: "You can't place regular paths anymore.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    pricehike: { desc: "A major price hike!", descPower: "All player scores are halved (rounded down).", vibe: EventVibe.BAD, type: EventType.PERMANENT },

    // MIXED
    inspection: { desc: "A surprise inspection!", descPower: "Remove 1 domino for every unfinished queue.", vibe: EventVibe.MIXED, type: EventType.INSTANT },
    proposal: { desc: "A visitor proposes in your park!", descPower: "Pick two players. They share their hand tiles.", vibe: EventVibe.MIXED, type: EventType.PERMANENT },
    earthquake: { desc: "Oh no, an earthquake!", descPower: "Instead of placing, you may move a domino.", vibe: EventVibe.MIXED, type: EventType.PERMANENT },
    unplanned: { desc: "An unplanned VIP visit!", descPower: "Pick a different start player; it's now their turn.", vibe: EventVibe.MIXED, type: EventType.INSTANT },
    nothing: { desc: "Nothing special!", descPower: "", vibe: EventVibe.MIXED, type: EventType.PERMANENT },
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
    GeneralData,

    EVENTS,
    EventVibe,
    EventType
}