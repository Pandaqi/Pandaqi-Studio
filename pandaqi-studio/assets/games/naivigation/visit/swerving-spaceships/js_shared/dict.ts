import { CardType, GameNaivigationData, MaterialNaivigationData, TileType } from "games/naivigation/js_shared/dictShared";

const GAME_DATA:GameNaivigationData = { bgColor: "#8B46FF", tintColor: "#D5BDFF", textColor: "#1C004B", mapTileColor: "#151E3D" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    steer: { frame: 1, label: "Steer", desc: "Pick an angle within range. <b>Rotate</b> the vehicle that much." },
    thrust: { frame: 0, label: "Thrust", desc: "<b>Move</b> 1 tile <b>forward</b> ( = in the direction your spaceship faces).", freq: 12 },
    disengage: { frame: 2, label: "Disable", desc: "Perform 1 <b>gravitational pull</b> step.", freq: 12 },
    shield: { frame: 3, label: "Shield", desc: "<b>Toggle the shield</b> on/off.", freq: 10, sets: ["shields"] },
    superthrust: { frame: 4, label: "Thrust+", desc: "<b>Move</b> 2 tiles <b>forward</b>.", freq: 4, sets: ["shields"] },
    shoot: { frame: 5, label: "Shoot", desc: "<b>Destroy</b> the first tile within <b>line of sight</b>.", freq: 8, sets: ["weapons"] },
    hyperdrive: { frame: 6, label: "Hyper", desc: "<b>Move</b> to a tile at the <b>end of your row</b>.", freq: 6, sets: ["trade"] },
};

const HEALTH_CARDS:Record<string,MaterialNaivigationData> =
{
    downgrade: { label: "Downgrade", desc: "You can't wrap around the map anymore.", num: 2 },
    favorite_direction: { label: "Favorite Direction", desc: "When moving diagonally, you always pick the <b>horizontal</b> option (never vertical).", num: 3 },
    fragile_ship: { label: "Fragile Ship", desc: "Running into a planet or wrapping around the map does <b>2 damage</b> (instead of 1).", num: 3 },
    bad_steering: { label: "Bad Steering", desc: "When executing a <b>Steer</b> card, you must always pick one of the two <b>extreme angles</b>", num: 1 },
    no_engine: { label: "No Engine", desc: "After executing a <b>Disable</b> card, end the round immediately. Unless the next card is another <b>Disable</b>.", num: 4 }
}

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialNaivigationData> =
{
    empty: { frame: -1, label: "Nothing Special", freq: 20 },
    planet_0: { frame: 0, label: "Planet", collectible: true },
    planet_1: { frame: 1, label: "Planet", collectible: true },
    planet_2: { frame: 2, label: "Planet", collectible: true },
    planet_3: { frame: 3, label: "Planet", collectible: true },
    planet_4: { frame: 4, label: "Planet", collectible: true },

    starting_tile: { frame: 8, label: "Starting Tile", freq: 1, starting: true },

    wormhole: { frame: 9, label: "Wormhole", desc: "Take 1 damage. Teleport to another Wormhole.", freq: 4, sets: ["shields"] },
    asteroids: { frame: 10, label: "Asteroids", desc: "Take 1 damage.", freq: 4, sets: ["shields"] },
    spaceship: { frame: 11, label: "Enemy Spaceship", desc: "Take 1 damage if in their line of sight. Then rotate them.", freq: 4, sets: ["weapons"] },
    moon: { frame: 12, label: "Moon", desc: "Collect this resource, then replace tile. Optional: rearrange planet properties.", freq: 6, sets: ["trade"] }, 
    sun: { frame: 13, label: "Sun", desc: "Take 3 damage. Also counts for Gravitational Pull.", freq: 2, sets: ["weapons"] },
    space_station: { frame: 14, label: "Space Station", desc: "Repair 2 damage. Then replace this tile.", freq: 3, sets: ["trade"] }
}

const VEHICLE_TILES:Record<string,MaterialNaivigationData> =
{
    vehicle_0: { frame: 5, label: "Vehicle" },
    vehicle_1: { frame: 6, label: "Vehicle" },
    vehicle_2: { frame: 7, label: "Vehicle" },
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    star_0: { frame: 2 },
    star_1: { frame: 3 },
    resource_0: { frame: 4 },
    resource_1: { frame: 5 }
}


interface PlanetProperty
{
    values?: any[],
    key?: string,
    desc: string,
    freq?: number,
    num?: number
}

const PLANET_PROPERTY_REWARDS = ["repair 1 damage", "teleport to any non-collectible space", "rearrange the planets and properties", "orient the vehicle however you want"];
const PLANET_PROPERTY_PENALTIES = ["take 1 extra damage", "lose all your resource tiles", "all players show their hand to each other", "all players discard their hand"];
const PLANET_PROPERTIES : Record<string, PlanetProperty> =
{
    health_check_low: { desc: "<b>Collectable</b> if you have at least %val% Health.", values: [2,3,4] },
    health_check_high: { desc: "<b>Collectable</b> if you have at most %val% Health.", values: [2,3,4] },
    slot_check_low: { desc: "<b>Collectable</b> using a card in slot %val% or later.", values: [3,4,5] },
    slot_check_high: { desc: "<b>Collectable</b> using a card in slot %val% or earlier.", values: [1,2,3] },
    card_check_yes: { desc: "<b>Collectable</b> if you played a %val% card this round.", values: ["Discuss", "Thrust", "Steer", "Disable"] },
    card_check_no: { desc: "<b>Collectable</b> if you did NOT play a %val% card this round.", values: ["Discuss", "Thrust", "Steer", "Disable"] },
    resource_check: { desc: "<b>Collectable</b> if you have resource %val%.", values: ['<img id="misc" frame="4">', '<img id="misc" frame="5">'], freq: 5 },
    reward: { desc: "Reward: if you collect this planet, <b>%val%</b>", values: PLANET_PROPERTY_REWARDS },
    reward_order: { desc: "Reward: if you visit this planet in order, <b>%val%</b>.", values: PLANET_PROPERTY_REWARDS },
    reward_fail: { desc: "Penalty: if you bump into this planet, <b>%val%</b>", values: PLANET_PROPERTY_PENALTIES }
}

const MATERIAL =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [TileType.MAP]: MAP_TILES,
    [TileType.VEHICLE]: VEHICLE_TILES
}

export {
    GAME_DATA, 
    MATERIAL, 
    MISC,
    PLANET_PROPERTIES,
    VEHICLE_TILES,
    PlanetProperty
};

