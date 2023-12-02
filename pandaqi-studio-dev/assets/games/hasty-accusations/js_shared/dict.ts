import Bounds from "js/pq_games/tools/numbers/bounds";

// Global card type
enum Type
{
    CHARACTER,
    ACTION
}

// Specific action type
enum AType
{
    MURDER, // related to (avoiding) killing a suspect
    PILES, // related to changing a pile or review
    ACTION, // any other type of action
}

// Even more specific action (sub) type
// (didn't know I'd need this, otherwise I would've probably done something smarter)
enum SType
{
    MURDER,
    PROTECT,
    PILE,
    REVIEW,
    INFO, // gets info, reveals public information, etcetera
    ORDER, // changes loupe / order of rounds/actions
    MISC
}

// For the loupe and Suspect requirements
enum ReqType
{
    CANT = "cant", // can't be played there
    NEUTRAL = "neutral", // doesn't care
    MUST = "must" // must be played there
}

interface ActionData
{
    frame?: number,
    type: AType,
    subType: SType,
    label?: string,
    desc?: string,
    freq?: Bounds, // default is 1,INF
    prob?: number, // default is 1
    loupe?: ReqType, // default is NEUTRAL
    suspect?: ReqType, // default is NEUTRAL

    murderQuotient?: number, // 1.0 for certain murder, 0.0 for irrelevant
    protectQuotient?: number, // 1.0 for certain protection, 0.0 for irrelevant

}

type ActionSet = Record<string, ActionData>;

const BASE_SET:ActionSet = 
{
    murder: { frame: 0, type: AType.MURDER, subType: SType.MURDER, label: "Murder", desc: "<b>Kills</b> the suspect.", loupe: ReqType.CANT, murderQuotient: 1.0, freq: new Bounds(6, 10) },
    threat: { frame: 1, type: AType.MURDER, subType: SType.MURDER, label: "Threat", desc: "<b>Kills</b> the suspect if this is the 2nd threat.", loupe: ReqType.CANT, murderQuotient: 0.5, freq: new Bounds(4, 12) },
    bodyguard: { frame: 2, type: AType.MURDER, subType: SType.PROTECT, label: "Bodyguard", desc: "<b>Saves</b> the suspect from dying <b>once</b>.", suspect: ReqType.MUST, protectQuotient: 1.0, freq: new Bounds(2, 10) },
    sidekick: { frame: 3, type: AType.MURDER, subType: SType.MURDER, label: "Sidekick", desc: "Check an adjacent pile. If it also has a Sidekick, this suspect <b>dies</b>.", suspect: ReqType.CANT, murderQuotient: 0.5, freq: new Bounds(4, 12) },

    stop: { frame: 4, type: AType.PILES, subType: SType.REVIEW, label: "Stop", desc: "<b>Stop</b> (further) review. If played <b>openly</b>, instantly do a <b>review</b>.", protectQuotient: 0.33 },
    jester: { frame: 5, type: AType.PILES, subType: SType.PILE, label: "Jester", desc: "<b>Shuffle</b> the rest of this pile." },
    delay: { frame: 6, type: AType.PILES, subType: SType.REVIEW, label: "Delay Tactics", desc: "While visible, <b>don't move</b> the <img id=\"suspects\" frame=\"0\"> at the end of a turn.", protectQuotient: 0.33 },
    bomb: { frame: 7, type: AType.PILES, subType: SType.PILE, label: "Bomb", desc: "Reveal and execute the <b>top card</b> of all adjacent piles.", suspect: ReqType.CANT },
    
    question: { frame: 8, type: AType.ACTION, subType: SType.INFO, label: "Burning Question", desc: "Reveal a hand card. Ask another player on which pile to play it, then do so." },
    investigator: { frame: 9, type: AType.ACTION, subType: SType.INFO, label: "Investigator", desc: "Look at another player's hand." },
    mover: { frame: 10, type: AType.ACTION, subType: SType.ORDER, label: "Mover", desc: "Move the <img id=\"suspects\" frame=\"0\"> to another location.", loupe: ReqType.MUST, protectQuotient: 0.25 },
    switcheroo: { frame: 11, type: AType.ACTION, subType: SType.ORDER, label: "Switcheroo", desc: "Make two suspects <b>switch places</b> OR switch the <b>top and bottom</b> of a pile.", protectQuotient: 0.33 },
}

