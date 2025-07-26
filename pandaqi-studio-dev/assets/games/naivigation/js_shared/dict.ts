import Point from "lib/pq-games/tools/geometry/point";
import { CardType, EventType, MISC_SHARED, MaterialNaivigationData, TileType } from "./dictShared";

//
// Vehicle Cards (only 1 for the shared material)
//
const VEHICLE_CARDS:Record<string,MaterialNaivigationData> = 
{
    discuss: { shared: true, frame: 2, label: "Discuss", desc: "You may <b>communicate</b> until you decide to execute the next card.", freq: 5 },
    speedup: { shared: true, frame: 3, label: "Speedup", desc: "Remove or Add <b>1 Instruction Slot</b>. (There must be at least 3 and at most 8 slots.)", freq: 6 },
    wildcard: { shared: true, frame: 4, label: "Wildcard", desc: "Execute any possible <b>Vehicle Card</b> in the game.", freq: 5 }
};

//
// Health Cards (a lot of them; keep their text/handicap simple though)
//
const HEALTH_CARDS:Record<string,MaterialNaivigationData> = 
{
    //last_life: { shared: true, label: "Regular Life", desc: "Nothing special.", num: 1, freq: 2 },
    be_special: { shared: true, label: "Be Special", desc: "Card types are only <b>executed once</b>. (Ignore duplicates.) <b>All cards</b> are duplicates? <b>Take 1 damage.</b>", num: 3 },
    random_draw: { shared: true, label: "Random Draw", desc: "The <b>first card</b> of the round must be randomly selected.", num: 3 },
    first_from_left: { shared: true, label: "First from Left", desc: "Players must play their card at the <b>first</b> available spot from the <b>left</b>.", num: 2 },
    first_from_right: { shared: true, label: "First from Right", desc: "Players must play their card at the <b>first</b> available spot from the <b>right</b>.", num: 2 }, // @NOTE: "last from left" = "first from right"
    delayed_draw: { shared: true, label: "Delayed Draw", desc: "<b>Don't draw new cards</b> until your hand is completely empty.", num: 3 },
    last_player_disabled: { shared: true, label: "One Fewer Instruction", desc: "1 Instruction Slot must remain <b>empty</b>", num: 5 },
    last_player_double: { shared: true, label: "One More Instruction", desc: "The <b>start player</b> must play <b>2 instructions</b> in one turn.", num: 3 },
    double_round: { shared: true, label: "Double Round", desc: "You play <b>2 rounds</b> (creating a double row) before executing instructions.", num: 3 },
    forced_follow: { shared: true, label: "Forced Follow", desc: "<b>Start player</b> plays their card <b>faceup</b>. All other players must play the <b>same type of card</b> if they have it.", num: 4  },
    lower_hand_limit: { shared: true, label: "Lower Hand Limit", desc: "The <b>hand limit</b> is permanently lowered by 1.", num: 3 },
    forced_spot: { shared: true, label: "Forced Spot", desc: "The <b>first card</b> of the round must be played at a random slot (the other players vote on this).", num: 4 },
    random_replace: { shared: true, label: "Random Replace", desc: "<b>End of round</b>: start player must <b>replace</b> one card played with a random one from hand or deck.", num: 5 },
    limited_communication: { shared: true, label: "Limited Communication", desc: "The <b>Discuss</b> card only counts when it's the <b>first card</b> executed.", num: 5 },
    risky_turns: { shared: true, label: "Risky Turns", desc: "<b>End of round</b>: Take <b>1 damage</b> if you end on the same tile as you began.", num: 4 },
    risky_rotations: { shared: true, label: "Risky Rotations", desc: "<b>End of round</b>: Take <b>1 damage</b> if the vehicle ends at its starting orientation.", num: 3 },
    out_of_order: { shared: true, label: "Out Of Order", desc: "Before executing, <b>shuffle</b> the first 3 instruction tokens. Then execute in <b>numeric order</b>.", num: 1 },
    forced_swap: { shared: true, label: "Forced Swap", desc: "Each round, one player must <b>discard</b> their hand and draw new cards from the deck, before playing their first card.", num: 3 },
    forced_order: { shared: true, label: "Forced Order", desc: "Your first card played (in a round) must be in numerical order (left to right)", num: 2 },
    no_neighbors: { shared: true, label: "No Neighbors", desc: "Nobody is allowed to play a card next to the previously played card (unless this is unavoidable).", num: 2 },
    prepared_instruction: { shared: true, label: "Prepared Instruction", desc: "<b>Start of Round:</b> add the top card of the deck faceup into the 3 slot.", num: 4 },
    starting_confusion: { shared: true, label: "Starting Confusion", desc: "Each round, one player must play <b>their entire hand</b> in one turn, to become start player next round.", num: 2 },
    delayed_decisions: { shared: true, label: "Delayed Decisions", desc: "Cards that require a <b>decision</b> (when executed) are <b>ignored</b> if played before <b>slot 3</b>.", num: 3 },
    new_decider: { shared: true, label: "New Decider", desc: "Whoever plays their card in <b>slot 3</b> decides how cards are <b>executed</b> (instead of start player).", num: 4 },
    one_decision: { shared: true, label: "One Decision", desc: "If multiple cards are played that require a <b>decision</b> (when executed), only the <b>first one</b> is actually executed.", num: 2 },
    earlier_decisions: { shared: true, label: "Earlier Decisions", desc: "Nobody may play a card that requires a <b>decision</b> (when executed) in the last slot (if possible).", num: 2 },
    cross_decisions: { shared: true, label: "Cross Decisions", desc: "If playing with 2 teams, the first card that requires a <b>decision</b> (when executed) is handled by the <b>other team</b>.", num: 1 } // @TODO: Not sure if this is okay?
};

