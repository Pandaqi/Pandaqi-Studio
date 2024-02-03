import Point from "js/pq_games/tools/geometry/point";
import { CardType } from "./dictShared";

interface DefaultCardData
{
    frame?: number,
    label?: string,
    desc?: string,
    freq?: number,
    num?: number,
    required?: string[]
}

//
// Vehicle Cards (only 1 for the shared material)
//
const VEHICLE_CARDS = 
{
    discuss: { frame: 2, label: "Discuss", desc: "When executed, you may communicate until you decide to execute the next card.", freq: 5 }
};

//
// Health Cards (a lot of them; keep their text/handicap simple though)
//
const HEALTH_CARDS = 
{
    last_life: { subText: "Regular Life", desc: "Nothing special.", num: 1, freq: 2 },
    random_draw_controlled: { subText: "Pick from 2", desc: "<b>Start player</b> must <b>select 2 cards</b> each time, then randomly pick one to place.", num: 5 },
    random_draw: { subText: "Random Draw", desc: "<b>Start player</b> must play a <b>random</b> hand card.", num: 3 },
    first_from_left: { subText: "First from Left", desc: "Players must play their card at the <b>first</b> available spot from the <b>left</b>.", num: 2 },
    first_from_right: { subText: "First from Right", desc: "Players must play their card at the <b>first</b> available spot from the <b>right</b>.", num: 2 }, // @NOTE: "last from left" = "first from right"
    delayed_draw: { subText: "Delayed Draw", desc: "<b>Don't draw new cards</b> until your hand is completely empty.", num: 3 },
    last_player_disabled: { subText: "One Fewer Instruction", desc: "<b>Last player</b> does <b>not</b> get to play a card anymore.", num: 4 },
    last_player_double: { subText: "One More Instruction", desc: "<b>Last player</b> must play <b>2 instructions</b>.", num: 3 },
    double_round: { subText: "Double Round", desc: "You play <b>2 rounds</b> (creating a row that's twice as long) before executing instructions.", num: 3 },
    forced_follow: { subText: "Forced Follow", desc: "<b>Start player</b> plays their card <b>faceup</b>. All other players must play the <b>same card</b> if they have it.", num: 4  },
    lower_hand_limit: { subText: "Lower Hand Limit", desc: "The <b>hand limit</b> is permanently lowered by 1.", num: 3 },
    forced_spot: { subText: "Forced Spot", desc: "Spin the compass. <b>Start player</b> must play their card at the <b>number</b> that points to them.", num: 4 },
    random_replace: { subText: "Random Replace", desc: "<b>End of round</b>: start player must <b>replace</b> one card played with a random one from their hand.", num: 5 },
    limited_communication: { subText: "Limited Communication", desc: "The <b>Discuss</b> card only counts when it's the <b>first card</b> executed.", num: 5 },
    risky_turns: { subText: "Risky Turns", desc: "<b>End of round</b>: Take <b>1 damage</b> if you end on the same tile as you began.", num: 4 }
};

//
// GPS Cards => @TODO:
// The actual red/green tiles are randomly generated
// But the dictionary below contains the bonuses/penalties for GPS cards
//
const GPS_CARDS = {};

