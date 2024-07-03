import Bounds from "js/pq_games/tools/numbers/bounds"

enum DominoType
{
    REGULAR = "regular",
    TENANT = "tenant",
    MISSION = "mission"
}

enum MissionType
{
    GOAL = "goal",
    THREAT = "threat"
}

enum ItemType
{
    EMPTY = "empty",
    OBJECT = "object",
    TENANTPROP = "tenant_properties",
    TENANTWISH = "tenant_wishes"
}

enum WishType
{
    OBJECT = "object",
    SPECIAL = "special"
}

enum FloorType
{
    WOOD = "wood",
    CONCRETE = "concrete",
    CARPET = "carpet"
}

enum UtilityType
{
    ELEC = "electricity",
    WATER = "water",
    WIFI = "wifi"
}

interface TenantProperties
{
    construction?: boolean,
    wallet?: boolean,
    wandering?: boolean
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    prob?: number,
    sets?: string[],
    props?: TenantProperties,
    range?: Bounds,
    subKey?: boolean,
    color?: string
}

/*
@IDEA: TEXTUAL TENANTS (only in HAPPY HOUSING):
* "For every tenant of type X that also lives on this floor, I am worth -1."
*/

// @NOTE: It's written "Wi-Fi" because otherwise the font adds ligature ("ifi") and that's just unreadable at small size.
// @NOTE: It's "Power" because it's shorter than "Electricity"
const OBJECTS:Record<string, GeneralData> =
{
    staircase: { frame: 0, prob: 2, desc: "<b>Connects</b> you to the floor <b>below</b> you.", sets: ["base", "roomService"] },
    elevator: { frame: 1, desc: "<b>Connects</b> you to anybody with an elevator.", sets: ["base", "happyHousing"] },
    floor_counter: { frame: 2, prob: 3, desc: "<b>How many</b> you own is used to <b>sort players</b> by floor.", sets: ["base", "roomService", "happyHousing", "walletWatchers"] },
    sofa: { frame: 3, sets: ["base", "roomService"] },
    bed: { frame: 4, sets: ["base", "roomService"] },
    toilet: { frame: 5, sets: ["base", "happyHousing"] },
    table: { frame: 6, sets: ["base", "happyHousing"] },
    chair: { frame: 7, sets: ["base", "walletWatchers"] },
    plant: { frame: 8, sets: ["base", "happyHousing"] },
    pool: { frame: 9, desc: "During Attract, 1 Tenant of a <b>connected player</b> with <b>fewer pools</b> moves to you.", sets: ["roomService", "happyHousing"] },
    bar: { frame: 10, desc: "Worth <b>+5</b> if you have <b>Water</b> at the end of the game.", sets: ["usefulUtilities"] },
    computer: { frame: 11, desc: "All adjacent icons, rooms and floors <b>count double, if</b> you currently have <b>Wi-Fi</b>.", sets: ["usefulUtilities"] },
    wardrobe: { frame: 12, desc: "Worth <b>-5</b> points. You may <b>attract 2 Tenants</b> each round.", sets: ["roomService"] },
    piano: { frame: 13, desc: "Only counts if <b>inside a Room</b>.", sets: ["roomService", "happyHousing"] },
    hometrainer: { frame: 14, desc: "Adds <b>+2</b> to every Tenant that shows my icon.", sets: ["walletWatchers"] },
    desk: { frame: 15, desc: "Adds <b>+1</b> for every Room, <b>if</b> inside a Room.", sets: ["walletWatchers", "roomService"] },
    generator_electricity: { frame: 16, desc: "Gives you <b>Power</b> if you have access to it.", sets: ["usefulUtilities"] },
    generator_water: { frame: 17, desc: "Gives you <b>Water</b> if you have access to it.", sets: ["usefulUtilities"] },
    generator_wifi: { frame: 18, desc: "Gives you <b>Wi-Fi</b> if you have access to it.", sets: ["usefulUtilities"] },
    lamp: { frame: 19, desc: "Can only place me <b>if</b> you currently have <b>Power</b>.", sets: ["usefulUtilities"] },
}