//
// GPS Cards =>
// The actual red/green tiles are randomly generated
// But the dictionary below contains the bonuses/penalties for GPS cards
//
const GPS_REWARDS:Record<string,MaterialNaivigationData> = 
{
    health: { desc: "Repair 1 damage.", prob: 2.0 },
    health_plus: { desc: "Repair 2 damage.", prob: 0.25 },
    cards: { desc: "All players draw 2 more cards." },
    move: { desc: "You may move the vehicle to any adjacent square." },
    orient: { desc: "You may orient the vehicle however you want.", prob: 0.5 },
    reveal: { desc: "All players may reveal their cards.", prob: 0.66 },
    discuss: { desc: "Pretend a Discuss card was played.", prob: 0.66 },
    handicap: { desc: "Next round, ignore all your handicaps." },
    faceup: { desc: "Next round, at most 3 cards may be played faceup." },
    faceup_single: { desc: "Next round, 1 player may play their card faceup." },
    no_gps: { desc: "Next round has no GPS card." }, // @NOTE: this can be both good or bad, so added to both
    good_gps: { desc: "Next round, all highlighted GPS squares are GOOD." },
    slots_change: { desc: "Change the number of slots to any number between 3 and 8." },
    start_player: { desc: "You may vote a new start player.", prob: 0.33 },
    autonomy: { desc: "Next round, each player decides how to execute their own card.", prob: 0.66 },
    one_exception: { desc: "Next round, after revealing, you may pick 1 card to ignore.", prob: 0.5 },
}

const GPS_PENALTIES:Record<string,MaterialNaivigationData> = 
{
    health: { desc: "Take 1 damage.", prob: 2.0 },
    health_plus: { desc: "Take 2 damage.", prob: 0.5 },
    cards: { desc: "All players discard their cards." },
    move: { desc: "Move the vehicle back to where it started." },
    orient: { desc: "Rotate the vehicle back to how it started.", prob: 0.5 },
    reveal: { desc: "You may not reveal hand cards if you collect a tile.", prob: 0.5 },
    discuss: { desc: "All Discuss cards in hands must be discarded." },
    no_actions: { desc: "Next round, no action cards may be played." },
    forced_first: { desc: "Next round, start player must play their first card in slot 1." },
    no_moving: { desc: "Next round, any card that moves the vehicle is ignored.", prob: 0.5 },
    no_rotating: { desc: "Next round, any card that rotates the vehicle is ignored." },
    forced_order: { desc: "Next round, players must play cards in order." },
    no_gps: { desc: "Next round has no GPS card." },
    bad_gps: { desc: "Next round, all highlighted GPS squares are BAD." },
    slots_change: { desc: "Permanently add or remove 1 instruction slot.", prob: 0.5 },
    shuffle: { desc: "Next round, shuffle instructions before executing.", prob: 0.66 }
}


