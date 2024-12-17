import { CardType, EventType, GameNaivigationData, MaterialNaivigationData, PASSENGERS, TileType } from "games/naivigation/js_shared/dictShared";

const GAME_DATA:GameNaivigationData = { bgColor: "#9bc61b", tintColor: "#f7ffdf", textColor: "#1c2402", mapTileColor: "#FFFFFF" };

//
// Vehicle Cards (thing #1 that'll be unique for each game)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    gear: { frame: 0, label: "Gear", desc: "<b>Change Gear</b> by as much as the <b>slot number</b> in which it's played (up or down).", freq: 10 },
    drive: { frame: 1, label: "Drive", desc: "<b>Move</b> as many tiles <b>forward</b> as your <b>Gear</b>. (Negative Gear = Backward.)", freq: 12 },
    turn: { frame: 2, label: "Turn", desc: "<b>Rotate</b> as many quarter turns to the <b>right</b> as your <b>Gear</b>. (Negative Gear = Turn Left)", freq: 10 },
    cruise_control: { frame: 3, label: "Cruise", desc: "<b>Move once</b> (Drive or Turn) while <b>ignoring Gear</b>.", freq: 6 },
    police: { frame: 4, label: "Police", desc: "Adjacent to Police? Move them <b>1 tile away</b> from you. Otherwise, move them <b>1 tile closer</b>.", freq: 7, sets: ["trafficPolice"] },
    lock_doors: { frame: 5, label: "Lock Doors", desc: "This round, hitting the Police <b>doesn't</b> harm you in any way.", freq: 4, sets: ["trafficPolice"] },
    refuel: { frame: 6, label: "Refuel", desc: "<b>Gain</b> as much <b>Fuel</b> as your current <b>Gear</b>.", freq: 6, sets: ["fuelFear"] },
    unload: { frame: 7, label: "(Un)Load", desc: "Grab a <b>new passenger</b> from the deck OR <b>drop off</b> an existing passenger.", freq: 6, sets: ["taxisCargo"] },
    radio: { frame: 8, label: "Radio On", desc: "This round, <b>ignore the curses</b> of all your passengers.", freq: 4, sets: ["taxisCargo"] },

};

const HEALTH_CARDS:Record<string,MaterialNaivigationData> =
{
    fragile_car: { subText: "Fragile Car", desc: "Driving off-road does <b>2 damage</b> (instead of 1).", num: 2 },
    careful_steering: { subText: "Tiny Wheel", desc: "All <b>Turn</b> cards only turn one step (regardless of Gear).", num: 4 },
    stuck_elevation: { subText: "Stuck Stick", desc: "The first Gear card determines how all later Gear cards work (up or down).", num: 2 },
    distracted: { subText: "Distracted", desc: "After executing <b>Cruise</b>, <b>reset Gear</b> to 0.", num: 4 },
    slipping: { subText: "Slipping", desc: "Once you <b>Turn</b> in a round, you Turn that same way again <b>after every card</b> executed.", num: 1 },
    gear_limit: { subText: "Broken Gears", desc: "Reduce your <b>Gear</b> deck to only values -1, 0 and 1.", num: 3 },
    crossroads_limit: { subText: "Overwhelmed", desc: "Any card other than <b>Drive</b> is ignored if you're on a <b>crossroads</b>.", num: 1 },
    foggy_window: { subText: "Foggy Window", desc: "<b>No</b> cards may ever be played <b>faceup</b> (for whatever reason).", num: 5 },
}

const ACTION_CARDS:Record<string,MaterialNaivigationData> =
{
    towtruck: { frame: 0, label: "Towtruck", desc: "Put <b>3 crossroads tiles</b> back into the map." },
    refueler: { frame: 1, label: "Refueler", desc: "<b>Replenish fuel.</b> Ignore any fuel lost (this round).", sets: ["fuelFear"] },
    souped_up: { frame: 2, label: "Souped-Up", desc: "Change your <b>Gear</b> to whatever you want." },
    drive_through: { frame: 3, label: "Drive-Through", desc: "This round, <b>collect</b> a shop by <b>visiting it directly</b> (instead of via parking)." },
    parking_attendant: { frame: 4, label: "Parking Attendant", desc: "<b>Move or Rotate</b> 1 parking lot." },
}

