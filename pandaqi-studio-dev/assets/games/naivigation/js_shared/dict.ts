import Card from "../js_game/card";
import Token from "../js_game/token";

enum CardType
{
    VEHICLE = "vehicle",
    HEALTH = "health",
    GPS = "gps",
    TIME = "time",
    FUEL = "fuel",
    COMPASS = "compass"
}

enum TokenType
{
    INSTRUCTION = "intstruction",
    ACTION = "action"
}

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
    discuss: { label: "Discuss", desc: "When executed, you may communicate until you decide to execute the next card.", freq: 5 }
};

//
// Health Cards (a lot of them; keep their text/handicap simple though)
//
const HEALTH_CARDS = 
{
    last_life: { label: "Regular Life", desc: "Nothing special.", num: 1, freq: 2 },
    random_draw_controlled: { label: "Pick from 2", desc: "Start player must select 2 cards each time, then randomly pick one to place.", num: 5 },
    random_draw: { label: "Random Draw", desc: "Start player must play a random card (from their hand).", num: 3 },
    first_from_left: { label: "First from Left", desc: "Players must play their card at the <b>first</b> available spot from the <b>left</b>.", num: 2 },
    first_from_right: { label: "First from Right", desc: "Players must play their card at the <b>first</b> available spot from the <b>right</b>.", num: 2 }, // @NOTE: "last from left" = "first from right"
    delayed_draw: { label: "Delayed Draw", desc: "Don't draw new cards until your hand is completely empty.", num: 3 },
    last_player_disabled: { label: "One Fewer Instruction", desc: "The last player does NOT get to play a card anymore.", num: 4 },
    last_player_double: { label: "One More Instruction", desc: "The last player must play 2 instructions.", num: 3 },
    double_round: { label: "Double Round", desc: "You play <b>2 rounds</b> (creating a row that's twice as long) before executing instructions.", num: 3 },
    forced_follow: { label: "Forced Follow", desc: "Start player plays their card faceup. All other players must play the <b>same card</b> if they have it.", num: 4  },
    lower_hand_limit: { label: "Lower Hand Limit", desc: "The hand limit is permanently lowered by 1.", num: 3 },
    forced_spot: { label: "Forced Spot", desc: "Spin the compass again and check the number that points at the start player. They must play their card in that slot.", num: 4 },
    random_replace: { label: "Random Replace", desc: "End of round: start player must REPLACE one card played with a random one from their hand.", num: 5 },
    limited_communication: { label: "Limited Communication", desc: "The Discuss card only counts when it's the first card executed.", num: 5 },
    risky_turns: { label: "Risky Turns", desc: "End of round: Take 1 damage if you end on the same tile as you began.", num: 4 }
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
    look_ahead: { label: "Look Ahead", desc: "Look at the next 8 Time Cards.", freq: 2 },
    change_future: { label: "Change the Future", desc: "Look at the next 4 Time Cards and put them back any way you want.", freq: 2 },

    sudden_move: { label: "Sudden Move", desc: "Move the vehicle to any adjacent tile, except collectible tiles." },
    sudden_steer: { label: "Sudden Steer", desc: "Orient the vehicle any way you want." },
    extra_cards: { label: "Extra Cards", desc: "All players draw 1 extra card." },
    repeat_round: { label: "Repeat Round", desc: "Repeat the exact instructions of the previous round." },
    healing_powers: { label: "Healing Powers", desc: "Undo any damage taken this round." },

    damage_for_time: { label: "Trade for Time", desc: "Offer: take 1 Damage to regain 3 Time.", freq: 2 },
    time_for_damage: { label: "Trade for Damage", desc: "Offer: lose 3 Time to regain 1 Health.", freq: 2 },
    collection_bonus: { label: "Collection Bonus", desc: "If you collected a special tile, put this card back into the Time Deck." },
    collection_penalty: { label: "Collection Penalty", desc: "If you collected a special tile, lose 2 more Time." },
    gps_bonus: { label: "GPS Bonus", desc: "If you followed the GPS, put this card back into the Time Deck.", required: ["includeGPSCards"] },
    gps_penalty: { label: "GPS Penalty", desc: "If you ignored the GPS, lose 2 more Time.", required: ["includesGPSCards"] },
};

//
// Action Tokens => @TODO: Not sure if it's more fun to add these as default Vehicle Cards in the deck?
//
const ACTION_TOKENS = 
{
    share_hand: { label: "Share Hand", desc: "Look at another player's cards." },
    share_hint: { label: "Share Hint", desc: "Look at another player's cards and touch one of them as a suggestion." }, // @TODO: this is quite WEAK, just remove?
    look_ahead: { label: "Look Ahead", desc: "Look at all instructions played so far." },
    reconsider_one: { label: "Reconsider One", desc: "Look at an instruction already played. You may replace it with a card from your hand." },
    reconsider_all: { label: "Reconsider All", desc: "Look at all instructions already played. Rearrange them in any order desired." },
    make_space: { label: "Make Space", desc: "Place an instruction at a position already occupied. That card (and all after it) shift one position to the right." },
    clear_instructions: { label: "Clear Instructions", desc: "Play your card faceup this round. All cards played before it may also be faceup." },
    shield: { label: "Shield", desc: "Any damage taken this round is ignored." }, // @TODO: what to do when elements are in the game that allow TRADING damage for time or something?
    ghost_driver: { label: "Ghost Driver", desc: "All instructions that Move or Rotate are inverted this round." },
    scenic_route: { label: "Scenic Route", desc: "All instructions count double this round." },
    turn_around: { label: "Turn Around", desc: "When executing instructions this round, you may choose whether to execute a card (or not) after revealing." },

    lost_signal: { label: "Lost Signal", desc: "Remove the GPS card for this round.", required: ["includeGPSCards"] },
    advanced_gps: { label: "Advanced GPS", desc: "Look at the next 5 GPS cards and rearrange in any order desired." },
    crystal_ball: { label: "Crystal Ball", desc: "Look at the next 5 cards of the Time Deck", required: ["includeTimeDeck"] },
};

//
// Fuel Cards => @TODO: whether to include this as a default shared expansion is VERY uncertain
// This is only the Vehicle Card added; the regular fuel cards are just generated on the fly by cardPicker
//
const FUEL_CARDS = 
{
    refuel: { label: "Refuel", desc: "Add X fuel back." }
}; 

type MaterialClass = Card|Token;
type MaterialType = CardType|TokenType;
type MaterialData = Record<string, DefaultCardData>;

const MATERIAL:Record<MaterialType, MaterialData> =
{
    [CardType.VEHICLE]: VEHICLE_CARDS,
    [CardType.HEALTH]: HEALTH_CARDS,
    [CardType.GPS]: GPS_CARDS,
    [CardType.TIME]: TIME_CARDS,
    [CardType.FUEL]: FUEL_CARDS,
    [TokenType.ACTION]: ACTION_TOKENS,
    [TokenType.INSTRUCTION]: {},
    [CardType.COMPASS]: {}
}


export 
{
    MaterialClass,
    CardType,
    TokenType,
    MATERIAL
}