//
// Time Cards
// This doubles as an "event expansion" that always works nicely in games
//
const TIME_CARDS:Record<string,MaterialNaivigationData> = 
{
    blank: { shared: true, label: "Regular Card", desc: "Nothing special.", freq: 10, type: EventType.NONE },

    look_ahead: { shared: true, label: "Look Ahead", desc: "Look at the <b>next 8 Time Cards</b>.", freq: 2, type: EventType.EVENT },
    change_future: { shared: true, label: "Change the Future", desc: "Look at the <b>next 4 Time Cards</b> and put them back any way you want.", freq: 2, type: EventType.EVENT },
    sudden_move: { shared: true, label: "Sudden Move", desc: "Move the vehicle to any <b>adjacent tile</b>, except collectible tiles.", type: EventType.EVENT },
    sudden_steer: { shared: true, label: "Sudden Steer", desc: "<b>Orient</b> the vehicle any way you want.", type: EventType.EVENT },
    extra_cards: { shared: true, label: "Extra Cards", desc: "All players draw <b>1 extra card</b>.", type: EventType.EVENT },
    steal_cards: { shared: true, label: "Steal Cards", desc: "All players <b>steal 1 card</b> from their left neighbor", type: EventType.EVENT },
    just_missed_it: { shared: true, label: "Just Missed It", desc: "Pick one tile you already <b>collected</b>. Put it <b>back on the map</b> (adjacent to any tile).", type: EventType.EVENT },
    teleport: { shared: true, label: "Teleport", desc: "Teleport the vehicle to any other tile in the same row or column.", type: EventType.EVENT },

    time_for_healing: { shared: true, label: "Healing Powers", desc: "Lose 3 time to ignore any damage taken this round.", type: EventType.OFFER }, 
    damage_for_time: { shared: true, label: "Trade for Time", desc: "Take 1 Damage to regain 3 Time.", freq: 2, type: EventType.OFFER },
    time_for_damage: { shared: true, label: "Trade for Damage", desc: "Lose 3 Time to regain 1 Health.", freq: 2, type: EventType.OFFER },
    damage_for_info: { shared: true, label: "Risky Info", desc: "Take 1 Damage to allow an Open Round: everyone shows their hands and plays cards faceup.", type: EventType.OFFER },
    invaluable_gift: { shared: true, label: "Invaluable Gift", desc: "Put one tile you already collected back on the map, to regain 6 Time or 2 Health.", type: EventType.OFFER },

    repeat_round: { shared: true, label: "Repeat Round", desc: "Once done, <b>repeat</b> the exact instructions of this round.", type: EventType.RULE },
    good_communication: { shared: true, label: "Good Communication", desc: "All cards must be played <b>faceup</b>.", type: EventType.RULE },
    orderly_communication: { shared: true, label: "Orderly Communication", desc: "All cards must be played <b>in order</b>. (Either left to right or vice versa.)", type: EventType.RULE },
    bad_communication: { shared: true, label: "Bad Communication", desc: "<b>No</b> card may be played <b>faceup</b> for any reason.", type: EventType.RULE },
    forbidden_communication: { shared: true, label: "Forbidden Communication", desc: "Pick a Vehicle Card in the game. It's forbidden to play this card this round", type: EventType.RULE },
    linked_minds: { shared: true, label: "Linked Minds", desc: "If all players <b>played the same card type</b>, regain 1 Health.", type: EventType.RULE },
    collection_bonus: { shared: true, label: "Collection Bonus", desc: "If you <b>collected</b> a tile, put this card back into the Time Deck.", type: EventType.RULE },
    collection_penalty: { shared: true, label: "Collection Penalty", desc: "If you <b>collected</b> a tile, lose 2 more Time.", type: EventType.RULE },
    idle_bonus: { shared: true, label: "Idle Bonus", desc: "If you end with the same <b>orientation</b> as you started, repair 1 damage.", type: EventType.RULE },
    idle_penalty: { shared: true, label: "Idle Penalty", desc: "If you end on the <b>same tile</b> as you started, lose 3 more Time.", type: EventType.RULE },
    autonomy: { shared: true, label: "Autonomy", desc: "Each player decides how to execute <b>their own card</b> (instead of start player deciding for all)." },
    new_decider: { shared: true, label: "New Decider", desc: "Whoever played into the <b>last slot</b> decides how cards are <b>executed</b> (instead of start player deciding for all)." },
    majority_voting: { shared: true, label: "Majority Voting", desc: "When executing cards that require a <b>decision</b>, players vote (without discussion) on which decision to take." },

    gps_bonus: { shared: true, label: "GPS Bonus", desc: "If you <b>followed the GPS</b>, put this card back into the Time Deck.", required: ["GPSCards"], type: EventType.RULE },
    gps_penalty: { shared: true, label: "GPS Penalty", desc: "If you <b>ignored the GPS</b>, lose 2 more Time.", required: ["GPSCards"], type: EventType.RULE },
};

