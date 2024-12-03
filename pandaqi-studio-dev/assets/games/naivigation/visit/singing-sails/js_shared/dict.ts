import { CardType, EventType, GameNaivigationData, MaterialNaivigationData, TileType } from "games/naivigation/js_shared/dictShared";


const GAME_DATA:GameNaivigationData = { bgColor: "#40cfe3", tintColor: "#e7fcff", textColor: "#03262b", mapTileColor: "#FFFFFF" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    sail: { frame: 0, label: "Sail", desc: "<b>Move</b> as many tiles as your Wind, in the North direction of the Compass.", freq: 10 },
    wind: { frame: 1, label: "Wind", desc: "<b>Change</b> the <b>Wind</b> deck by 1 (up or down).", freq: 10 },
    rotate: { frame: 2, label: "Rotate", desc: "<b>Rotate</b> Ship or Compass a quarter turn in the direction shown.", freq: 10 },
    weather: { frame: 3, label: "Weather", desc: "@CUSTOM", freq: 7, sets: ["windstormsWeather"] },
    row: { frame: 4, label: "Row", desc: "<b>Move</b> 1 tile forward ( = in the direction the ship faces).", freq: 4, sets: ["windstormsWeather"] },
    spyglass: { frame: 5, label: "Spyglass", desc: "<b>Draw</b> 3 tiles from any deck. <b>Attach</b> them to your <b>map</b> at that compass point.", freq: 8, sets: ["windstormsWeather"] },
    dig: { frame: 6, label: "Dig", desc: "<b>Replace</b> 1-3 tiles on the map with new ones from any deck(s).", freq: 6, sets: ["islandsTreasures"] },
    cannon: { frame: 7, label: "Cannon", desc: "<b>Destroy enemies</b> on the tile directly to your left and right.", freq: 10, sets: ["piratesCannons"] },
};

const HEALTH_CARDS:Record<string,MaterialNaivigationData> =
{
    fog: { subText: "Fog", desc: "Turn one Compass deck <b>facedown</b>.", num: 3 },
    fragile_plane: { subText: "Fragile Ship", desc: "Sailing into land does <b>2 damage</b> (instead of 1).", num: 2 },
    stubborn_storms: { subText: "Stubborn Storms", desc: "The first <b>Wind</b> card played determines how all later Wind cards work (+1 or -1).", num: 3 },
    row_invert: { subText: "Inverted Paddles", desc: "The <b>Row</b> card moves you 1 tile backward (instead of forward).", num: 5, sets: ["windstormsWeather"] },
    end_of_world: { subText: "At World's End", desc: "Shuffle one Compass deck into another. (You can never explore in that direction again.)", num: 4 },
    moodswing_sails: { subText: "Moodswing Sails", desc: "Round your Wind deck. (You either move at <b>minimum speed</b> or <b>maximum speed</b>.)", num: 1 },
    rioting_rudder: { subText: "Rudder Riot", desc: "Whenever you <b>take damage</b>, <b>rotate</b> the ship a quarter turn to the <b>right</b>.", num: 4 },
    soaked_map: { subText: "Soaked Map", desc: "Whenever you <b>take damage</b> or <b>visit harbor</b>, shuffle all your Compass decks.", num: 3  },
    torn_sails: { subText: "Torn Sails", desc: "You <b>lose 1 Wind</b> at the end of <b>every round</b>.", num: 3 },
    danger_stream: { subText: "Danger Stream", desc: "The strength of all <b>water currents</b> is <b>doubled</b>.", num: 3 },
}

/*const ACTION_CARDS:Record<string,MaterialNaivigationData> =
{
    
}*/

