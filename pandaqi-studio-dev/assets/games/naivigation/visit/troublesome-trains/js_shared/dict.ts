import { CardType, EventType, GameNaivigationData, MaterialNaivigationData, TileType } from "games/naivigation/js_shared/dictShared";

const GAME_DATA:GameNaivigationData = { bgColor: "#ea7731", tintColor: "#ffddc8", textColor: "#240f03", mapTileColor: "#FFFFFF" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    train: { frame: 0, label: "Train", desc: "<b>Move</b> 1 train of a matching color by <b>1 step</b>.", freq: 10 },
    switch: { frame: 1, label: "Switch", desc: "<b>Rotate</b> the <b>Switch</b> tile however you like.", freq: 10 },
    power: { frame: 2, label: "Power", desc: "<b>Rotate</b> any <b>Train</b> tile however you like.", freq: 10 },
    map: { frame: 3, label: "Map", desc: "<b>Rotate</b> 1 map tile OR <b>replace</b> 1 map tile (from deck).", freq: 5 },
    disengage: { frame: 4, label: "Disengage", desc: "<b>Move</b> all trains connected to the <b>leading car</b> to an adjacent tile.", freq: 8, sets: ["leadersFollowers"] },
    lead_change: { frame: 5, label: "Lead Change", desc: "<b>Rotate</b> both the Switch Tile and a Train Tile one quarter turn.", freq: 5, sets: ["leadersFollowers"] }, // @TODO: most uncertain about this one
    wildlife: { frame: 6, label: "Wildlife", desc: "<b>Move</b> an Animal to an adjacent tile.", freq: 6, sets: ["animalsCrossings"] },
};

const HEALTH_CARDS:Record<string,MaterialNaivigationData> =
{
    fragile_car: { subText: "Fragile Car", desc: "Driving off-track does <b>2 damage</b> (instead of 1).", num: 2 },
    trains_restricted: { subText: "Color Mix-up", desc: "If a Train card has multiple options, you must pick one of the <b>first 2</b>.", num: 3 },
    crossroads_restricted: { subText: "Overwhelmed", desc: "You <b>can't</b> change a Train's Tile if it's on a <b>crossroads</b>.", num: 2 },
    large_train: { subText: "Ultrawide Train", desc: "You already <b>hit</b> an animal if it's <b>adjacent</b> to a train car.", num: 2, sets: ["animalsCrossings"] },
    power_required: { subText: "Low Battery", desc: "Any <b>Switch</b> or <b>Map</b> cards only work if a <b>Power</b> card was played earlier.", num: 3 },
    map_limit: { subText: "Protected Area", desc: "The <b>Map</b> card is only allowed to <b>rotate</b> map tiles (never replace).", num: 4 },
    valid_network: { subText: "Rubbish Network", desc: "Any new tiles you place <b>must</b> properly connect the tracks. (If not, leave a hole.)", num: 1 },
    tired_steel: { subText: "Tired Steel", desc: "<b>No</b> Train may move twice in the same round.", num: 5 },
}

const ACTION_CARDS:Record<string,MaterialNaivigationData> =
{
    nighttrain: { frame: 0, label: "Night Train", desc: "Make 2 <b>Trains</b> OR 2 <b>Stations</b> swap places." },
    train_of_thought: { frame: 1, label: "Thought Train", desc: "Make up to 3 Trains <b>take 1 step</b> immediately (in any order)." },
    train_shrinker: { frame: 2, label: "Train Shrinker", desc: "This round, trains can <b>share a tile</b> (without colliding)." },
    control_panel: { frame: 3, label: "Control Panel", desc: "Rotate <b>all</b> Train tiles any way you want." },
    engineers: { frame: 4, label: "Engineers", desc: "<b>Change</b> (move, rotate or replace) 4 map tiles." },
}