//
// Action Cards
//
const ACTION_CARDS:Record<string,MaterialNaivigationData> = 
{
    // these were added much later
    take_control: { shared: true, frame: 5, label: "Take Control", desc: "This round, each player decides how to execute <b>their own card</b> (instead of start player deciding for all)." },
    new_driver: { shared: true, frame: 6, label: "New Driver", desc: "From now on, whoever played this card <b>makes decisions</b> (for cards that require a decision when executed)." },
    window_gazing: { shared: true, frame: 7, label: "Window Gazing", desc: "Play <b>faceup</b>. Any card played that requires a <b>decision</b> (when executed) may be played <b>faceup</b> this round." },
    superman: { shared: true, frame: 8, label: "Superman", desc: "Play <b>faceup</b>. Ignore all your <b>handicaps</b> this round." },

    // the basics
    share_hand: { shared: true, frame: 11, label: "Share Hand", desc: "All players <b>reveal</b> their cards to each other." },
    bumper_strong: { shared: true, frame: 12, label: "Strong Bumper", desc: "Any <b>involuntary damage</b> taken this round is <b>ignored</b>." }, // @NOTE: "involuntary" is to prevent against stuff like offers to trade damage for time being abused
    bumper_weak: { shared: true, frame: 13, label: "Weak Bumper", desc: "<b>Take 1 damage</b> for sure. But any damage beyond that is <b>ignored</b> this round." },

    look_ahead: { shared: true, frame: 14, label: "Look Ahead", desc: "Play <b>faceup</b>. Look at all instructions played so far." },
    copy_before: { shared: true, frame: 15, label: "Copy Before", desc: "This card becomes the <b>same</b> as the <b>previously executed card</b>." }, // @NOTE: copy_after is confusing, so left out

    sudden_insight: { shared: true, frame: 16, label: "Sudden Insight", desc: "<b>Replace</b> an instruction yet to be revealed with one from your hand." },
    change_of_plans: { shared: true, frame: 17, label: "Change of Plans", desc: "Look at all instructions yet to be revealed and <b>rearrange</b> them as desired." },
    back_it_up: { shared: true, frame: 18, label: "Back it up", desc: "From now on, unhandled instructions are executed in <b>reverse order</b> (right to left)." },

    late_arrival: { shared: true, frame: 19, label: "Late Arrival", desc: "<b>Play another card</b> to any vehicle's instruction row." },
    try_that_again: { shared: true, frame: 20, label: "Try Again", desc: "<b>Return the vehicle</b> to the tile at which it started this round." },
    
    make_space: { shared: true, frame: 21, label: "Make Space", desc: "Play an instruction at a slot already occupied. That card (and all after it) <b>shift</b> one position to the right." },
    clear_instructions: { shared: true, frame: 22, label: "Clear Path", desc: "Play <b>faceup</b>. All cards played <b>before</b> this one may also be played faceup." },
    
    ghost_driver: { shared: true, frame: 23, label: "Ghost Driver", desc: "All instructions that Move or Orient the vehicle are <b>inverted</b> from now on." },
    repair_shop: { shared: true, frame: 24, label: "Repair Shop", desc: "<b>Repairs</b> 1 damage, but all other instructions this round are <b>undone or ignored</b>." },
    scenic_route: { shared: true, frame: 25, label: "Scenic Route", desc: "All instructions from now on count <b>double</b>." },

    // these are cool, but slightly more complex
    turn_around: { shared: true, frame: 26, label: "Turn Around", desc: "Play <b>faceup</b>. Take a vote. If the majority <b>agrees</b>, discard all instructions and start the next round." }, // OLD POWER: "When executing instructions this round, you may choose whether to execute a card (or not) after revealing."
    double_time: { shared: true, frame: 27, label: "Double Time", desc: "Play <b>faceup</b>. This round, anyone may play 2 cards on top of each other. Decide which one is true once executed." }, // OLD POWER: "Play another card <b>on top</b> of an instruction yet to be revealed."
    reconsider: { shared: true, frame: 28, label: "Reconsider", desc: "Play <b>faceup</b>. Study all instructions and either <b>rearrange</b> or <b>swap</b> them all for random deck cards." },

    // these need the GPS cards
    lost_signal: { shared: true, frame: 29, label: "Lost Signal", desc: "<b>Remove</b> the <b>GPS card</b> for this round.", required: ["GPSCards"] },
    advanced_gps: { shared: true, frame: 30, label: "Advanced GPS", desc: "Study the next <b>5 GPS cards</b> and <b>rearrange</b> in any order desired." },
    
    // these need the time deck
    crystal_ball: { shared: true, frame: 31, label: "Crystal Ball", desc: "<b>Look at</b> the next 5 cards of the <b>Time Deck</b>.", required: ["timeCards"] },

};