const TIME_CARDS:Record<string,MaterialNaivigationData> =
{
    stormy_seas: { label: "Stormy Seas", desc: "<b>Randomize the Compass.</b> (Spin it, see where it stops.)", type: EventType.EVENT },
    explorers_return: { label: "Explorer's Return", desc: "<b>Add 4 tiles</b> to the map, wherever you want.", type: EventType.EVENT },
    tsunami: { label: "Tsunami", desc: "<b>Remove 4 map tiles</b>. (Put them back into a Compass deck for each direction.)", type: EventType.EVENT },
    panic_disembark: { label: "Seasick Disembark", desc: "Return to the <b>last tile</b> you visited that was adjacent to land.", type: EventType.EVENT },
    enemy_speedup: { label: "Enemy Speedup", desc: "All <b>Enemies</b> instantly <b>move</b> 1 tile closer to your ship.", type: EventType.EVENT, sets: ["piratesCannons"] },

    wind_for_info: { label: "Clear Skies", desc: "<b>Lose 2 Wind</b> to play all cards <b>faceup</b> this round.", type: EventType.OFFER }, 
    damage_for_wind: { label: "Stormgod Prayer", desc: "<b>Take 1 damage</b> to set your Wind to <b>any value</b>.", type: EventType.OFFER }, 
    damage_for_ghost: { label: "Ghost Ship", desc: "<b>Take 1 damage</b> to allow ignoring any <b>special powers</b> or <b>pawns</b> on tiles.", type: EventType.OFFER },
    facedown_for_harbor: { label: "Tempting Magic", desc: "Turn <b>2 Compass decks facedown</b> (permanently) to teleport to any harbor.", type: EventType.OFFER },
    wind_for_current: { label: "Fake Anchor", desc: "<b>Reset Wind to 0</b> to ignore all <b>water currents</b>.", type: EventType.OFFER, sets: ["supertilesSlipstreams"] },

    still_weather: { label: "Still Weather", desc: "If <b>Wind</b> cards were played, only apply them at the <b>end</b> of the round.", type: EventType.RULE },
    powerboat: { label: "Powerboat", desc: "<b>Ignore Wind</b> this round: you always Sail 1 tile.", type: EventType.RULE }, 
    supersailing: { label: "Supersailing", desc: "All movement is <b>doubled</b>, but you <b>can't visit harbors</b>.", type: EventType.RULE },
    monsterboat: { label: "Monster Boat", desc: "You can sail <b>over land</b> (without taking damage).", type: EventType.RULE },
    engineer_harbor: { label: "Engineer Port", desc: "If you <b>visit a harbor</b> this round, <b>repair</b> 1 damage.", type: EventType.RULE },
    enemy_holiday: { label: "Enemy Holiday", desc: "You <b>don't</b> need to play a Vehicle Card to all <b>Enemies</b>.", type: EventType.RULE, sets: ["piratesCannons"] },

}

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialNaivigationData> =
{
    empty: { frame: -1, label: "Regular", freq: 20 },
    harbor_0: { frame: 0, label: "Harbor", collectible: true, freq: 3 },
    harbor_1: { frame: 1, label: "Harbor", collectible: true, freq: 3 },
    harbor_2: { frame: 2, label: "Harbor", collectible: true, freq: 2 },
    harbor_3: { frame: 3, label: "Harbor", collectible: true, freq: 2 },
    harbor_4: { frame: 4, label: "Harbor", collectible: true, freq: 2 },
    island: { frame: 8, label: "Island", desc: "Add any deck tile to the map. Land tiles, though, must attach to other land." },
    anchor: { frame: 9, label: "Anchor", desc: "The round ends. There are instructions left to execute? Take 1 damage." },
    lighthouse: { frame: 10, label: "Lighthouse", desc: "While here, the start player shows their hand and plays their cards faceup." },
    buoy: { frame: 11, label: "Buoy", desc: "You may freely discuss the game, but not reveal your exact hand cards.", sets: ["supertilesSlipstreams"] },
    shipwreck: { frame: 12, label: "Shipwreck", desc: "If you move through here at a speed of less than 3, bounce back and take 1 damage.", sets: ["supertilesSlipstreams"] },
    treasure_map: { frame: 13, label: "Treasure Map", desc: "Look at any deck until you find a Harbor tile. Move it to the top.", sets: ["supertilesSlipstreams"] },
    pirate_haven: { frame: 14, label: "Pirate Haven", desc: "You must visit all Pirate Havens, but can only do so if an Enemy is within 2 tiles.", sets: ["piratesCannons"] },
    whirlpool: { frame: 15, label: "Whirlpool", desc: "Randomize your Wind deck and Ship orientation.", sets: ["islandsTreasures"] },
}

const VEHICLE_TILES:Record<string,MaterialNaivigationData> =
{
    vehicle_0: { frame: 5, label: "Vehicle" },
    vehicle_1: { frame: 6, label: "Vehicle" },
    vehicle_2: { frame: 7, label: "Vehicle" },
}

const PAWN_TILES:Record<string,MaterialNaivigationData> =
{
    pawn_pirateship: { frame: 7, label: "Pirates", sets: ["piratesCannons"], freq: 3 },
    pawn_seamonster: { frame: 8, label: "Sea Monster", sets: ["piratesCannons"], freq: 3 },
    pawn_giantwave: { frame: 9, label: "Giant Wave", sets: ["piratesCannons"], freq: 3 },
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    wind_template: { frame: 2 },
    compass_template: { frame: 3 },
    treasure_template: { frame: 4 },
    enemy_icon: { frame: 5 },
    water_direction: { frame: 6 },
}