const TENANTS:Record<string, GeneralData> = 
{
    boy: { frame: 0, sets: ["base"] },
    girl: { frame: 1, sets: ["base", "happyHousing"] },
    man: { frame: 2, sets: ["base", "usefulUtilities"] },
    woman: { frame: 3, sets: ["base", "usefulUtilities"] },
    grandpa: { frame: 4, props: { construction: true }, sets: ["roomService"] },
    grandma: { frame: 5, props: { construction: true }, sets: ["roomService"] },
    police: { frame: 6, sets: ["roomService"] },
    nurse: { frame: 7, props: { construction: true}, sets: ["roomService"] },
    artist: { frame: 8, props: { wallet: true }, sets: ["walletWatchers"] },
    musician: { frame: 9, props: { construction: true, wallet: true }, sets: ["walletWatchers"] },
    toddler_boy: { frame: 10, props: { wandering: true }, sets: ["happyHousing"] },
    toddler_girl: { frame: 11, props: { wandering: true }, sets: ["happyHousing"] },
    builder: { frame: 12, sets: ["usefulUtilities"] },
    teenager: { frame: 13, props: { construction: true, wallet: true }, sets: ["walletWatchers"] },
    dog: { frame: 14, sets: ["base", "walletWatchers"] },
    cat: { frame: 15, sets: ["base", "happyHousing"] },
}

// @NOTE: All wishes are "at least"; inverting them with a cross will always make them "less than" (not "at most", as that's not actually the proper inverse)
const WISHES:Record<string, GeneralData> =
{
    map_size: { frame: 0, desc: "You need at least this many dominoes.", range: new Bounds(3,8), sets: ["roomService"] },
    floor_num: { frame: 1, desc: "You need to be on this floor (or higher) in the building.", range: new Bounds(1,3), sets: ["roomService"] },
    floor_type: { frame: 2, desc: "You need at least this many of the floor type shown.", range: new Bounds(1,5), sets: ["walletWatchers"], subKey: true },
    num_tenants: { frame: 3, desc: "You need at least this many tenants.", range: new Bounds(1,4), sets: ["happyHousing"] },
    num_rooms: { frame: 4, desc: "You need at least this many rooms.", range: new Bounds(1,4), sets: ["roomService"] },
    utilities: { frame: 5, desc: "You need this utility.", range: new Bounds(1,2), sets: ["usefulUtilities"], subKey: true },
    num_connections: { frame: 6, desc: "You need to be connected to at least this many players.", range: new Bounds(1,3), sets: ["happyHousing"] },
    tenants: { frame: 7, desc: "You need to have this type of tenant already.", range: new Bounds(1,2), sets: ["usefulUtilities"], subKey: true },
    diversity_object: { frame: 8, desc: "You need to have at least this many unique objects.", range: new Bounds(2,6), sets: ["happyHousing"] },
    diversity_tenant: { frame: 9, desc: "You need to have at least this many unique tenants.", range: new Bounds(3,5), sets: ["walletWatchers"] },
    num_windows: { frame: 10, desc: "You need at least this many windows.", range: new Bounds(1,4), sets: ["roomService", "happyHousing", "walletWatchers"] }
}

const MISC =
{
    floor_wood: { frame: 0 },
    floor_concrete: { frame: 1 },
    floor_carpet: { frame: 2 },
    wall_wall: { frame: 3 },
    wall_door: { frame: 4 },
    utility_electricity: { frame: 5 },
    utility_water: { frame: 6 },
    utility_wifi: { frame: 7 },
    score_star: { frame: 8 },
    property_construction: { frame: 9 },
    property_wallet: { frame: 10 },
    invert_cross: { frame: 11 },
    tenant_bg: { frame: 12 },
    property_wandering: { frame: 13 },
    wall_window: { frame: 14 }
}

interface MissionData
{
    type: MissionType,
    descTask: string,
    descReward?: string,
    set?: string
}

