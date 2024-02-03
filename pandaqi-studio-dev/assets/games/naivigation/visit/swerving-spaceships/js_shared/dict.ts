

interface MaterialData
{
    frame?: number,
    label?: string,
    desc?: string,
    freq?: number,
    collectible?: boolean,
    expansion?: string[]
}

const MAIN_COLORS = { bgColor: "#8B46FF", tintColor: "#D5BDFF", textColor: "#1C004B", mapTileColor: "#151E3D" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialData> = 
{
    thrust: { frame: 0, label: "Thrust", desc: "Move 1 tile forward ( = in the direction your spaceship faces).", freq: 10 },
    steer: { frame: 1, label: "Steer", desc: "Pick an angle within range. Rotate the vehicle that much." },
    disengage: { frame: 2, label: "Disable", desc: "Perform one gravitational pull step.", freq: 10 },
    shield: { frame: 3, label: "Shield", desc: "Toggles the shield on and off.", freq: 10, expansion: ["shields"] }
};

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialData> =
{
    empty: { frame: -1, label: "Nothing Special", freq: 6 },
    planet_0: { frame: 0, label: "Planet", collectible: true },
    planet_1: { frame: 1, label: "Planet", collectible: true },
    planet_2: { frame: 2, label: "Planet", collectible: true },
    planet_3: { frame: 3, label: "Planet", collectible: true },
    planet_4: { frame: 4, label: "Planet", collectible: true },
    vehicle_0: { frame: 5, label: "Vehicle", freq: 0 },
    vehicle_1: { frame: 6, label: "Vehicle", freq: 0 },
    vehicle_2: { frame: 7, label: "Vehicle", freq: 0 },

    wormhole: { frame: 8, label: "Wormhole", freq: 4 },
    asteroids: { frame: 9, label: "Asteroids", freq: 4 },
    spaceship: { frame: 10, label: "Enemy Spaceship", freq: 4 },
    moon: { frame: 11, label: "Moon", freq: 0 }, // @TODO: unused atm
    star_0: { frame: 12, label: "Star (Decoration)", freq: 0 },
    star_1: { frame: 13, label: "Star (Decoration)", freq: 0 },
    sun: { frame: 14, label: "Sun", freq: 2 },
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
}

export 
{
    MAIN_COLORS,
    VEHICLE_CARDS,
    MAP_TILES,
    MISC
}