const WEATHER_CARDS:Record<string,MaterialNaivigationData> =
{
    thunder: { frame: 0, label: "Thunder", num: -3, desc: "<b>Spin the Compass</b> to randomize it. Do the same at the start of each round." },
    storm: { frame: 1, label: "Storm", num: -2, desc: "All instructions are <b>doubled</b>. <b>Rotating</b> incurs 1 damage." },
    windy_day: { frame: 2, label: "Windy Day", num: -1, desc: "The wind value is <b>doubled</b>." },
    calm_seas: { frame: 3, label: "Calm Seas", num: 0, desc: "There is <b>no wind</b> at all." },
    cloudy_day: { frame: 4, label: "Cloudy Day", num: 1, desc: "The weather card only <b>switches</b> if the new weather card's number is <b>at most 1 away</b>." },
    sunny_day: { frame: 5, label: "Sunny Day", num: 2, desc: "You're <b>not required</b> to play a weather card if you have one." }, // @TODO: most unsure about this one, as it can lock the entire weather mechanic easily
    scorching_heat: { frame: 6, label: "Scorching Heat", num: 3, desc: "The wind value is <b>halved</b> (rounded down). If you <b>end a round</b> with this weather, <b>take 1 damage</b>." },
}

const TREASURE_CONDITIONS = 
{
    island_size_small: { desc: "The island has at least 3 tiles." },
    island_size_regular: { desc: "The island has at least 5 tiles." },
    island_size_large: { desc: "The island has at least 8 tiles." },
    island_shape_small: { desc: "The island's longest side has at least 3 tiles." },
    island_shape_regular: { desc: "The island's longest side has at least 5 tiles." },
    island_shape_large: { desc: "The island's longest side has at least 8 tiles." },
    island_shape_square: { desc: "The island has a square shape." },
    island_shape_rectangle: { desc: "The island has a rectangle shape." },
    island_shape_line: { desc: "The island has a line shape ( = single straight row.)" },
    num_harbors_small: { desc: "The island has exactly 1 harbor." },
    num_harbors_regular: { desc: "The island has at least 2 harbors." },
    num_harbors_large: { desc: "The island has at least 3 harbors." },
    surrounded: { desc: "The island is completely surrounded by (water) tiles." },
    surrounded_not: { desc: "The island is <b>not</b> completely surrounded by (water) tiles yet." },
    no_other: { desc: "No other treasure can be found on this island." },
    special_tiles_small: { desc: "No special tile is adjacent to this island." },
    special_tiles_regular: { desc: "At least 2 special tiles are adjacent to this island." },
    special_tiles_big: { desc: "At least 3 special tiles are adjacent to this island." },
}

const TREASURE_BONUSES =
{
    health: { desc: "<b>Repair</b> 1 health." },
    health_double: { desc: "<b>Repair</b> 2 health." },
    orient: { desc: "All players reveal their <b>Rotate</b> cards. Then orient the Ship however you like." },
    wind: { desc: "All players reveal their <b>Wind</b> cards. Then change the Wind to whatever you like." },
    look_ahead: { desc: "Start player <b>studies all cards</b> in one Compass deck." },
    look_ahead_spread: { desc: "Each player may <b>study the next 3 cards</b> in a Compass deck of choice." },
    teleport: { desc: "<b>Move</b> the Ship to any adjacent tile (horizontal, vertical, diagonal)." },
    strong_ship: { desc: "Next round, you may <b>sail over land</b> and <b>can't take damage</b>." },
    willpower: { desc: "<b>Once</b> this game, you may <b>ignore</b> all your (Health) <b>handicaps</b> for a round." },
    clear_info: { desc: "<b>Once</b> this game, you may play an entire round with cards <b>faceup</b>." },
    teleport_once: { desc: "<b>Once</b> this game, you may teleport the ship back to the <b>previous harbor's location</b>." },
    rotate_strong: { desc: "From now on, the <b>Rotate</b> card can also do a <b>half turn</b> (180 degrees)." },
    row_any: { desc: "From now on, any <b>Sail</b> card can be used as a <b>Row</b> card instead ( = move 1 forward)." },
    explore: { desc: "Discuss and <b>replace up to 5 map tiles</b> with ones from Compass decks." },
}

const MATERIAL =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [CardType.TIME]: TIME_CARDS,
    [TileType.MAP]: MAP_TILES,
    [TileType.VEHICLE]: VEHICLE_TILES,
    [TileType.PAWN]: PAWN_TILES,
}

export 
{
    GAME_DATA,
    MATERIAL,
    WEATHER_CARDS,
    TREASURE_CONDITIONS,
    TREASURE_BONUSES,
    MISC,
}