const TIME_CARDS:Record<string,MaterialNaivigationData> =
{
    sinkhole: { label: "Sinkhole", desc: "If you're on a <b>crossroads</b> or <b>dead end</b>, take 1 damage, but move to anywhere.", type: EventType.EVENT },
    fuel_explosion: { label: "Fuel Explosion", desc: "<b>Reduce your Fuel</b> tank to 1.", type: EventType.EVENT, sets: ["fuelFear"] },
    gear_breakdown: { label: "Gear Breakdown", desc: "<b>Reset your Gear</b> to 0.", type: EventType.EVENT },
    shops_closing: { label: "Shops Closing", desc: "\"Close\" 3 shops (turn facedown). You can't visit them this round.", type: EventType.EVENT },
    
    damage_for_info: { label: "Wipers", desc: "<b>Take 1 damage</b> to play all cards <b>faceup</b> this round.", type: EventType.OFFER }, 
    damage_for_orient: { label: "Slippery", desc: "<b>Take 1 damage</b> to <b>orient</b> your car in any way.", type: EventType.OFFER }, 
    damage_for_crossroads: { label: "Rocket Launch", desc: "<b>Take 1 damage</b> to <b>replace</b> up to 3 crossroads with any tile(s) from deck.", type: EventType.OFFER }, 

    cruise_disable: { label: "No Cruising", desc: "<b>Cruise Control</b> doesn't work.", type: EventType.RULE },
    cruise_penalty: { label: "No Control", desc: "Executing <b>Cruise Control</b> incurs 1 damage.", type: EventType.RULE },
    fuel_conservation: { label: "Fuel Supertank", desc: "Whatever you do, you only lose <b>1 Fuel</b> this round.", type: EventType.RULE, sets: ["fuelFear"] },
    supersonic: { label: "Supersonic", desc: "Set your Gear to maximum. You <b>can't collect a shop</b> this round.", type: EventType.RULE },
    careful_driving: { label: "Careful Driving", desc: "If you end the round on <b>Gear 0</b>, <b>repair</b> 1 damage.", type: EventType.RULE },
    strong_car: { label: "Strong Wheels", desc: "Going off-road incurs <b>no damage</b>.", type: EventType.RULE },
}

//
// The map tiles (thing #2 that'll be unique each game---there are no "shared" map tiles)
//
const MAP_TILES:Record<string,MaterialNaivigationData> =
{
    empty: { frame: -1, label: "Regular", freq: 30 },
    shop_0: { frame: 0, label: "Shop", collectible: true },
    shop_1: { frame: 1, label: "Shop", collectible: true },
    shop_2: { frame: 2, label: "Shop", collectible: true },
    shop_3: { frame: 3, label: "Shop", collectible: true },
    shop_4: { frame: 4, label: "Shop", collectible: true },
    starting_tile: { frame: 8, label: "Starting Tile", freq: 1, starting: true },
    parking_lot: { frame: 9, label: "Parking Lot", freq: 5 },
    stop_sign: { frame: 10, label: "Stop Sign", desc: "End the round. Reset Gear to 0.", freq: 2 },
    construction: { frame: 11, label: "Construction Work", desc: "Take 1 damage.", freq: 2 },
    earthquake: { frame: 12, label: "Earthquake", desc: "Swap 2 map tiles OR replace 1 map tile (from deck).", freq: 2 },
    traffic_light: { frame: 13, label: "Traffic Light", desc: "You must move away from this tile with a card past slot 3. Otherwise, law broken.", sets: ["trafficPolice"], freq: 3 },
    max_speed: { frame: 14, label: "Max Speed", desc: "Your Gear must stay between 1 and 2. Otherwise, law broken.", sets: ["trafficPolice"], freq: 3 },
    gas_station: { frame: 15, label: "Gas Station", desc: "Completely refill your Fuel.", sets: ["fuelFear"], freq: 2 },
    tunnel: { frame: 16, label: "Tunnel", desc: "Move once (Drive or Turn) in any direction. Another tunnel exists? Teleport there.", sets: ["terrainTripplanning"], freq: 3 }, // used to be "crane" or "roadworker"
    shop_special_1: { frame: 17, label: "Shop Special", collectible: true, sets: ["terrainTripplanning"] }, // simply has a new illustration + higher number?
    shop_special_2: { frame: 18, label: "Shop Special", collectible: true, sets: ["terrainTripplanning"] }, // simply has a new illustration + higher number?
}

const VEHICLE_TILES:Record<string,MaterialNaivigationData> =
{
    vehicle_0: { frame: 5, label: "Vehicle" },
    vehicle_1: { frame: 6, label: "Vehicle" },
    vehicle_2: { frame: 7, label: "Vehicle" },
}

