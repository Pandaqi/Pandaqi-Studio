
export enum DominoType
{
    REGULAR = "regular",
    PAWN = "pawn",
    EVENT = "event"
}

export enum ItemType
{
    PATH = "path",
    ATTRACTION = "attraction",
    STALL = "stall",
    DECORATION = "decoration"
}

export enum PathType
{
    REGULAR = "regular",
    QUEUE1 = "queue1",
    QUEUE2 = "queue2",
    COASTER = "coaster"
}

export interface GeneralData
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
export const ATTRACTIONS:Record<string,GeneralData> =
{
    carousel: { frame: 0, label: "Carousel", desc: "", value: 1, set: "base" },
    swinging_ship: { frame: 1, label: "Swinging Ship", desc: "", value: 2, set: "base" },
    boats: { frame: 2, label: "Log Flume", desc: "If <b>1 Decoration</b> nearby.", value: 3, set: "base" },
    wooden_coaster: { frame: 3, label: "Wooden Coaster", desc: "If <b>2 Decorations</b> nearby.", value: 4, set: "base" },

    ferris_wheel: { frame: 4, label: "Ferris Wheel", desc: "Can be <b>claimed twice</b>.", value: 1, set: "wishneyland" },
    spiral_slide: { frame: 5, label: "Spiral Slide", desc: "If queue <b>longer than 3</b> spaces.", value: 2, set: "wishneyland" },
    launch_tower: { frame: 6, label: "Launch Tower", desc: "If nearest scorable item is <b>more than 4 spaces away</b>.", value: 3, set: "wishneyland" },
    bumper_cars: { frame: 7, label: "Bumper Cars", desc: "If <b>Queue Rare</b> is used.", value: 4, set: "wishneyland" }, // river rapids? teacups?

    haunted_house: { frame: 8, label: "Haunted House", desc: "<b>Must be claimed</b> when placed.", value: 1, set: "unibearsal" },
    wave_swinger: { frame: 9, label: "Wave Swinger", desc: "If queue <b>shorter than 3</b> spaces.", value: 2, set: "unibearsal" },
    playground: { frame: 10, label: "Playground", desc: "If connected to <b>Entrance</b> through a regular path.", value: 3, set: "unibearsal" },
    steel_coaster: { frame: 11, label: "Steel Coaster", desc: "If <b>3(+) Decorations nearby</b> its queue.", value: 4, set: "unibearsal" },
}

// "Simpler" scoring methods. Don't need a queue or any other setup, often just a raw number of points with nothing else.
export const STALLS:Record<string,GeneralData> = 
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
export const DECORATIONS:Record<string,GeneralData> =
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

export const PATHS_ORDER = [PathType.REGULAR, PathType.QUEUE1, PathType.QUEUE2];
export const PATHS =
{
    deadend: { frame: 0, sides: [true, false, false, false], value: 5 },
    corner: { frame: 1, sides: [true, true, false, false], value: 1 },
    straight: { frame: 2, sides: [true, false, true, false], value: 1 },
    tsplit: { frame: 3, sides: [true, true, true, false], value: 3 },
    all: { frame: 4, sides: [true, true, true, true], value: 4 }
}

export const COASTER_PARTS =
{
    station: { frame: 15, sides: [true, false, true, false], value: 2 },
    straight: { frame: 16, sides: [true, false, true, false], value: 1 },
    corner: { frame: 17, sides: [true, true, false, false], value: 1 },
    tunnel: { frame: 18, sides: [false, false, true, false], value: 2.5 }
}

export const MISC =
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

export const ITEMS =
{
    [ItemType.PATH]: {},
    [ItemType.ATTRACTION]: ATTRACTIONS,
    [ItemType.STALL]: STALLS,
    [ItemType.DECORATION]: DECORATIONS
}

export enum EventType
{
    INSTANT = "instant",
    PERMANENT = "permanent"
}

export enum EventVibe
{
    GOOD = "good",
    MIXED = "mixed",
    BAD = "bad"
}

export interface EventData
{
    desc?: string,
    descPower?: string,
    vibe?: EventVibe,
    type?: EventType,
    prob?: number
}

