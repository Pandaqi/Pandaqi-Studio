import { Bounds } from "lib/pq-games";

// Global card type
export enum Type
{
    CHARACTER,
    ACTION
}

// Specific action type
export enum AType
{
    MURDER, // related to (avoiding) killing a suspect
    PILES, // related to changing a pile or review
    ACTION, // any other type of action
}

// Even more specific action (sub) type
// (didn't know I'd need this, otherwise I would've probably done something smarter)
export enum SType
{
    MURDER,
    PROTECT,
    PILE,
    REVIEW,
    INFO, // gets info, reveals public information, etcetera
    ORDER, // changes loupe / order of rounds/actions
    MISC
}

// Special suspect power type
export enum PType
{
    DEATH = "death",
    PLAY = "play"
}

// For the loupe and Suspect requirements
export enum ReqType
{
    REVIEW = "review", // can't be played there
    ALWAYS = "always", // doesn't care
    PLAY = "play" // must be played there
}

export interface ActionData
{
    frame?: number,
    type: AType,
    subType: SType,
    label?: string,
    desc?: string,
    freq?: Bounds, // default is 1,INF
    prob?: number, // default is 1
    triggers?: ReqType, // default is NEUTRAL

    murderQuotient?: number, // 1.0 for certain murder, 0.0 for irrelevant
    protectQuotient?: number, // 1.0 for certain protection, 0.0 for irrelevant

}

export type ActionSet = Record<string, ActionData>;

export const loupeIcon = "<img id=\"suspects\" frame=\"0\">";

export const BASE_SET:ActionSet = 
{
    murder: { frame: 0, type: AType.MURDER, subType: SType.MURDER, label: "Murder", desc: "<b>Kills</b> the suspect.", triggers: ReqType.REVIEW, murderQuotient: 1.0, freq: new Bounds(5, 8) },
    threat: { frame: 1, type: AType.MURDER, subType: SType.MURDER, label: "Threat", desc: "<b>Kills</b> the suspect if this is the 2nd threat.", triggers: ReqType.REVIEW, murderQuotient: 0.5, freq: new Bounds(4, 12) },
    bodyguard: { frame: 2, type: AType.MURDER, subType: SType.PROTECT, label: "Bodyguard", desc: "<b>Saves</b> the suspect from dying <b>once</b>.", triggers: ReqType.REVIEW, protectQuotient: 1.0, freq: new Bounds(2, 10) },
    sidekick: { frame: 3, type: AType.MURDER, subType: SType.MURDER, label: "Sidekick", desc: "Check an adjacent pile. If it also has a Sidekick, this suspect <b>dies</b>.", murderQuotient: 0.5, freq: new Bounds(4, 8) },

    stop: { frame: 4, type: AType.PILES, subType: SType.REVIEW, label: "Stop", desc: "<b>Stop</b> (further) review.", triggers: ReqType.REVIEW, protectQuotient: 0.33 },
    jester: { frame: 5, type: AType.PILES, subType: SType.PILE, label: "Jester", desc: "<b>Shuffle</b> the rest of this pile." },
    delay: { frame: 6, type: AType.PILES, subType: SType.REVIEW, label: "Delay Tactics", desc: "While visible, <b>don't move</b> the " + loupeIcon + " at the end of a turn.", protectQuotient: 0.33 },
    bomb: { frame: 7, type: AType.PILES, subType: SType.PILE, label: "Bomb", desc: "Reveal and execute the <b>top card</b> of all adjacent piles." },
    
    question: { frame: 8, type: AType.ACTION, subType: SType.INFO, label: "Burning Question", desc: "Reveal a hand card. Ask another player on which pile to play it, then do so." },
    investigator: { frame: 9, type: AType.ACTION, subType: SType.INFO, label: "Investigator", desc: "Look at an evidence pile OR another player's hand." },
    mover: { frame: 10, type: AType.ACTION, subType: SType.ORDER, label: "Mover", desc: "Move the " + loupeIcon + " to another location.", protectQuotient: 0.25 },
    switcheroo: { frame: 11, type: AType.ACTION, subType: SType.ORDER, label: "Switcheroo", desc: "Make two suspects <b>switch places</b> OR switch the <b>top and bottom card</b> of a pile.", protectQuotient: 0.33 },
}

