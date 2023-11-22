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

// For the Spyglass and Suspect requirements
enum ReqType
{
    CANT, // can't be played there
    NEUTRAL, // doesn't care
    MUST // must be played there
}

interface ActionData
{
    frame?: number,
    type: AType,
    label?: string,
    desc?: string,
    freq?: Bounds, // default is 1,INF
    prob?: number, // default is 1
    spyglass?: ReqType, // default is NEUTRAL
    suspect?: ReqType, // default is NEUTRAL

}

type ActionSet = Record<string, ActionData>;
const BASE_SET:ActionSet = 
{
    murder: { frame: 0, type: AType.MURDER, label: "Murder", desc: "Kills the suspect.", spyglass: ReqType.CANT },
    threat: { frame: 1, type: AType.MURDER, label: "Threat", desc: "Kills the suspect if this is the 2nd threat.", spyglass: ReqType.CANT },
    bodyguard: { frame: 2, type: AType.MURDER, label: "Bodyguard", desc: "Saves the suspect from dying once.", suspect: ReqType.MUST },
    sidekick: { frame: 3, type: AType.MURDER, label: "Sidekick", desc: "Check an adjacent pile. If it also has a Sidekick, this suspect dies.", suspect: ReqType.CANT },

    stop: { frame: 4, type: AType.PILES, label: "Stop", desc: "Stop (further) review. If played OPENLY, instantly do a REVIEW." },
    joker: { frame: 5, type: AType.PILES, label: "Joker", desc: "Shuffle the rest of this pile." },
    delay: { frame: 6, type: AType.PILES, label: "Delay Tactics", desc: "While visible, no REVIEW phase ever happens." },
    bomb: { frame: 7, type: AType.PILES, label: "Bomb", desc: "Reveal and execute the top card of all adjacent piles.", suspect: ReqType.CANT },
    
    question: { frame: 8, type: AType.ACTION, label: "Burning Question", desc: "Reveal a hand card. Ask another player on which pile to play it, then do so." },
    investigator: { frame: 9, type: AType.ACTION, label: "Investigator", desc: "Look at another player's hand." },
    mover: { frame: 10, type: AType.ACTION, label: "Mover", desc: "Move the spyglass to another location", spyglass: ReqType.MUST },
    switcheroo: { frame: 11, type: AType.ACTION, label: "Switcheroo", desc: "Make two suspects switch places." },
}

const ADVANCED_SET:ActionSet = 
{
    poison: { frame: 0, type: AType.MURDER, label: "Poison", desc: "Kills the suspect if this is the 3rd poison. This card always stays in the pile after review!" },
    armor: { frame: 1, type: AType.MURDER, label: "Armor", desc: "Saves the suspect from dying once if this is the 3rd armor. This card always stays in the pile after review!" },
    antidote: { frame: 2, type: AType.MURDER, label: "Antidote", desc: "Negates all Poison, Threat or Armor cards in this pile." },
    revenge: { frame: 3, type: AType.MURDER, label: "Dying Breath", desc: "If this suspect dies, also REVIEW the suspect with the LEAST cards in their pile." }, 

    safe_stop: { frame: 4, type: AType.PILES, label: "Safe Stop", desc: "Stop (further) review. Also don't discard the rest of this pile." }, 
    reverse: { frame: 5, type: AType.PILES, label: "Back to the top", desc: "While visible, the REVIEW direction is inverted. (Top to bottom, or bottom to top.)", spyglass: ReqType.CANT },
    alley: { frame: 6, type: AType.PILES, label: "Back Alley", desc: "While visible, cards may be played to the BOTTOM of evidence piles.", spyglass: ReqType.MUST },
    bomb_timed: { frame: 7, type: AType.PILES, label: "Time Bomb", desc: "Reveal (and execute) the bottom card of all adjacent piles." },

    rebel: { frame: 8, type: AType.ACTION, label: "Rebel", desc: "Don't move the spyglass at the end of your turn.", spyglass: ReqType.MUST }, // @TODO: perhaps a little weak? => also, all actions cards in this set are a bit similar
    show: { frame: 9, type: AType.ACTION, label: "Show me your hands", desc: "While visible, everybody plays all cards FACEUP.", spyglass: ReqType.MUST },
    backward: { frame: 10, type: AType.ACTION, label: "Walk it back", desc: "While visible, the spyglass moves BACKWARDS after each turn.", spyglass: ReqType.MUST },
    hasty: { frame: 11, type: AType.ACTION, label: "Hasty", desc: "Immediately take 2 more turns." }

}

const EXPERT_SET:ActionSet =
{
    sniper: { frame: 0, type: AType.MURDER, label: "Sniper", desc: "REVIEW an adjacent suspect. If no card in their pile saves them, they are killed.", suspect: ReqType.CANT, spyglass: ReqType.CANT },
    lone_murder: { frame: 1, type: AType.MURDER, label: "When nobody's around", desc: "Kills the suspect if all adjacent piles have fewer than 3 cards. Otherwise, it saves them ONCE." },
    last_ditch: { frame: 2, type: AType.MURDER, label: "Last ditch effort", desc: "Kills the suspect if fewer than 3 suspects remain (in total). Otherwise, it saves them ONCE." },
    swapper: { frame: 3, type: AType.MURDER, label: "Wrong address", desc: "Just before being killed, swap this suspect with another." },

    wipe: { frame: 4, type: AType.PILES, label: "Memory Wipe", desc: "Discard this pile and one adjacent pile." },
    tangled: { frame: 5, type: AType.PILES, label: "Tangled Up", desc: "Study the contents of an adjacent pile. Move 2 cards to the top of this pile." },
    spread: { frame: 6, type: AType.PILES, label: "Spread the love", desc: "Reveal the remaining cards in this pile. Distribute them over all other piles as you wish." },
    double: { frame: 7, type: AType.PILES, label: "Double Cross", desc: "Move this entire pile to the bottom or top of another pile." },

    investigator_private: { frame: 8, type: AType.ACTION, label: "Private Investigator", desc: "Look at another player's suspect." },
    revelation: { frame: 9, type: AType.ACTION, label: "Revelation", desc: "Immediately play another card on top of all adjacent piles." },
    thief: { frame: 10, type: AType.ACTION, label: "Thief", desc: "Steal 3 cards from another player." },
    clock: { frame: 11, type: AType.ACTION, label: "On the clock", desc: "At most 3 cards may be evaluated during this REVIEW. After that, immediately stop.", spyglass: ReqType.CANT }
}

const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

const MISC =
{
    spyglass: { frame: 0 },
    suspect: { frame: 1 },

    // @TODO
}

export 
{
    Type,
    AType,
    ActionData,
    SETS,
    BASE_SET,
    ADVANCED_SET,
    EXPERT_SET,
    MISC
}