const ADVANCED_SET:ActionSet = 
{
    poison: { frame: 0, type: AType.MURDER, subType: SType.MURDER, label: "Poison", desc: "<b>Kills</b> the suspect if this is the <b>3rd poison</b>. <col hex=\"#777777\">Stays after a survived review!</col>", freq: new Bounds(5, 9), murderQuotient: 0.33 },
    armor: { frame: 1, type: AType.MURDER, subType: SType.PROTECT, label: "Armor", desc: "<b>Saves</b> the suspect from dying once if this is the <b>3rd armor</b>. <col hex=\"#777777\">Stays after a survived review!</col>", protectQuotient: 0.33, freq: new Bounds(5, 9) },
    antidote: { frame: 2, type: AType.MURDER, subType: SType.PROTECT, label: "Antidote", desc: "Adds 2 <b>Poison</b> if played openly; removes 2 <b>Poison</b> if played secretly.", protectQuotient: 0.66, murderQuotient: 0.66 },
    revenge: { frame: 3, type: AType.MURDER, subType: SType.REVIEW, label: "Dying Breath", desc: "<b>Kill</b> this suspect. Now also <b>review</b> the suspect with the <b>least</b> cards.", murderQuotient: 1.25 }, 

    safe_stop: { frame: 4, type: AType.PILES, subType: SType.REVIEW, label: "Safe Stop", desc: "<b>Stop</b> (further) review. Also <b>don't discard</b> the rest of this pile.", protectQuotient: 0.33 }, 
    reverse: { frame: 5, type: AType.PILES, subType: SType.REVIEW, label: "Back to the top", desc: "While visible, the <b>review direction</b> is inverted: bottom to top.", loupe: ReqType.MUST },
    alley: { frame: 6, type: AType.PILES, subType: SType.PILE, label: "Back Alley", desc: "While visible, cards may be played to the <b>bottom</b> of evidence piles.", loupe: ReqType.MUST },
    bomb_timed: { frame: 7, type: AType.PILES, subType: SType.PILE, label: "Time Bomb", desc: "Reveal (and execute) the <b>bottom card</b> of all adjacent piles." },

    rebel: { frame: 8, type: AType.ACTION, subType: SType.ORDER, label: "Rebel", desc: "Pick 1 card from <b>every pile</b> and stick it anywhere inside <b>another pile</b>.", loupe: ReqType.MUST, murderQuotient: 0.75, protectQuotient: 0.5 }, // OLD POWER: "<b>Don't</b> move the <b>loupe</b> at the end of your turn."
    show: { frame: 9, type: AType.ACTION, subType: SType.INFO, label: "Show me your hands", desc: "While visible, everybody plays all cards <b>faceup</b>.", loupe: ReqType.MUST },
    backward: { frame: 10, type: AType.ACTION, subType: SType.ORDER, label: "Walk it back", desc: "While visible, the <img id=\"suspects\" frame=\"0\"> moves <b>backwards</b> after each turn.", loupe: ReqType.MUST, protectQuotient: 0.25 },
    hasty: { frame: 11, type: AType.ACTION, subType: SType.MISC, label: "Hasty", desc: "Immediately take <b>another turn</b>, OR force the next player to <b>skip</b> their turn." }
}

