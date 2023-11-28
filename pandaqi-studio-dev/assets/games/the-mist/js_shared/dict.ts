enum ActionType
{
    SCORE, // scores, perhaps based on certain conditions
    STATE, // scores based on overall board state (usually frequency of occurrence)
    TERRA, // terraforms the map into something organic
    MOVE, // restricts or allows movement
    ACTION, // any other type of action, usually paid for by minus points, or destructive
}

interface ActionData
{
    frame?: number,
    label?: string,
    desc?: string,
    type?: ActionType,
    hazard?: boolean, // if false/omitted, it's safe
    item?: boolean, // if false/omitted, it's a non-item
    requiresMetadata?: boolean, // if true, it means it relies on HAZARd/ITEM designation to function
    forbiddenTypes?: string[],
    prePass?: string,
    prob?: number, // default is 1
    minAbs?: number,
    maxAbs?: number,
    textureKey?: string, // filled in automatically upon loading (based on set name)
}

type ActionSet = Record<string, ActionData>;
const BASE_SET:ActionSet = 
{
    food: { frame: 0, label: "Food", desc: 'Worth +1 point <img id="base" frame="2"> I guess an image.', type: ActionType.SCORE },
    water: { frame: 1, label: "Water", desc: "Worth <sc>+2 points</sc>.", type: ActionType.SCORE },
    diamond: { frame: 2, label: "Diamond", desc: "Worth as many points as the total <b>number of diamonds that you have.</b>", type: ActionType.SCORE, item: true },
    mist: { frame: 3, label: "Mist", desc: "Worth as many points as the <b>number of unvisited spaces.</b>", type: ActionType.STATE, hazard: true },

    journal: { frame: 4, label: "Fragment", desc: "If you own <b>the most</b>, you score +10 points.", type: ActionType.STATE, item: true },
    bugs: { frame: 5, label: "Bugs", desc: "Worth +2 points if you own <b>the least</b>, otherwise -2 points.", type: ActionType.STATE, hazard: true },
    rabbit: { frame: 6, label: "Rabbit", desc: "Worth +6 points, but only if this is the <b>most occuring type</b> (out of everything)", type: ActionType.STATE }, 

    boots: { frame: 7, label: "Boots", desc: "Worth -5 points. Each Boots allows you to <b>move an extra space</b> on your turn.", type: ActionType.MOVE, item: true },
    signpost: { frame: 8, label: "Signpost", desc: "Worth +3 points, but only pickable if you move in its direction.", type: ActionType.MOVE, item: true },
    portal: { frame: 9, label: "Portal", desc: "Instead of taking 1 step, move to another free square with a portal.", type: ActionType.MOVE },

    tree: { frame: 10, label: "Tree", desc: "Worth as much as the number of <b>Trees on adjacent squares</b>.", type: ActionType.TERRA, prePass: "floodfill" },
    trail: { frame: 11, label: "Trail", desc: "Worth as many points as the <b>longest connected trail</b> on the board (not necessarily yours).", type: ActionType.TERRA, prePass: "chain" },
    river: { frame: 12, label: "River", desc: "Worth as many points as the <b>total length of its river</b>.", type: ActionType.TERRA, prePass: "chain" },
}