type MaterialData = Record<string, MaterialNaivigationData>;

const MATERIAL:Record<CardType, MaterialData> =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [CardType.GPS]: {},
    [CardType.TIME]: TIME_CARDS,
    [CardType.ACTION]: ACTION_CARDS,
    [CardType.INSTRUCTION]: {},
    [CardType.COMPASS]: {},
    [CardType.CUSTOM]: {},
    [CardType.PASSENGER]: {},
    [CardType.FUEL]: {}
}

interface TemplateData
{
    frameTemplate?:number, // frame for template at the bottom
    frameIcon?: number, // frame for big main illustration
    textureKey?: string,
    bgColor?: string, // color used for filling entire background of card
    tintColor?: string, // color used for tinting template (bg for title + text)
    label?: string, // title, heading
    subText?: string, // smaller piece below it, mostly to indicate card type literally
    desc?: string, // the actual text on card; usually overriden by specific card
    smallIconOffset?: Point, // placement of smaller versions of icons is one major difference between templates
    extraNumberOffset?: Point, // where to position the (optional) number on a select few templates
    titleTextPos?: Point, // where to position the title text, for customization on some templates
    iconScale?: Point, // how to scale the main icon (relative to the usual (1,1) scale)
    iconOffset?: Point, // offset for the MAIN icon
}

const TEMPLATES:Record<string, TemplateData> =
{
    [CardType.VEHICLE]: { frameTemplate: 0, bgColor: "#FFFFFF", tintColor: "#DADADA", label: null, subText: "Vehicle Card", smallIconOffset: new Point(0.33, 0), textureKey: "vehicle_cards" },
    [CardType.HEALTH]: { frameTemplate: 2, frameIcon: 5, bgColor: "#F9C98C", label: null, subText: "Health", smallIconOffset: new Point(0.35, -0.05), extraNumberOffset: new Point(0.46, 0), textureKey: "misc_shared" },
    [CardType.GPS]: { frameTemplate: 3, frameIcon: 6, bgColor: "#A6741A", label: "GPS", subText: null, titleTextPos: new Point(0.5, 0.605), textureKey: "misc_shared" },
    [CardType.TIME]: { frameTemplate: 4, frameIcon: 7, bgColor: "#4AD9FC", label: "Time", subText: "Event", extraNumberOffset: new Point(0.46, -0.2), textureKey: "misc_shared" },
    [CardType.FUEL]: { frameTemplate: 5, frameIcon: 12, bgColor: "#3A3A3A", label: "Fuel", subText: null, desc: "Worth 1 Fuel.", textureKey: "misc_shared" },
    [CardType.ACTION]: { frameTemplate: 1, bgColor: "#FFFFFF", tintColor: "#DADADA", label: null, subText: "Action Card", smallIconOffset: new Point(0.4125, 0), textureKey: "icons" },
    [CardType.INSTRUCTION]: { frameIcon: 1, textureKey: "icons" },
    [CardType.COMPASS]: { frameIcon: 0, textureKey: "icons" },
    [CardType.PASSENGER]: { frameTemplate: 6, bgColor: "#f5b7ff", label: null, subText: "Cargo", titleTextPos: new Point(0.5, 0.39), iconScale: new Point(0.63), iconOffset: new Point(0, -0.125), textureKey: "persons" },
    [TileType.MAP]: { textureKey: "map_tiles" },
    [TileType.VEHICLE]: { textureKey: "map_tiles" },
    [TileType.PAWN]: { textureKey: "map_tiles" },
}

const NUM_BG_BLOBS = 4
const MISC = MISC_SHARED

export 
{
    MATERIAL,
    MISC,
    TEMPLATES,
    NUM_BG_BLOBS,
    GPS_REWARDS,
    GPS_PENALTIES
}
