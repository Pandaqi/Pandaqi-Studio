import { CardType, EventType, GameNaivigationData, MaterialNaivigationData, TileType } from "games/naivigation/js_shared/dictShared";


// @TODO: update
const GAME_DATA:GameNaivigationData = { bgColor: "#8B46FF", tintColor: "#D5BDFF", textColor: "#1C004B", mapTileColor: "#151E3D" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    fly: { frame: 1, label: "Fly", desc: "Move 1 tile forward ( = in the direction your airplane faces).", freq: 10 },
    turn: { frame: 0, label: "Turn", desc: "Rotate a quarter turn left or right.", freq: 10 },
    elevate: { frame: 2, label: "Elevate", desc: "If played in odd-numbered slot, add 1 elevation. Otherwise, remove 1.", freq: 10 },
    stunt: { frame: 3, label: "Stunt", desc: "Move 1 tile forward, ignoring elevation.", freq: 5 },
    repair: { frame: 4, label: "Repair", desc: "Repair 1 health if landed. Otherwise, take 1 damage and end round.", freq: 4, sets: ["repairsRacing"] },
    backflip: { frame: 5, label: "Backflip", desc: "Rotate the plane to face backwards.", freq: 8, sets: ["repairsRacing"] },
    fly_double: { frame: 6, label: "Fly+", desc: "Move 2 tiles forward.", freq: 6, sets: ["repairsRacing"] },
    refuel: { frame: 7, label: "Refuel", desc: "Replenish fuel if landed. Otherwise, take 1 damage and end round.", freq: 10, sets: ["fuelFalling"] },
};

const HEALTH_CARDS:Record<string,MaterialNaivigationData> =
{
    downgrade: { subText: "Downgrade", desc: "You can't wrap around the map anymore.", num: 2 },
    fragile_ship: { subText: "Fragile Plane", desc: "Flying over the wrong elevation does <b>2 damage</b> (instead of 1).", num: 2 },
    bad_steering_soft: { subText: "Stuck Steering", desc: "All <b>Turn</b> cards in the same round must turn the same way.", num: 3 },
    bad_steering: { subText: "Bad Steering", desc: "When executing a <b>Turn</b> card, always turn <b>left</b>.", num: 1 },
    stuck_elevation: { subText: "Stuck Stick", desc: "The first Elevate card determines how all later Elevate cards work (+1 or -1).", num: 3 },
    disoriented: { subText: "Disoriented", desc: "After executing a <b>Stunt</b> or <b>Backflip</b>, end the round immediately.", num: 4 },
    disoriented_super: { subText: "Super Disoriented", desc: "After executing a <b>Stunt</b> or <b>Backflip</b>, all later cards are <b>inverted</b>.", num: 2 }
}

const ACTION_CARDS:Record<string,MaterialNaivigationData> =
{
    ghost_plane: { frame: 0, label: "Ghost Plane", desc: "Completely <b>ignore elevation</b> on further moves. (No damage, land automatically.)" },
    solar_plane: { frame: 1, label: "Solar Plane", desc: "<b>Replenish fuel.</b> Ignore any fuel lost (this round).", sets: ["fuelFalling"] },
    cloudy: { frame: 2, label: "Cloudy Day", desc: "You may choose to <b>ignore</b> any <b>special powers</b> or <b>pawns</b> on tiles." },
    thunderstorm: { frame: 3, label: "Thunderstorm", desc: "Instantly <b>return</b> to the <b>last airport</b> you visited." },
    lost_luggage: { frame: 4, label: "Lost Luggage", desc: "Change your <b>Elevation</b> to whatever you want." },
    snowstorm: { frame: 5, label: "Snowstorm", desc: "You may \"land\" on <b>any tile</b>." },
}

const TIME_CARDS:Record<string,MaterialNaivigationData> =
{
    mayday: { label: "Mayday", desc: "Return to the <b>last airport</b> you visited.", type: EventType.EVENT },
    fuel_explosion: { label: "Fuel Explosion", desc: "Instantly reduce your Fuel tank to 1.", type: EventType.EVENT, sets: ["fuelFalling"] },
    elevation_for_info: { label: "Clear Skies", desc: "<b>Lose 2 Elevation</b> to play all cards <b>faceup</b> this round.", type: EventType.OFFER }, 
    damage_for_elevation: { label: "Clear Skies", desc: "<b>Take 1 damage</b> to set your Elevation to <b>any value</b>.", type: EventType.OFFER }, 
    safer_spheres: { label: "Safer Spheres", desc: "If you end the round on <b>maximum elevation</b>, <b>repair</b> 1 damage.", type: EventType.RULE },
    fuel_leak: { label: "Fuel Leak", desc: "Every movement costs <b>2 Fuel</b> (instead of 1).", type: EventType.RULE },
    supersonic: { label: "Supersonic", desc: "Every Fly card is <b>doubled</b>, but you <b>can't land</b>.", type: EventType.RULE },
    low_lands: { label: "Low Lands", desc: "<b>Ignore Elevation</b> this round.", type: EventType.RULE }, 
}

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialNaivigationData> =
{
    empty: { frame: -1, label: "Regular", freq: 20 },
    airport_0: { frame: 0, label: "Airport", collectible: true },
    airport_1: { frame: 1, label: "Airport", collectible: true },
    airport_2: { frame: 2, label: "Airport", collectible: true },
    airport_3: { frame: 3, label: "Airport", collectible: true },
    airport_4: { frame: 4, label: "Airport", collectible: true },
    starting_tile: { frame: 8, label: "Starting Tile", freq: 1, starting: true },
    stopover: { frame: 12, label: "Stopover", desc: "You can land here.", freq: 2 },
    volcano: { frame: 13, label: "Volcano", desc: "Take 1 damage and turn the plane 180 degrees.", freq: 4, sets: ["repairsRacing"] },
    skyscraper: { frame: 14, label: "Skyscraper", desc: "At the lowest possible elevation? Instantly lose the game.", freq: 1, sets: ["repairsRacing"] },
    fireworks: { frame: 15, label: "Fireworks Show", desc: "Reveal the remaining instructions. Decide if you still want to execute them.", freq: 3, sets: ["repairsRacing"] },
}

const VEHICLE_TILES:Record<string,MaterialNaivigationData> =
{
    vehicle_0: { frame: 5, label: "Vehicle" },
    vehicle_1: { frame: 6, label: "Vehicle" },
    vehicle_2: { frame: 7, label: "Vehicle" },
}

const PAWN_TILES:Record<string,MaterialNaivigationData> =
{
    pawn_balloon: { frame: 9, label: "Balloon", sets: ["birdsBumps"], freq: 2 },
    pawn_bird: { frame: 10, label: "Bird", sets: ["birdsBumps"], freq: 2 },
    pawn_tornado: { frame: 11, label: "Tornado", sets: ["birdsBumps"], freq: 2 },
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    elevation_template: { frame: 2 },
    clock_template: { frame: 3 },
    fuel_template: { frame: 4 }
}

const MATERIAL =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [CardType.TIME]: TIME_CARDS,
    [CardType.ACTION]: ACTION_CARDS,
    [TileType.MAP]: MAP_TILES,
    [TileType.VEHICLE]: VEHICLE_TILES,
    [TileType.PAWN]: PAWN_TILES,
}

export 
{
    GAME_DATA,
    MATERIAL,
    MISC,
}