const TIME_CARDS:Record<string,MaterialNaivigationData> =
{
    sinkhole: { label: "Sinkhole", desc: "Every train on a <b>dead end</b> takes 1 damage, then teleports to anywhere.", type: EventType.EVENT },
    reorganize: { label: "Reorganize", desc: "Swap 1 <b>Station</b> with an adjacent tile.", type: EventType.EVENT },
    railhop: { label: "Railhop", desc: "Move 1 <b>Train</b> to an adjacent tile.", type: EventType.EVENT },
    closed_stations: { label: "Closed Stations", desc: "\"Close\" 3 stations (turn facedown). You can't visit them this round.", type: EventType.EVENT },
    fried_systems: { label: "Fried Systems", desc: "Randomize the Switch and Train tiles. (Throw in the air, see how they land.)", type: EventType.EVENT },
    reattach: { label: "Reattach", desc: "<b>Rotate</b> up to 3 map tiles, but at least 1.", type: EventType.EVENT },
    nice_tracks: { label: "Nice Tracks", desc: "Find all Trains on a <b>corner</b> or <b>straight<b> track. Rotate their Train tile in any way.", type: EventType.EVENT },
    bad_tracks: { label: "Bad Tracks", desc: "Find all Trains on a <b>corner</b> track. Take 1 damage for each.", type: EventType.EVENT },
    subsidy: { label: "Rail Subsidy", desc: "If <b>no</b> Train has reached a station yet, <b>remove a Train</b> of choice.", type: EventType.EVENT },
    subsidy_big: { label: "Rail Subsidy+", desc: "If <b>no</b> Train has reached a station yet, <b>gain 2 Health</b>.", type: EventType.EVENT },

    magic_trains: { label: "Magic Trains", desc: "Trains are allowed to <b>share a tile</b> (without colliding)", type: EventType.RULE },
    frozen_switch: { label: "Frozen Switch", desc: "Every train on a <b>crossroads</b> is not allowed to move.", type: EventType.RULE },
    damaged_switches: { label: "Damaged Switches", desc: "The <b>Switch</b> card does nothing.", type: EventType.RULE },
    power_outage: { label: "Power Outage", desc: "The <b>Power</b> card does nothing.", type: EventType.RULE },
    multi_movement: { label: "Massive Mover", desc: "Whenever you play a <b>Train</b> card, move <b>all</b> trains depicted on it 1 step.", type: EventType.RULE },
    safe_trains: { label: "Safe Trip", desc: "<b>Pick 2 Trains</b>: they are <b>\"safe\"</b>. They can't go off-track or take damage this round.", type: EventType.RULE },
    careful_trip: { label: "Careful Trip", desc: "<b>Pick 2 Trains</b>: they're the only ones allowed to move this round.", type: EventType.RULE },
    supersonic: { label: "Supersonic", desc: "Every train movement is <b>doubled</b> (2 steps instead of 1).", type: EventType.RULE },

    
    damage_for_info: { label: "Wipers", desc: "<b>Take 1 damage</b> to play all cards <b>faceup</b> this round.", type: EventType.OFFER }, 
    damage_for_orient: { label: "Slippery", desc: "<b>Take 1 damage</b> to <b>orient</b> your car in any way.", type: EventType.OFFER }, 
    damage_for_crossroads: { label: "Rocket Launch", desc: "<b>Take 1 damage</b> to <b>replace</b> up to 3 crossroads with any tile(s) from deck.", type: EventType.OFFER }, 

    cruise_disable: { label: "No Cruising", desc: "<b>Cruise Control</b> doesn't work.", type: EventType.RULE },
    cruise_penalty: { label: "No Control", desc: "Executing <b>Cruise Control</b> incurs 1 damage.", type: EventType.RULE },
}

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialNaivigationData> =
{
    empty: { frame: -1, label: "Regular", freq: 20 },
    station_0: { frame: 0, label: "Station", collectible: true },
    station_1: { frame: 1, label: "Station", collectible: true },
    station_2: { frame: 2, label: "Station", collectible: true },
    station_3: { frame: 3, label: "Station", collectible: true },
    station_4: { frame: 4, label: "Station", collectible: true },

    crossing: { frame: 13, label: "Crossing", desc: "When added to the map, place a new Animal Pawn on it.", freq: 5, sets: ["animalsCrossings"] },
}

const VEHICLE_TILES:Record<string,MaterialNaivigationData> =
{
    vehicle_0: { frame: 5, label: "Train Purple", freq: 2 },
    vehicle_1: { frame: 6, label: "Train Red", freq: 2 },
    vehicle_2: { frame: 7, label: "Train Blue", freq: 2 },
    vehicle_3: { frame: 8, label: "Train Green", freq: 2 },
    vehicle_4: { frame: 9, label: "Train Orange", freq: 2 },
}

const PAWN_TILES:Record<string,MaterialNaivigationData> =
{
    pawn_deer: { frame: 10, label: "Deer", sets: ["animalsCrossings"], freq: 2 },
    pawn_bunny: { frame: 11, label: "Bunny", sets: ["animalsCrossings"], freq: 2 },
    pawn_bear: { frame: 12, label: "Bear", sets: ["animalsCrossings"], freq: 2 },
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    switch_0_template: { frame: 2 },
    switch_1_template: { frame: 3 },
    switch_2_template: { frame: 4 },
    switch_3_template: { frame: 5 },
    switch_4_template: { frame: 6 },
    train_template: { frame: 7 },
}

const NETWORK_TYPES =
{
    regular: { frame: 0, desc: "Nothing special." },
    speedy: { frame: 1, desc: "Any step taken on it is <b>doubled</b>." },
    one_way: { frame: 2, desc: "Only allows moving over it in the direction shown." },
    safety: { frame: 3, desc: "While here, you can't take damage." },
    double: { frame: 4, desc: "Allows 2 trains without colliding." },
    colored: { frame: 5, desc: "Only trains of the color(s) shown are allowed." }
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
    NETWORK_TYPES,
    MISC,
}