export const ADVANCED_SET:ActionSet = 
{
    poison: { frame: 0, type: AType.MURDER, subType: SType.MURDER, label: "Poison", desc: "<b>Kills</b> the suspect if this is the <b>3rd poison</b>. <col hex=\"#777777\">Stays after a survived review!</col>", freq: new Bounds(5, 9), murderQuotient: 0.33 },
    armor: { frame: 1, type: AType.MURDER, subType: SType.PROTECT, label: "Armor", desc: "<b>Saves</b> the suspect from dying once if this is the <b>3rd armor</b>. <col hex=\"#777777\">Stays after a survived review!</col>", protectQuotient: 0.33, freq: new Bounds(5, 9) },
    antidote: { frame: 2, type: AType.MURDER, subType: SType.PROTECT, label: "Antidote", desc: "Adds 2 <b>Poison</b> if played openly; removes 2 <b>Poison</b> if played secretly.", protectQuotient: 0.66, murderQuotient: 0.66 }, // @NOTE: potential issue with new rules
    revenge: { frame: 3, type: AType.MURDER, subType: SType.REVIEW, label: "Dying Breath", desc: "<b>Kill</b> this suspect. Now also <b>review</b> the suspect with the <b>least</b> cards.", murderQuotient: 1.25 }, 

    safe_stop: { frame: 4, type: AType.PILES, subType: SType.REVIEW, label: "Safe Stop", desc: "<b>Stop</b> (further) review. Also <b>don't discard</b> the rest of this pile.", triggers: ReqType.REVIEW, protectQuotient: 0.33 }, 
    reverse: { frame: 5, type: AType.PILES, subType: SType.REVIEW, label: "Back to the top", desc: "While visible, the <b>review direction</b> is inverted: bottom to top.", triggers: ReqType.PLAY },
    alley: { frame: 6, type: AType.PILES, subType: SType.PILE, label: "Back Alley", desc: "While visible, cards are played to the <b>bottom</b> of evidence piles, and only facedown.", triggers: ReqType.PLAY },
    bomb_timed: { frame: 7, type: AType.PILES, subType: SType.PILE, label: "Time Bomb", desc: "Reveal (and execute) the <b>bottom card</b> of all adjacent piles." },

    rebel: { frame: 8, type: AType.ACTION, subType: SType.ORDER, label: "Rebel", desc: "Pick 1 card from <b>every pile</b> and stick it anywhere inside <b>another pile</b>.", triggers: ReqType.PLAY, murderQuotient: 0.75, protectQuotient: 0.5 }, // OLD POWER: "<b>Don't</b> move the <b>loupe</b> at the end of your turn."
    show: { frame: 9, type: AType.ACTION, subType: SType.INFO, label: "Show me your hands", desc: "While visible, everybody must play all cards <b>faceup</b>, and at most 1 per turn.", triggers: ReqType.PLAY },
    backward: { frame: 10, type: AType.ACTION, subType: SType.ORDER, label: "Walk it back", desc: "Take the top 3 cards of any pile into your hand.", protectQuotient: 0.25 },
    hasty: { frame: 11, type: AType.ACTION, subType: SType.MISC, label: "Hasty", desc: "<b>Draw</b> your hand back up to the hand limit OR force the next player to <b>skip</b> their turn." }
}

export const EXPERT_SET:ActionSet =
{
    sniper: { frame: 0, type: AType.MURDER, subType: SType.MURDER, label: "Sniper", desc: "<b>Review</b> an adjacent suspect. If no card in their pile saves them, they are <b>killed</b>.", triggers: ReqType.REVIEW, murderQuotient: 1.0 },
    lone_murder: { frame: 1, type: AType.MURDER, subType: SType.MURDER, label: "When nobody's around", desc: "<b>Kills</b> the suspect if all adjacent piles have fewer than 3 cards. Otherwise, it <b>saves</b> them once.", murderQuotient: 0.5, protectQuotient: 0.5 },
    last_ditch: { frame: 2, type: AType.MURDER, subType: SType.MURDER, label: "Last ditch effort", desc: "<b>Kills</b> the suspect if fewer than 3 suspects remain (in total). Otherwise, it <b>saves</b> them once.", murderQuotient: 0.5, protectQuotient: 0.5 },
    swapper: { frame: 3, type: AType.MURDER, subType: SType.PROTECT, label: "Wrong address", desc: "If this suspect is to be killed, <b>swap</b> it with another first.", protectQuotient: 1.0 },

    wipe: { frame: 4, type: AType.PILES, subType: SType.PILE, label: "Memory Wipe", desc: "<b>Discard</b> this pile and one adjacent pile.", protectQuotient: 0.25 },
    tangled: { frame: 5, type: AType.PILES, subType: SType.PILE, label: "Tangled Up", desc: "Study the contents of an adjacent pile. <b>Move 2 cards to the top</b> of this pile." },
    spread: { frame: 6, type: AType.PILES, subType: SType.PILE, label: "Spread the love", desc: "Reveal the remaining cards in this pile. <b>Distribute</b> them over all other piles as you wish.", protectQuotient: 0.25 },
    double: { frame: 7, type: AType.PILES, subType: SType.PILE, label: "Double Cross", desc: "<b>Move</b> this entire pile to the bottom or top of <b>another pile</b>." },

    investigator_private: { frame: 8, type: AType.ACTION, subType: SType.INFO, label: "Private Investigator", desc: "Look at another player's <b>suspect</b> OR <b>swap hands</b> with them." },
    revelation: { frame: 9, type: AType.ACTION, subType: SType.MISC, label: "Revelation", desc: "Immediately <b>play another card</b> on top of all adjacent piles." },
    thief: { frame: 10, type: AType.ACTION, subType: SType.MISC, label: "Thief", desc: "<b>Steal 3 cards</b> from another player." },
    clock: { frame: 11, type: AType.ACTION, subType: SType.REVIEW, label: "On the clock", desc: "<b>At most 2 cards</b> may be evaluated during this <b>review</b>. After that, immediately stop.", triggers: ReqType.REVIEW, protectQuotient: 0.33 }
}