//
// Time Cards
// This doubles as an "event expansion" that always works nicely in games
// @TODO: invent some more of this, consider whether the "look ahead" should be an action or something
//
const TIME_CARDS = 
{
    blank: { label: "Regular Card", desc: "Nothing special.", freq: 10 },
    look_ahead: { label: "Look Ahead", desc: "Look at the <b>next 8 Time Cards</b>.", freq: 2 },
    change_future: { label: "Change the Future", desc: "Look at the <b>next 4 Time Cards</b> and put them back any way you want.", freq: 2 },

    sudden_move: { label: "Sudden Move", desc: "Move the vehicle to any <b>adjacent tile</b>, except collectible tiles." },
    sudden_steer: { label: "Sudden Steer", desc: "<b>Orient</b> the vehicle any way you want." },
    extra_cards: { label: "Extra Cards", desc: "All players draw <b>1 extra card</b>." },
    repeat_round: { label: "Repeat Round", desc: "<b>Repeat</b> the exact instructions of the previous round." },
    healing_powers: { label: "Healing Powers", desc: "<b>Undo any damage</b> taken this round." },

    damage_for_time: { label: "Trade for Time", desc: "<b>Offer</b>: take 1 Damage to regain 3 Time.", freq: 2 },
    time_for_damage: { label: "Trade for Damage", desc: "<b>Offer</b>: lose 3 Time to regain 1 Health.", freq: 2 },
    collection_bonus: { label: "Collection Bonus", desc: "If you <b>collected</b> a tile this round, put this card back into the Time Deck." },
    collection_penalty: { label: "Collection Penalty", desc: "If you <b>collected</b> a tile this round, lose 2 more Time." },
    gps_bonus: { label: "GPS Bonus", desc: "If you <b>followed the GPS</b>, put this card back into the Time Deck.", required: ["includeGPSCards"] },
    gps_penalty: { label: "GPS Penalty", desc: "If you <b>ignored the GPS</b>, lose 2 more Time.", required: ["includesGPSCards"] },
};

//
// Action Cards
//
const ACTION_CARDS = 
{
    share_hand: { label: "Share Hand", desc: "All players <b>reveal</b> their cards to each other. (Optional: touch one of them as a 'suggestion'.)" },
    bumper_strong: { label: "Strong Bumper", desc: "Any <b>involuntary damage</b> taken this round is <b>ignored</b>." }, // @NOTE: "involuntary" is to prevent against stuff like offers to trade damage for time being abused
    bumper_weak: { label: "Weak Bumper", desc: "<b>Take 1 damage</b> for sure. But any damage beyond that is <b>ignored</b> this round." },

    look_ahead: { label: "Look Ahead", desc: "Play <b>faceup</b>. Look at all instructions played so far." },
    copy_before: { label: "Copy Before", desc: "This card becomes the <b>same</b> as the <b>previously executed card</b>." }, // @NOTE: copy_after is confusing, so left out

    sudden_insight: { label: "Sudden Insight", desc: "<b>Replace</b> an instruction yet to be revealed with one from your hand." },
    change_of_plans: { label: "Change of Plans", desc: "Look at all instructions yet to be revealed and <b>rearrange</b> them as desired." },
    back_it_up: { label: "Back it up", desc: "From now on, unhandled instructions are executed in <b>reverse order</b> (right to left)." },

    late_arrival: { label: "Late Arrival", desc: "<b>Play another card</b> to the end of the row." },
    try_that_again: { label: "Try Again", desc: "<b>Return the vehicle</b> to the tile at which it started this round." },
    
    make_space: { label: "Make Space", desc: "Play an instruction at a slot already occupied. That card (and all after it) <b>shift</b> one position to the right." },
    clear_instructions: { label: "Clear Path", desc: "Play <b>faceup</b>. All cards played <b>before</b> this one may also be played faceup." },
    
    ghost_driver: { label: "Ghost Driver", desc: "All instructions that Move or Orient the vehicle are <b>inverted</b> from now on." },
    repair_shop: { label: "Repair Shop", desc: "<b>Repairs</b> 1 damage, but all other instructions this round are <b>undone or ignored</b>." },
    scenic_route: { label: "Scenic Route", desc: "All instructions from now on count <b>double</b>." },

    // these are cool, but slightly more complex
    turn_around: { label: "Turn Around", desc: "Play <b>faceup</b>. Take a vote. If the majority is <b>against</b>, discard all instructions and start the next round." }, // OLD POWER: "When executing instructions this round, you may choose whether to execute a card (or not) after revealing."
    double_time: { label: "Double Time", desc: "Play <b>faceup</b>. This round, anyone may play 2 cards on top of each other. Decide which one is true once executed." }, // OLD POWER: "Play another card <b>on top</b> of an instruction yet to be revealed."
    reconsider: { label: "Reconsider", desc: "Play <b>faceup</b>. Study all instructions and either <b>rearrange</b> or <b>swap</b> them all for random deck cards." },

    // these need the GPS cards
    lost_signal: { label: "Lost Signal", desc: "<b>Remove</b> the <b>GPS card</b> for this round.", required: ["includeGPSCards"] },
    advanced_gps: { label: "Advanced GPS", desc: "Study the next <b>5 GPS cards</b> and <b>rearrange</b> in any order desired." },
    
    // these need the time deck
    crystal_ball: { label: "Crystal Ball", desc: "<b>Look at</b> the next 5 cards of the <b>Time Deck</b>.", required: ["includeTimeDeck"] },
};

