

interface MaterialData
{
    frame?: number,
    label?: string,
    desc?: string,
    freq?: number,
}

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialData> = 
{
    thrust: { frame: 0, label: "Thrust", desc: "Move 1 tile forward ( = in the direction your spaceship faces).", freq: 10 },
    steer: { frame: 1, label: "Steer", desc: "Pick any angle (perfect horizontal, vertical or diagonal within the range shown. Rotate the vehicle by that amount." },
    disengage: { frame: 2, label: "Disengage", desc: "Perform one gravitational pull step.", freq: 10 },
    shield: { frame: 3, label: "Shield", desc: "Toggles the shield on and off.", freq: 10 }
};

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialData> =
{
    empty: { frame: 0, label: "Empty", freq: 6 },
    planet: { frame: 1, label: "Planet (Collectable)", freq: 6 },
    asteroids: { frame: 2, label: "Asteroid Belt", freq: 6 },
    wormhole: { frame: 3, label: "Wormhole", freq: 4 },
    sun: { frame: 4, label: "Sun", freq: 4 },
    spaceship: { frame: 5, label: "Enemy Spaceship", freq: 4 },
}

export 
{
    VEHICLE_CARDS,
    MAP_TILES
}