export const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

export interface SuspectData
{
    frame: number,
    label?: string,
    freq?: number,
    color?: string,
    type?: PType,
    power?: string,
}

export const SUSPECTS:Record<string, SuspectData> = 
{
    loupe: { frame: 0, freq: 1 },
    scarlett: { label: "Ms. Scarlett", frame: 1, color: "#6E0C0D", type: PType.PLAY, power: "Rotate her suspect card 180 degrees. While she is in play and rotated, the hand limit is 1 card." }, // Miss Scarlett = red / Power = red hand with 1
    green: { label: "Rev. Green", frame: 2, color: "#0B3B00", type: PType.DEATH, power: "All players discard their hand and draw 7 new cards." }, // Reverend Green = green / Power = green hand with 7
    mustard: { label: "Col. Mustard", frame: 3, color: "#3F350D", type: PType.PLAY, power: "Shuffle this pile." }, // Colonel Mustard = yellow/brown / Power = yellow arrows back-forth
    professor: { label: "Prof. Plum", frame: 4, color: "#331D49", type: PType.PLAY, power: "Cards are always played faceup here, but never count for moving the loupe." }, // Professor Plum = purple / Power = card with an eye
    peacock: { label: "Mrs. Peacock", frame: 5, color: "#0C2E4F", type: PType.DEATH, power: "Shuffle all remaining suspects, then randomly place them back above the existing evidence piles." }, // Mrs. Peacock = blue / Power = shuffle arrows with suspect card above
    doctor: { label: "Doctor White", frame: 6, color: "#333333", type: PType.DEATH, power: "Bring another suspect back from the death. (The docter itself can never be revived.) If it's a player's secret suspect, they draw a new hand of cards and are back in the game!" }, // Doctor Orchid = white / Power = near-grayscale heart
    baker: { label: "Bella Baker", frame: 7, color: "#003D39", type: PType.PLAY, power: "Rotate the neighbor suspects (left and right) 180 degrees. Rotated suspects are protected from dying ONCE when reviewed." }, // Baker Girl = turquoise / Power = shield icon
    brunette: { label: "Monsieur Brunette", frame: 8, color: "#3B2118", type: PType.PLAY, power: "Steal a random card from another player OR from any pile." }, // Monsieur Brunette / Power = card with balaclava
    rose: { label: "Madame Rose", frame: 9, color: "#55123A", type: PType.DEATH, power: "When killed, she stays alive. Tuck a previously killed suspect underneath her: she takes over THEIR special power instead. If there is no previously killed suspect, she does immediately die." }, // Madame Rose / Power = chameleon rainbow colors
    traitor: { frame: 10, freq: 1 }
}

//  

export const MISC =
{
    loupe: { frame: 0 },
    loupe_cant: { frame: 1 },
    suspect: { frame: 2 },
    suspect_cant: { frame: 3 },
    paperclip: { frame: 4 }, // decoration
    power_skull: { frame: 5 }, // special power when suspect dies
    power_card: { frame: 6 }, // special power when you play to this suspect
}

export interface SubTypeData
{
    color: string
}

export const SUB_TYPES:Record<SType, SubTypeData> = 
{
    [SType.MURDER]: { color: "#830000" }, // red
    [SType.PROTECT]: { color: "#145400" }, // green
    [SType.PILE]: { color: "#0048B3" }, // blue (dark)
    [SType.REVIEW]: { color: "#684100" }, // yellow/orange/brown
    [SType.INFO]: { color: "#440F8D" }, // purple
    [SType.ORDER]: { color: "#04554C" }, // blue (light), more turquoise
    [SType.MISC]: { color: "#800146" } // pink
}