//
// Fuel Cards => @TODO: whether to include this as a default shared expansion is VERY uncertain
// This is only the Vehicle Card added; the regular fuel cards are just generated on the fly by cardPicker
//
const FUEL_CARDS = 
{
    refuel: { label: "Refuel", desc: "Add X fuel back." }
}; 

type MaterialData = Record<string, DefaultCardData>;

const MATERIAL:Record<CardType, MaterialData> =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [CardType.GPS]: GPS_CARDS,
    [CardType.TIME]: TIME_CARDS,
    [CardType.FUEL]: FUEL_CARDS,
    [CardType.ACTION]: ACTION_CARDS,
    [CardType.INSTRUCTION]: {},
    [CardType.COMPASS]: {}
}

interface TemplateData
{
    frameTemplate?:number, // frame for template at the bottom
    frameIcon?: number, // frame for big main illustration
    bgColor?: string, // color used for filling entire background of card
    tintColor?: string, // color used for tinting template (bg for title + text)
    label?: string, // title, heading
    subText?: string, // smaller piece below it, mostly to indicate card type literally
    desc?: string, // the actual text on card; usually overriden by specific card
    smallIconOffset?: Point, // placement of smaller versions of icons is one major difference between templates
    extraNumberOffset?: Point, // where to position the (optional) number on a select few templates
}

const TEMPLATES:Record<string, TemplateData> =
{
    [CardType.VEHICLE]: { frameTemplate: 0, bgColor: "#FFFFFF", tintColor: "#DADADA", label: null, subText: "Vehicle Card", smallIconOffset: new Point(0.33, 0) },
    [CardType.HEALTH]: { frameTemplate: 2, frameIcon: 3, bgColor: "#F9C98C", label: "Health", subText: "Handicap", smallIconOffset: new Point(0.35, -0.05), extraNumberOffset: new Point(0.46, 0) },
    [CardType.GPS]: { frameTemplate: 3, frameIcon: 4, bgColor: "#A6741A", label: "GPS", subText: null },
    [CardType.TIME]: { frameTemplate: 4, frameIcon: 5, bgColor: "#4AD9FC", label: "Time", subText: "Event", extraNumberOffset: new Point(0.46, -0.2) },
    [CardType.FUEL]: { frameTemplate: 5, frameIcon: 7, bgColor: "#3A3A3A", label: "Fuel", subText: null, desc: "If <b>empty</b> (0) or <b>overfilled</b> (10), take damage and reset." },
    [CardType.ACTION]: { frameTemplate: 1, bgColor: "#FFFFFF", tintColor: "#DADADA", label: null, subText: "Action Card", smallIconOffset: new Point(0.4125, 0) },
    [CardType.INSTRUCTION]: { frameIcon: 1 },
    [CardType.COMPASS]: { frameIcon: 0 }
}

const NUM_BG_BLOBS = 4
const MISC =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 }
}


export 
{
    MATERIAL,
    MISC,
    TEMPLATES,
    NUM_BG_BLOBS
}