const ADVANCED_SET:ActionSet = 
{
    cursed: { frame: 0, label: "Cursed Rock", desc: "Worth -1 point.", type: ActionType.SCORE, hazard: true, item: true },
    coconut: { frame: 1, label: "Coconut Tree", desc: "Worth +3 points.", type: ActionType.SCORE },
    heart: { frame: 2, label: "Heart", desc: "Worth +5 points. If this is your 3rd heart, however, you're out of the game.", type: ActionType.ACTION, hazard: true },

    jaguar: { frame: 3, label: "Jaguar", desc: "Worth +6 points, but only if this is the LEAST occurring type out of everything on the board.", type: ActionType.STATE },
    trap: { frame: 4, label: "Trap", desc: "Worth -2 points, unless you own the MOST traps (out of all players", type: ActionType.STATE, hazard: true },
    attacker: { frame: 5, label: "Attacker", desc: "Worth +2 points. If there's an adjacent Attacker, however, you CAN'T pick this option.", type: ActionType.STATE, hazard: true },
    flag: { frame: 6, label: "Flag", desc: "Worth +8 points if more than half the rows contain a Flag, otherwise -8.", type: ActionType.STATE, item: true, prePass: "rowcol" },
    home: { frame: 7, label: "Home", desc: "Worth +8 points if less than half the columns contain a Home, otherwise -8.", type: ActionType.STATE, item: true, prePass: "rowcol" },
 
    lookout: { frame: 8, label: "Lookout", desc: "Nobody but you may enter an adjacent space.", type: ActionType.MOVE },
    warningsign: { frame: 9, label: "Warning Sign", desc: "Worth +2 points, but only pickable if you DON'T move in its direction.", type: ActionType.MOVE, item: true },
    rocks: { frame: 10, label: "Rocks", desc: "Worth +2 points. Once chosen, nobody can move across the edge showing the rocks.", type: ActionType.MOVE },

    plant: { frame: 11, label: "Plant", desc: "Worth +1 point. When picked, turn one adjacent tile into a plant (if possible).", type: ActionType.TERRA, prePass: "floodfill" },
    virus: { frame: 12, label: "Virus", desc: "Worth -2 points. If there's an adjacent Virus, you MUST pick this option.", type: ActionType.TERRA, forbiddenTypes: ["sheep"], hazard: true, prePass: "chain" },
    sheep: { frame: 13, label: "Sheep", desc: "Worth +1 point. If there's an adjacent Sheep, you MUST pick this option.", type: ActionType.TERRA, forbiddenTypes: ["virus"], prePass: "chain" },
}

const EXPERT_SET:ActionSet = 
{
    bag: { frame: 0, label: "Bag", desc: "Worth as many points as the number of ITEMS you collected.", type: ActionType.SCORE, requiresMetadata: true, item: true },
    boar: { frame: 1, label: "Boar", desc: "Worth -2 points, but immediately take another turn.", type: ActionType.ACTION },
    campfire: { frame: 2, label: "Campfire", desc: "Worth -1 point. When picked, destroy 2 adjacent tiles.", type: ActionType.ACTION, hazard: true },

    oasis: { frame: 3, label: "Oasis", desc: "If another player CAN move to an adjacent space, they MUST do so.", type: ActionType.MOVE, hazard: true },
    tunnel: { frame: 4, label: "Tunnel", desc: "When leaving a tunnel, you take TWICE the steps you otherwise would. (Skipping squares in between.)", type: ActionType.MOVE },
    egg: { frame: 5, label: "Egg", desc: "Worth +6 points, but you're not allowed to visit HAZARD spaces anymore.", type: ActionType.MOVE, requiresMetadata: true, item: true },

    shaman: { frame: 6, label: "Shaman", desc: "Scores +3 if the number of shamans picked so far is ODD, otherwise -3. (Write on the cell to remember.)", type: ActionType.STATE },
    meteor: { frame: 7, label: "Meteor", desc: "Worth as many points as the number of Meteors in the same row and column.", type: ActionType.STATE, item: true, hazard: true },
    merchant: { frame: 8, label: "Merchant", desc: "Worth +6 points if you collected the most ITEMS, otherwise -6.", type: ActionType.STATE, requiresMetadata: true },
    payout: { frame: 9, label: "Payout", desc: "Worth +4 points if you collected the least HAZARDS, otherwise -4.", type: ActionType.STATE, requiresMetadata: true, item: true },

    gunshot: { frame: 10, label: "Gunshot", desc: "Worth -2 points. When picked, destroy 2 tiles in the same row or column.", type: ActionType.ACTION, hazard: true },

    herd: { frame: 11, label: "Herd", desc: "Worth as many points as the size of its group ( = all herd connected to it).", type: ActionType.TERRA, prePass: "floodfill" },
    birdsong: { frame: 12, label: "Birdsong", desc: "Worth +1 point. When picked, also turn any other square into Birdsong (if possible).", type: ActionType.TERRA },
    spell: { frame: 13, label: "Spell", desc: "Worth 0 points. When picked, decide the type of any unvisited square.", type: ActionType.ACTION, item: true }
}


const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

const MISC =
{
    // @TODO
}

export 
{
    ActionData,
    ActionType,
    SETS,
    BASE_SET,
    ADVANCED_SET,
    EXPERT_SET,
    MISC
}