const EXPERT_SET:ActionSet =
{
    sniper: { frame: 0, type: AType.MURDER, subType: SType.MURDER, label: "Sniper", desc: "<b>Review</b> an adjacent suspect. If no card in their pile saves them, they are <b>killed</b>.", suspect: ReqType.CANT, loupe: ReqType.CANT, murderQuotient: 1.0 },
    lone_murder: { frame: 1, type: AType.MURDER, subType: SType.MURDER, label: "When nobody's around", desc: "<b>Kills</b> the suspect if all adjacent piles have fewer than 3 cards. Otherwise, it <b>saves</b> them once.", murderQuotient: 0.5, protectQuotient: 0.5 },
    last_ditch: { frame: 2, type: AType.MURDER, subType: SType.MURDER, label: "Last ditch effort", desc: "<b>Kills</b> the suspect if fewer than 3 suspects remain (in total). Otherwise, it <b>saves</b> them once.", murderQuotient: 0.5, protectQuotient: 0.5 },
    swapper: { frame: 3, type: AType.MURDER, subType: SType.PROTECT, label: "Wrong address", desc: "If this suspect is to be killed, <b>swap</b> it with another first.", protectQuotient: 1.0 },

    wipe: { frame: 4, type: AType.PILES, subType: SType.PILE, label: "Memory Wipe", desc: "<b>Discard</b> this pile and one adjacent pile.", protectQuotient: 0.25 },
    tangled: { frame: 5, type: AType.PILES, subType: SType.PILE, label: "Tangled Up", desc: "Study the contents of an adjacent pile. <b>Move 2 cards to the top</b> of this pile." },
    spread: { frame: 6, type: AType.PILES, subType: SType.PILE, label: "Spread the love", desc: "Reveal the remaining cards in this pile. <b>Distribute</b> them over all other piles as you wish.", protectQuotient: 0.25 },
    double: { frame: 7, type: AType.PILES, subType: SType.PILE, label: "Double Cross", desc: "<b>Move</b> this entire pile to the bottom or top of <b>another pile</b>." },

    investigator_private: { frame: 8, type: AType.ACTION, subType: SType.INFO, label: "Private Investigator", desc: "Look at another player's <b>suspect</b>." },
    revelation: { frame: 9, type: AType.ACTION, subType: SType.MISC, label: "Revelation", desc: "Immediately <b>play another card</b> on top of all adjacent piles." },
    thief: { frame: 10, type: AType.ACTION, subType: SType.MISC, label: "Thief", desc: "<b>Steal 3 cards</b> from another player." },
    clock: { frame: 11, type: AType.ACTION, subType: SType.REVIEW, label: "On the clock", desc: "<b>At most 3 cards</b> may be evaluated during this <b>review</b>. After that, immediately stop.", loupe: ReqType.CANT, protectQuotient: 0.33 }
}

const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

const SUSPECTS = 
{
    loupe: { frame: 0, freq: 1 },
    scarlett: { frame: 1, color: "#6E0C0D" }, // Miss Scarlett = red
    green: { frame: 2, color: "#0B3B00" }, // Reverend Green = green
    mustard: { frame: 3, color: "#3F350D" }, // Colonel Mustard = yellow/brown
    professor: { frame: 4, color: "#331D49" }, // Professor Plum = purple
    peacock: { frame: 5, color: "#0C2E4F" }, // Mrs. Peacock = blue
    doctor: { frame: 6, color: "#333333" }, // Doctor Orchid = white
    baker: { frame: 7, color: "#003D39" }, // Baker Girl = turquoise
    brunette: { frame: 8, color: "#3B2118" }, // Monsieur Brunette
    rose: { frame: 9, color: "#55123A" }, // Madame Rose
    traitor: { frame: 10, freq: 1 }
}

const MISC =
{
    loupe: { frame: 0 },
    loupe_cant: { frame: 1 },
    suspect: { frame: 2 },
    suspect_cant: { frame: 3 },
    paperclip: { frame: 4 }
}

interface SubTypeData
{
    color: string
}

const SUB_TYPES:Record<SType, SubTypeData> = 
{
    [SType.MURDER]: { color: "#830000" }, // red
    [SType.PROTECT]: { color: "#145400" }, // green
    [SType.PILE]: { color: "#0048B3" }, // blue (dark)
    [SType.REVIEW]: { color: "#684100" }, // yellow/orange/brown
    [SType.INFO]: { color: "#440F8D" }, // purple
    [SType.ORDER]: { color: "#04554C" }, // blue (light), more turquoise
    [SType.MISC]: { color: "#800146" } // pink
}

export 
{
    Type,
    AType,
    ReqType,
    ActionData,
    SETS,
    BASE_SET,
    ADVANCED_SET,
    EXPERT_SET,
    MISC,
    SUB_TYPES,
    SUSPECTS
}
