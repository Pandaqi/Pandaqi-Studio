import { CardType, EventType, GameNaivigationData, MaterialNaivigationData, PASSENGERS, TileType } from "games/naivigation/js_shared/dictShared";

const GAME_DATA:GameNaivigationData = { bgColor: "#de4d87", tintColor: "#ffe6f0", textColor: "#260311", mapTileColor: "#FFFFFF" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    fly: { frame: 0, label: "Fly", desc: "<b>Move 1 tile</b> forward ( = in the direction your airplane faces).", freq: 10 },
    turn: { frame: 1, label: "Turn", desc: "<b>Rotate</b> a quarter turn <b>left or right</b>.", freq: 10 },
    elevate: { frame: 2, label: "Elevate", desc: "Played in <b>odd-numbered</b> slot? <b>Add 1 Elevation</b>. Otherwise, <b>remove 1</b>.", freq: 10 },
    stunt: { frame: 3, label: "Stunt", desc: "<b>Move 1 tile</b> forward, <b>ignoring Elevation</b>.", freq: 5 },
    repair: { frame: 4, label: "Repair", desc: "<b>Repair 1 health if landed.</b> Otherwise, take 1 damage and end round.", freq: 4, sets: ["repairsRacing"] },
    backflip: { frame: 5, label: "Backflip", desc: "<b>Rotate</b> the plane to face <b>backwards</b>.", freq: 8, sets: ["repairsRacing"] },
    fly_double: { frame: 6, label: "Fly+", desc: "<b>Move 2 tiles</b> forward.", freq: 6, sets: ["repairsRacing"] },
    refuel: { frame: 7, label: "Refuel", desc: "<b>Replenish fuel if landed.</b> Otherwise, take 1 damage and only gain 3 Fuel.", freq: 10, sets: ["fuelFalling"] },
};

const HEALTH_CARDS:Record<string,MaterialNaivigationData> =
{
    downgrade: { label: "Downgrade", desc: "You can't wrap around the map anymore.", num: 2 },
    fragile_ship: { label: "Fragile Plane", desc: "Flying over the wrong elevation does <b>2 damage</b> (instead of 1).", num: 2 },
    bad_steering_soft: { label: "Stuck Steering", desc: "All <b>Turn</b> cards in the same round must turn the same way.", num: 3 },
    bad_steering: { label: "Bad Steering", desc: "When executing a <b>Turn</b> card, always turn <b>left</b>.", num: 1 },
    stuck_elevation: { label: "Stuck Stick", desc: "The first Elevate card determines how all later Elevate cards work (+1 or -1).", num: 3 },
    disoriented: { label: "Disoriented", desc: "After executing a <b>Stunt</b> or <b>Backflip</b>, end the round immediately.", num: 4 },
    disoriented_super: { label: "Super Disoriented", desc: "After executing a <b>Stunt</b> or <b>Backflip</b>, all later cards are <b>inverted</b>.", num: 2 }
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
    damage_for_elevation: { label: "Rocket Launch", desc: "<b>Take 1 damage</b> to set your Elevation to <b>any value</b>.", type: EventType.OFFER }, 
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
    volcano: { frame: 13, label: "Volcano", desc: "Take 1 damage, but change Elevation to anything.", freq: 4, sets: ["repairsRacing"] },
    skyscraper: { frame: 14, label: "Skyscraper", desc: "Elevation 1? Instantly lose the game. Otherwise, do a backflip.", freq: 1, sets: ["repairsRacing"] },
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

const PASSENGER_BONUSES:Record<string, MaterialNaivigationData> =
{
    health: { desc: "<b>Repair</b> 1 health." },
    health_double: { desc: "<b>Repair</b> 2 health." },
    orient: { desc: "All players reveal their <b>Turn</b> cards. Then orient the Plane however you like." },
    elevation: { desc: "All players reveal their <b>Elevate</b> cards. Then change the Elevation to whatever you like." },
    teleport: { desc: "<b>Move</b> the Plane to any adjacent tile (horizontal, vertical, diagonal)." },
    auto_land: { desc: "Next round, you <b>land</b> automatically on airports (regardless of Elevation)." },
    willpower: { desc: "<b>Once</b> this game, you may <b>ignore</b> all your (Health) <b>handicaps</b> for a round." },
    clear_info: { desc: "<b>Once</b> this game, you may play an entire round with cards <b>faceup</b>." },
    rotate_strong: { desc: "From now on, the <b>Turn</b> cards can also do a <b>half turn</b> (180 degrees)." },
    backflip_weak: { desc: "From now on, the <b>Backflip</b> card can also do a <b>quarter turn</b>." },
    look_ahead: { desc: "Show the <b>next 8 cards</b> of the deck to everyone." },
    look_hands: { desc: "Everyone <b>shows their hand cards</b> to each other." },
    strong_plane: { desc: "Next round, all movement is <b>doubled</b>, but you <b>can't take damage</b>." },
}

const PASSENGER_CURSES:Record<string, MaterialNaivigationData> =
{
    nothing: { desc: "No curse." },
    bad_passenger: { desc: "If this is the <b>final remaining passenger</b>, you instantly <b>lose</b> the game." },
    urgent_passenger: { desc: "You <b>can't deliver other passengers</b> until you delivered me." },
    stuck_steering: { desc: "The plane can only turn <b>left</b>." },
    limited_steering: { desc: "<b>Turn</b> cards only work in slot 3 and 4." },
    fly_ignore: { desc: "The first <b>Fly</b> card is ignored." },
    heavy_plane: { desc: "<b>Elevate</b> cards only work in slot 1 and 2." },
    limited_stunt: { desc: "The <b>Stunt</b> card only works if played in the last slot." },
    airport_lower: { desc: "Pretend <b>all airports</b> are at <b>Elevation 1</b>." },
    airport_restrict: { desc: "You <b>can't land on</b> two airports in the same or subsequent rounds." },
    no_wrapping: { desc: "You <b>can't wrap</b> around the map." },
    fuel_cost: { desc: "Every movement costs <b>2 Fuel</b> instead of 1." },
    nature_lover: { desc: "If you <b>fly into a Pawn</b>, you instantly <b>lose</b> the game." },
    fuel_cutoff: { desc: "You already enter freefall when you have <b>2 Fuel (or fewer)</b> left." }
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    elevation_template: { frame: 2 },
    clock_template: { frame: 3 },
}

const MATERIAL =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [CardType.TIME]: TIME_CARDS,
    [CardType.ACTION]: ACTION_CARDS,
    [CardType.FUEL]: {},
    [TileType.MAP]: MAP_TILES,
    [TileType.VEHICLE]: VEHICLE_TILES,
    [TileType.PAWN]: PAWN_TILES,
}

export 
{
    GAME_DATA,
    MATERIAL,
    PASSENGER_BONUSES,
    PASSENGER_CURSES,
    MISC,
}
