import Bounds from "js/pq_games/tools/numbers/bounds"

enum DominoType
{
    REGULAR = "regular",
    TENANT = "tenant",
    MISSION = "mission"
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

const OBJECTS:Record<string, GeneralData> =
{
    staircase: { frame: 0, prob: 2, desc: "Connects you to the floor below you.", sets: ["base", "roomService"] },
    elevator: { frame: 1, desc: "Connects you to anybody else with an elevator.", sets: ["base", "happyHousing"] },
    floor_counter: { frame: 2, prob: 4, desc: "How many such icons you own is used to sort players by floor.", sets: ["base", "roomService", "happyHousing", "usefulUtilities", "walletWatchers"] },
    sofa: { frame: 2, sets: ["base"] },
    bed: { frame: 3, sets: ["base"] },
    toilet: { frame: 4, sets: ["base"] },
    pool: { frame: 5, sets: ["base"] },
    bar: { frame: 6 },
    game_room: { frame: 7 },
    lala: { frame: 8 },
}

const TENANTS:Record<string, GeneralData> = 
{
    boy: { frame: 0, sets: ["base"] },
    girl: { frame: 1, sets: ["base"] },
    man: { frame: 2, sets: ["base"] },
    woman: { frame: 3, sets: ["base"] },
    grandpa: { frame: 4, props: { construction: true }, sets: ["base"] },
    grandma: { frame: 5, props: { construction: true }, sets: ["base"] },
    // @TODO: anything from the walletWatchers expansion obviously has the wallet props set to true
}

const WISHES:Record<string, GeneralData> =
{
    map_size: { frame: 0, desc: "You need at least this many dominoes.", range: new Bounds(3,8), sets: ["base"] },
    floor_num: { frame: 1, desc: "You need to be on this floor (or higher) in the building.", range: new Bounds(1,3), sets: ["roomService"] },
    floor_type: { frame: 2, desc: "You need at least this many of the floor type shown.", range: new Bounds(1,5), sets: ["base"], subKey: true },
    num_tenants: { frame: 3, desc: "You need at most this many tenants.", range: new Bounds(2,6), sets: ["happyHousing"] },
    num_rooms: { frame: 4, desc: "You need at least this many rooms.", range: new Bounds(1,4), sets: ["roomService"] },
    utilities: { frame: 5, desc: "You need this utility.", range: new Bounds(1,2), sets: ["usefulUtilities"], subKey: true },
    num_connections: { frame: 6, desc: "You need to be connected to at least this many players.", range: new Bounds(1,3), sets: ["happyHousing"] },
    tenant: { frame: 7, desc: "You need to have this type of tenant already.", range: new Bounds(1,2), sets: ["usefulUtilities"], subKey: true }
}

const MISC =
{
    floor_wood: { frame: 0 },
    floor_concrete: { frame: 1 },
    floor_carpet: { frame: 2 },
    wall: { frame: 3 },
    wall_door: { frame: 4 },
    utility_electricity: { frame: 5 },
    utility_water: { frame: 6 },
    utility_wifi: { frame: 7 },
    score_star: { frame: 8 },
    property_construction: { frame: 9 },
    property_wallet: { frame: 10 },
    invert_cross: { frame: 11 },
    tenant_bg: { frame: 12 }
}

const COLORS =
{

}

export
{
    MISC,
    OBJECTS,
    TENANTS,
    WISHES,
    COLORS,
    GeneralData,
    TenantProperties,
    DominoType,
    ItemType,
    FloorType,
    WishType,
    UtilityType
}