export const EVENTS:Record<string,EventData> = 
{
    // GOOD
    celeb: { desc: "A celebrity visits!", descPower: "Each player may <b>return a used pawn</b> back to them.", vibe: EventVibe.GOOD, type: EventType.INSTANT },
    sunny: { desc: "Sunny skies predicted!", descPower: "Players may <b>place 3 dominoes</b> per turn.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    mascot: { desc: "Your mascot won prizes!", descPower: "Placing a regular <b>path</b> is <b>free</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    festival: { desc: "You organize a festival!", descPower: "<b>Hand size</b> increases by <b>1</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    recordbreak: { desc: "A ride broke records!", descPower: "Placing a <b>4-point ride</b> is <b>free</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    groupbooking: { desc: "A large group visited!", descPower: "Dominoes are allowed to <b>overlap</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    newride: { desc: "New ride unveiled!", descPower: "All players may <b>swap 2 hand tiles</b> for new ones.", vibe: EventVibe.GOOD, type: EventType.INSTANT },
    merchandise: { desc: "Merchandise is selling well!", descPower: "Placing a <b>Stall</b> is <b>free</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    theming: { desc: "You received a theming award!", descPower: "Placing a <b>Decoration</b> is <b>free</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    anniversary: { desc: "It's your park's anniversary!", descPower: "You may <b>ignore path matching</b> rules.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    sponsor: { desc: "You found a great sponsor!", descPower: "All player <b>scores</b> are <b>doubled</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    rideup: { desc: "You upgraded a ride!", descPower: "You may <b>mix</b> different <b>queue types</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    tv: { desc: "Your park was on TV!", descPower: "<b>Remove 1 Event</b> and draw another.", vibe: EventVibe.GOOD, type: EventType.INSTANT },
    groupphoto: { desc: "Someone posted a viral group photo!", descPower: "Items can be <b>claimed infinitely often</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    performance: { desc: "Musicians perform in your queues!", descPower: "Every <b>finished queue</b> is considered <b>twice as long</b>.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },
    ecofriendly: { desc: "You improve eco-friendly efforts!", descPower: "Dominoes <b>don't</b> need to be <b>separated</b> on your turn.", vibe: EventVibe.GOOD, type: EventType.PERMANENT },

    // BAD
    coasterbreak: { desc: "Ride breakdown!", descPower: "You <b>can't place</b> any <b>Attractions</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    lostchild: { desc: "Lost child!", descPower: "This round, pick one player to <b>skip</b> their turn.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    thunderstorm: { desc: "Thunderstorm danger!", descPower: "<b>Ignore</b> all <b>Attractions</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    foodpois: { desc: "Food poisoning!", descPower: "<b>Ignore</b> all <b>Stalls</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    mascotbad: { desc: "Mascot costume lost!", descPower: "Players <b>can't claim</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    vandalism: { desc: "Oh no, vandalism!", descPower: "<b>Remove 2 dominoes</b> from the park.", vibe: EventVibe.BAD, type: EventType.INSTANT },
    accident: { desc: "A serious ride accident!", descPower: "The <b>score</b> of all items goes <b>-1</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    strike: { desc: "Your employees go on strike!", descPower: "You <b>must play</b> only <b>1 domino</b> per turn.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    overcrowding: { desc: "Your park is overcrowded!", descPower: "<b>Ignore</b> all <b>Decoration</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    hauntedride: { desc: "Your park's haunted!", descPower: "The start player must <b>draw a domino from deck</b> first and try to place that.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    waittimes: { desc: "Wait times are too long!", descPower: "You <b>can't</b> make queues longer than <b>2 spaces</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    lostfound: { desc: "The Lost & Found overflows!", descPower: "<b>Hand size</b> reduces by <b>1</b>.", vibe: EventVibe.BAD, type: EventType.INSTANT },
    outage: { desc: "A power outage!", descPower: "<b>All paths</b> must always <b>match</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    delay: { desc: "New ride delayed!", descPower: "You <b>can't</b> finish queues shorter than <b>3 spaces</b>.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    rainy: { desc: "Heavy rains flood the paths!", descPower: "You <b>can't place regular paths</b> anymore.", vibe: EventVibe.BAD, type: EventType.PERMANENT },
    pricehike: { desc: "A major price hike!", descPower: "All total <b>player scores</b> are <b>halved</b> (rounded down).", vibe: EventVibe.BAD, type: EventType.PERMANENT },

    // MIXED
    inspection: { desc: "A surprise inspection!", descPower: "<b>Remove 1 domino</b> for every <b>unfinished queue</b>.", vibe: EventVibe.MIXED, type: EventType.INSTANT },
    proposal: { desc: "A visitor proposes in your park!", descPower: "Pick two players. They <b>share</b> their hand tiles.", vibe: EventVibe.MIXED, type: EventType.PERMANENT },
    earthquake: { desc: "Oh no, an earthquake!", descPower: "Instead of placing, you may <b>move</b> a domino.", vibe: EventVibe.MIXED, type: EventType.PERMANENT },
    unplanned: { desc: "An unplanned VIP visit!", descPower: "Pick a <b>different start player</b>; it's now their turn.", vibe: EventVibe.MIXED, type: EventType.INSTANT },
    nothing: { desc: "Nothing special!", descPower: "", vibe: EventVibe.MIXED, type: EventType.PERMANENT, prob: 4 },
}

export enum ChallengeType
{
    WIN = "win",
    LOSE = "lose"
}

export interface ChallengeData
{
    desc?: string,
    value?: number, // default = 1
    type?: ChallengeType,
    sets?: string[] // default = ["base"]
    numScale?: number[],
    prob?: number
}

// @NOTE: most of these have multiple variants (with higher numbers = higher difficulty); it picks randomly, the event score calculator automatically assigns a higher score if it picked a higher index.
//@IDEA: Add a few Challenges that SCALE with player count/map size/general scores?
export const CHALLENGES:Record<string,ChallengeData> =
{
    // WIN
    player_score: { desc: "The <b>%playerextreme%</b> player has <b>%num%(+) points</b>.", numScale: [4,6,10], type: ChallengeType.WIN },
    player_score_relative: { desc: "All <b>player scores</b> are within <b>%num% points</b> of each other.", numScale: [2,4,6], type: ChallengeType.WIN },
    attraction_score: { desc: "An Attraction scores <b>%num%(+) points</b>.", numScale: [4,6,10], type: ChallengeType.WIN },
    item_num: { desc: "There are <b>%num%(+) %item%s</b>.", numScale: [2,4,6], type: ChallengeType.WIN },
    queue_length: { desc: "A queue is <b>%num%(+) spaces</b> long.", numScale: [2,4,6], type: ChallengeType.WIN },
    queue_num: { desc: "The park has <b>%num%(+) finished queues</b>.", numScale: [2,4,6], type: ChallengeType.WIN },
    queue_num_specific: { desc: "The park has <b>%num%(+) finished queues</b> of type %queue%.", numScale: [1,2,3], type: ChallengeType.WIN },
    path_connected: { desc: "There's a <b>connected (regular) path</b> of <b>%num%(+) spaces</b>.", numScale: [3,6,9], type: ChallengeType.WIN },
    pawns_used: { desc: "A player has <b>used %num% pawns</b>.", numScale: [2,3], type: ChallengeType.WIN },
    nearby_check: { desc: "There's an %item% with <b>no %nearbytype% nearby</b>.", type: ChallengeType.WIN },
    connectiveness: { desc: "<b>Every %item%</b> is <b>connected</b> to the Entrance by paths.", type: ChallengeType.WIN },
    queue_multi: { desc: "There's an Attraction with <b>multiple finished queues</b>.", type: ChallengeType.WIN },
    surrounded: { desc: "There's an <b>%item%</b> that only has <b>paths and queues nearby</b>.", type: ChallengeType.WIN },
    row: { desc: "There's a <b>row</b> with <b>%num%(+) %item%s</b>.", numScale: [2,3,4,5], type: ChallengeType.WIN },
    item_group: { desc: "There's a group of adjacent <b>%item%s</b> of <b>%num%(+) size.", numScale: [2,3,4,5], type: ChallengeType.WIN },
    multi_claim: { desc: "One player has claimed <b>%num%(+)</b> of the same scorable item.", numScale: [2,3], type: ChallengeType.WIN },
    all_score: { desc: "All %itemscorable%s <b>score points</b>.", type: ChallengeType.WIN },
    row_type: { desc: "<b>%num%(+) %itemscorable%s</b> of the <b>same type</b> are on the same <b>row</b>.", numScale: [2,3], type: ChallengeType.WIN },
    distance_type: { desc: "Two %itemscorable%s of the <b>same type</b> are within <b>%num%(-) spaces</b> of one another.", numScale: [1,2,3,4,5], type: ChallengeType.WIN },
    map_size: { desc: "One <b>side</b> of the park map is <b>%num%(+) tiles long</b>.", numScale: [5,8,10], type: ChallengeType.WIN },
    score_extreme_low: { desc: "The <b>worst-scoring %itemscorable%</b> scores <b>%num%(+) points</b>.", numScale: [2,3,4], type: ChallengeType.WIN },
    score_extreme_high: { desc: "The <b>best-scoring %itemscorable%</b> scores <b>%num%(+) points</b> more than the worst-scoring.", numScale: [3,5,7], type: ChallengeType.WIN },
    tunnel_good: { desc: "Two <b>Tunnels</b> are <b>nearby</b>, <b>connected</b> by regular path, or in the <b>same row</b>.", type: ChallengeType.WIN },
    start_player_ranking: { desc: "The <b>Start Player</b> has is the <b>%extreme%-scoring player</b>.", type: ChallengeType.WIN },
    pawns_adjacent: { desc: "<b>%num%(+) Pawns</b> are nearby another pawn.", numScale: [2,4,6], type: ChallengeType.WIN },

    // LOSE
    attraction_score_too_low: { desc: "A claimed Attraction scores <b>%num%(-) points</b>.", numScale: [1,2,3], type: ChallengeType.LOSE },
    queue_too_short: { desc: "A finished queue is <b>%num%(-) spaces</b> long.", numScale: [1,2,3], type: ChallengeType.LOSE },
    entrance_unconnected: { desc: "The <b>entrance domino</b> has an <b>unconnected edge</b>.", type: ChallengeType.LOSE },
    player_score_bad: { desc: "A player has <b>%num%(-) points</b>.", numScale: [0,2,4,6], type: ChallengeType.LOSE },
    pawns_used_bad: { desc: "A player has <b>not claimed anything</b> yet.", type: ChallengeType.LOSE },
    pawns_not_used_bad: { desc: "No player has <b>claimed</b> this round.", type: ChallengeType.LOSE },
    queue_lacking: { desc: "The park has <b>no finished queue</b> of one type.", type: ChallengeType.LOSE },
    holes_penalty: { desc: "The park has <b>%num%(+) holes</b>. (Gap in map that's surrounded on all sides.)", numScale: [1,2,3,4,5], type: ChallengeType.LOSE },
    scoreless_claim: { desc: "An Attraction is <b>claimed</b> but currently <b>doesn't score</b>.", type: ChallengeType.LOSE },
    score_imbalance: { desc: "There are more scorable items that <b>don't score points</b> than ones that <b>do</b>.", type: ChallengeType.LOSE },
    claim_imbalance: { desc: "There are <b>fewer Pawns</b> on the map than the <b>longest side of the map</b>.", type: ChallengeType.LOSE },
    score_extreme_bad: { desc: "The <b>%extreme%-scoring %item%</b> scores <b>%num%(-) points</b>.", numScale: [0,1,2], type: ChallengeType.LOSE },
    tunnel_bad: { desc: "There's a <b>Tunnel domino</b> with an <b>unconnected edge</b>.", type: ChallengeType.LOSE },
    challenges_num: { desc: "There are <b>%num%(+) uncompleted challenges</b>.", numScale: [4,5,6], type: ChallengeType.LOSE },

    // EXPANSIONS
    // > Wishneyland
    ferris_wheel_bad: { desc: "A <b>Ferris Wheel</b> is claimed <b>twice</b>.", type: ChallengeType.LOSE, sets: ["wishneyland"] },
    lantern_drinks_bad: { desc: "A <b>Lantern</b> or <b>Drinks Stall</b> <b>isn't nearby</b> any path.", type: ChallengeType.LOSE, sets: ["wishneyland"] },
    
    // > Unibearsal
    haunted_bad: { desc: "Your park has <b>multiple Haunted Houses</b>.", type: ChallengeType.LOSE, sets: ["unibearsal"] },
    vending_umbrella_bad: { desc: "A <b>Vending Machine</b> or <b>Umbrella Stall</b> is <b>worth nothing</b>.", type: ChallengeType.LOSE, sets: ["unibearsal"] },

    // > Rollercoaster
    rollercoaster_finished: { desc: "The park has a <b>finished Rollercoaster</b>", type: ChallengeType.WIN, sets: ["rollercoasters"] },
    rollercoaster_score: { desc: "Someone scores <b>%num%(+) points</b> from a <b>Rollercoaster</b> ", numScale: [2,4,6,8], type: ChallengeType.WIN, sets: ["rollercoasters"] },
    rollercoaster_queue: { desc: "A <b>Rollercoaster</b> has a <b>queue</b> of <b>%num%(+) spaces</b> long.", numScale: [1,2,3,4], type: ChallengeType.WIN, sets: ["rollercoasters"] },
    rollercoaster_length: { desc: "The park has a <b>Rollercoaster</b> of <b>%num%(+) spaces</b> long.", numScale: [2,4,6,8], type: ChallengeType.WIN, sets: ["rollercoasters"] },
}

export const DYNAMIC_REPLACEMENTS:Record<string, any[]> =
{
    "%nearbytype%": ["path", "queue", "Attraction", "Stall", "Decoration"],
    "%queue%": ["Queue Common", "Queue Rare"],
    "%item%": ["Attraction", "Stall", "Decoration"],
    "%playerextreme": ["weakest", "strongest"],
    "%extreme%": ["best", "worst"],
    "%itemscorable%": ["Attraction", "Stall"],
}