const PAWN_TILES:Record<string,MaterialNaivigationData> =
{
    pawn_police: { frame: 19, label: "Police", sets: ["trafficPolice"], freq: 3 },
}

const PASSENGER_BONUSES:Record<string, MaterialNaivigationData> =
{
    health: { desc: "<b>Repair</b> 1 health." },
    health_double: { desc: "<b>Repair</b> 2 health." },
    orient: { desc: "All players reveal their <b>Turn</b> cards. Then orient the Car however you like." },
    gear: { desc: "All players reveal their <b>Gear</b> cards. Then change the Gear to whatever you like." },
    teleport: { desc: "<b>Move</b> the Car to any adjacent tile (horizontal, vertical, diagonal)." },
    no_parking: { desc: "Next round, you can <b>visit</b> shops directly by driving onto its tile." },
    easy_parking: { desc: "Next round, you can enter a <b>parking lot</b> even if you have the wrong orientation." },
    health_replace: { desc: "From now on, only replace <b>3 crossroads tiles</b> when you take damage that way." },
    rotate_strong: { desc: "From now on, the <b>Turn</b> cards can also do a <b>half turn</b> (180 degrees)." },
    rotate_both: { desc: "From now on, the <b>Turn</b> card can go both directions (regardless of Gear)." },
    willpower: { desc: "<b>Once</b> this game, you may <b>ignore</b> all your (Health) <b>handicaps</b> for a round." },
    clear_info: { desc: "<b>Once</b> this game, you may play an entire round with cards <b>faceup</b>." },
    look_ahead: { desc: "Show the <b>next 8 cards</b> of the deck to everyone." },
    look_hands: { desc: "Everyone <b>shows their hand cards</b> to each other." },
    wrapping: { desc: "From now on, the <b>map wraps around</b>. (Going off one side brings you to the other side.)" },
    large_car: { desc: "Your car can <b>carry 1 more</b> passenger." },
    gigantic_car: { desc: "Your car can <b>carry 2 more</b> passengers." },
    cargo_change: { desc: "Either <b>add or remove</b> up to 2 <b>passengers</b>." },
    no_curses: { desc: "Next round, <b>ignore</b> all passenger <b>curses</b>." },
    insta_park: { desc: "Check the deck for a <b>parking lot</b>. Place it next to any shop." },
    terrain_car: { desc: "Next round, you can move <b>off the road</b> without taking damage." }
}

const PASSENGER_CURSES:Record<string, MaterialNaivigationData> =
{
    nothing: { desc: "No curse." },
    bad_passenger: { desc: "If this is the <b>final remaining passenger</b>, you instantly <b>lose</b> the game." },
    urgent_passenger: { desc: "You <b>can't deliver other passengers</b> until you delivered me." },
    stuck_steering: { desc: "The car can only <b>Turn</b> once per round." },
    limited_steering: { desc: "<b>Turn</b> cards only work in slot 3 and 4." },
    fly_ignore: { desc: "The first <b>Drive</b> card is ignored." },
    damage_slowdown: { desc: "Whenever you take damage, move your Gear 1 card closer to 0." },
    slow_starter: { desc: "<b>Gear</b> cards only work in slot 1 and 2." },
    limited_cruising: { desc: "The <b>Cruise Control</b> card only works if played in the first or last slot." },
    parking_restricted: { desc: "You can only visit <b>one shop</b> per parking lot." },
    tile_restricted: { desc: "You <b>can't visit</b> two special tiles in the same round. (This includes shops and parking.)" },
    number_restricted: { desc: "You can only <b>visit a shop</b> with a card in the same <b>slot</b> as its number." },
    wanted_passenger: { desc: "You already \"collide\" with the <b>Police</b> car if it's <b>adjacent</b> to you." },
    fuel_cutoff: { desc: "Your Fuel tank only contains at most <b>7 cards</b>." },
    small_car: { desc: "Your car can <b>carry 1 fewer</b> passenger." },
    tiny_car: { desc: "Your car can <b>carry 2 fewer</b> passengers." },
    slow_loading: { desc: "Only the first <b>(Un)Load</b> card in a round works." }
}

const NETWORK_TYPES =
{
    regular: { frame: 0, desc: "Nothing special." },
    dirt_road: { frame: 1, desc: "Your Gear instantly jumps to -1. It can't go above it while here." },
    asphalt: { frame: 2, desc: "Your Gear instantly jumps to 4. It can't go below while here." },
    cobblestones: { frame: 3, desc: "Turning here always incurs 1 damage." },
}

const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    gear_template: { frame: 2 },
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
    NETWORK_TYPES,
    MISC,
}