const MISSIONS:Record<string,MissionData> = 
{
    diversity_tenant: { type: MissionType.GOAL, descTask: "Have <b>5 different tenants</b>.", descReward: "<b>Power:</b> you may Move 1 Tenant during the Attract Phase.", set: "Base" },
    diversity_objects: { type: MissionType.GOAL, descTask: "Have all the <b>different objects</b> available in this game.", descReward: "<b>Power:</b> when attracting a Tenant, you may always ignore one object icon of choice.", set: "Base" },
    num_goals: { type: MissionType.GOAL, descTask: "Complete at least <b>6 Goals</b> (as a group).", descReward: "<b>Power:</b> once this game, you may discard a Threat card before it fails.", set: "Base" },
    all_utilities: { type: MissionType.GOAL, descTask: "Have access to <b>all 3 utilities</b> (electricity, water, wifi).", descReward: "<b>Power:</b> You have access to electricity, no matter what floor you're on.", set: "Useful Utilities"  },
    water_utility: { type: MissionType.GOAL, descTask: "<b>All</b> players have access to <b>Water</b> this round.", descReward: "<b>Power:</b> everyone has access to water, always.", set: "Useful Utilities" },
    wifi_utilitity: { type: MissionType.GOAL, descTask: "Have access to <b>Wi-Fi</b>, and be the <b>only player</b> to do so.", descReward: "<b>Power:</b> If you're the highest floor, this domino provides Wi-Fi to all players for free.", set: "Useful Utilities" },
    num_rooms: { type: MissionType.GOAL, descTask: "Have at least <b>5 rooms</b>.", descReward: "This domino is considered one room on its own, of size 2 and any floor type you want.", set: "Room Service" },
    all_construction: { type: MissionType.GOAL, descTask: "<b>All</b> players do <b>Construction</b> in the same round.", descReward: "<b>One-Time:</b> Draw (and place) as many dominoes as you removed during Construction this round.", set: "Base" },
    all_expensive: { type: MissionType.GOAL, descTask: "Have a map with a <b>price</b> of at least <b>5</b>.", descReward: "<b>One-Time:</b> Attract any Tenant you want (from deck) that has the Wallet property.", set: "Wallet Watchers" },
    many_wander: { type: MissionType.GOAL, descTask: "Have at least <b>3 tenants leave</b> (the same player) in a single round.", descReward: "<b>Power:</b> no Tenant will ever leave you again, for whatever reason.", set: "Happy Housing" },
    diversity_floor: { type: MissionType.GOAL, descTask: "Have all the <b>different floor types</b>.", descReward: "<b>One-Time</b>: you may rotate or move 3 dominoes in your map, while allowing mismatching floor types.", set: "Base" },
    window_reward: { type: MissionType.GOAL, descTask: "Have (at least) <b>twice as many windows</b> as doors.", set: "Wallet Watchers" },
    map_size_reward: { type: MissionType.GOAL, descTask: "Have the <b>largest</b> map in the game, while being <b>connected to the smallest</b> map.", descReward: "<b>One-Time</b>: you may rotate or move 3 dominoes in your map.", set: "Base" },
    diversity_match: { type: MissionType.GOAL, descTask: "All players have at least 1 object, but <b>no two player maps</b> show the <b>same objects</b>.", descReward: "This domino counts as if it holds the same objects as all adjacent dominoes.", set: "Base" },
    object_numbers: { type: MissionType.GOAL, descTask: "Have at least <b>3</b> instances of the <b>same object</b>. (Floor icons, staircases and elevators do not count.)", descReward: "<b>Power:</b> Once per round, you may request another player give a domino with a specific object to you.", set: "Base" },
    biggest_baddest: { type: MissionType.GOAL, descTask: "Have the <b>largest map</b> of all players and be the <b>highest floor</b>.", descReward: "<b>Power:</b> this domino permanently counts as a Floor Icon and an Elevator.", set: "Base" },
    three_in_a_row: { type: MissionType.GOAL, descTask: "Have <b>3</b> objects of the same type <b>in a row</b> (horizontal or vertical).", descReward: "<b>One-Time:</b> for every tenant you have, attract a tenant of the same type from the guests for free.", set: "Base" },
    identical_rooms: { type: MissionType.GOAL, descTask: "All players have an <b>identical number of Rooms</b>, and at least 1.", set: "Room Service" },
    only_same_orientation: { type: MissionType.GOAL, descTask: "Have all dominoes placed in the <b>same orientation</b>. (Only horizontal or only vertical.)", set: "Base", descReward: "<b>Power:</b> Each round, you may give one player the power to attract 2 Tenants." },

    room_requirement: { type: MissionType.THREAT, descTask: "The next time someone attracts a Tenant, they must have <b>at least 1 Room</b>.", descReward: "All players lose 1 Tenant.", set: "Room Service" },
    no_room_requirement: { type: MissionType.THREAT, descTask: "One player must <b>not</b> have a <b>single Room</b>.", set: "Room Service" },
    room_window_requirement: { type: MissionType.THREAT, descTask: "The next time someone attracts a Tenant, they must have <b>at least 1 Room</b> with a <b>window</b>.", set: "Room Service" },
    attract_requirement: { type: MissionType.THREAT, descTask: "<b>All</b> players must <b>attract a Tenant</b> this round.", set: "Base" },
    floor_num_requirement: { type: MissionType.THREAT, descTask: "<b>All</b> players must be on <b>different floors</b>. (That is, no ties when counting floor icons.)", set: "Base" },
    price_requirement: { type: MissionType.THREAT, descTask: "<b>No</b> map may have a <b>higher price than 4</b>.", set: "Wallet Watchers" },
    wander_requirement: { type: MissionType.THREAT, descTask: "<b>No</b> tenant may <b>leave</b> this round.", set: "Happy Housing" },
    utility_requirement: { type: MissionType.THREAT, descTask: "One player must have <b>no</b> connection to any <b>utilities</b> at all.", set: "Useful Utilities" },
    no_construction: { type: MissionType.THREAT, descTask: "<b>No</b> player may do <b>Construction</b> this round.", descReward: "Pick a player. They may never do Construction again this entire game.", set: "Base" },
    property_requirement: { type: MissionType.THREAT, descTask: "<b>No</b> player may have <b>all Tenant properties</b> in the game (spread across all their tenants).", set: "Happy Housing" },
    floor_num_score_match: { type: MissionType.THREAT, descTask: "The player on the <b>lowest floor</b> must also currently have the <b>highest score</b> in the game", descReward: "Pick a player. They lose all their dominoes showing floor icons.", set: "Base" },
    window_requirement: { type: MissionType.THREAT, descTask: "<b>All</b> players must have <b>at least as many windows</b> as doors.", set: "Wallet Watchers" },
    map_size_match: { type: MissionType.THREAT, descTask: "<b>No two player maps may have a <b>size difference greater than 3</b>.", descReward: "All players must do Construction on their maps until they're the size of the smallest map.", set: "Base" },
    attract_once_requirement: { type: MissionType.THREAT, descTask: "At least <b>1 Tenant</b> must be attracted this round.", descReward: "Remove all Tenants in the market and refill.", set: "Base" },
    floor_type: { type: MissionType.THREAT, descTask: "One player must only have <b>1 floor type</b> in their entire map.", set: "Base" },
    no_adjacent_match: { type: MissionType.THREAT, descTask: "One player must have <b>no objects of the same type adjacent</b> to each other.", set: "Base" },
    no_holes: { type: MissionType.THREAT, descTask: "No player may have <b>holes</b> in their map. (A space without a domino, surrounded by other dominoes on all sides.)", set: "Base" }
};

export
{
    MISC,
    OBJECTS,
    TENANTS,
    WISHES,
    MISSIONS,
    GeneralData,
    TenantProperties,
    DominoType,
    ItemType,
    FloorType,
    WishType,
    UtilityType,
    MissionType
}