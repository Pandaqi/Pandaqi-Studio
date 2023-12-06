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
    minRel?: number,
    maxRel?: number,
    color?: string,
    textureKey?: string, // filled in automatically upon loading (based on set name)
}

const MISC =
{
    points: { frame: 0 },
    item: { frame: 1 },
    hazard: { frame: 2 }
    // @TODO
}

const pIcon = '<img id="misc" frame="' + MISC.points.frame + '">';
const iIcon = '<img id="misc" frame="' + MISC.item.frame + '">';
const hIcon = '<img id="misc" frame="' + MISC.hazard.frame + '">';

type ActionSet = Record<string, ActionData>;
const BASE_SET:ActionSet = 
{
    food: { frame: 0, label: "Food", desc: "Worth +1 " + pIcon + ".", type: ActionType.SCORE, color: "red" },
    water: { frame: 1, label: "Water", desc: "Worth +2 " + pIcon + ".", type: ActionType.SCORE, color: "blue" },
    diamond: { frame: 2, label: "Diamond", desc: "Worth as many " + pIcon + " as the total <b>number of diamonds that you have.</b>", type: ActionType.SCORE, item: true, maxRel: 0.1, minAbs: 5, color: "purple" },
    mist: { frame: 3, label: "Mist", desc: "Worth as many " + pIcon + " as the <b>number of unvisited spaces.</b>", type: ActionType.STATE, hazard: true, color: "black" }, // "evil mist / ghost"

    journal: { frame: 4, label: "Journal", desc: "If you own <b>the most</b> Journals, you score +10 " + pIcon + ".", type: ActionType.STATE, item: true, color: "brown" }, // "explorer's journal diary icon"
    bugs: { frame: 5, label: "Bugs", desc: "Worth +2 " + pIcon + " if you own <b>the least</b>, otherwise -2 " + pIcon + ".", type: ActionType.STATE, hazard: true, color: "yellow" },
    rabbit: { frame: 6, label: "Rabbit", desc: "Worth +6 " + pIcon + ", but only if this is the <b>most occuring type</b> (out of everything)", type: ActionType.STATE, prob: 1.75, color: "pink" }, // "simple rabbit"

    boots: { frame: 7, label: "Boots", desc: "Worth -5 " + pIcon + ". Each Boots allows you to <b>move an extra space</b> on your turn.", type: ActionType.MOVE, item: true, maxAbs: 6, color: "brown" },
    signpost: { frame: 8, label: "Signpost", desc: "Worth +3 " + pIcon + ", but only pickable if you move in its direction.", type: ActionType.MOVE, item: true, prob: 1.4, color: "brown" },
    portal: { frame: 9, label: "Portal", desc: "Instead of taking 1 step, move to another free square with a portal.", type: ActionType.MOVE, minAbs: 3, maxRel: 0.05, color: "purple" },

    tree: { frame: 10, label: "Tree", desc: "Worth as much as the number of <b>Trees on adjacent squares</b>.", type: ActionType.TERRA, prePass: "floodfill", minAbs: 5, prob: 1.5, color: "green" },
    trail: { frame: 11, label: "Trail", desc: "Worth as many " + pIcon + " as the <b>longest connected trail</b> on the board, <b>if</b> you own a piece of that.", type: ActionType.TERRA, prePass: "chain", minAbs: 5, prob: 1.5, color: "brown" },
    river: { frame: 12, label: "River", desc: "Worth as many " + pIcon + " as the <b>total length of its river</b>.", type: ActionType.TERRA, prePass: "chain", minAbs: 5, prob: 1.5, color: "blue" },
}

const ADVANCED_SET:ActionSet = 
{
    cursed: { frame: 0, label: "Curse", desc: "Worth -1 " + pIcon + ".", type: ActionType.SCORE, hazard: true, item: true },
    coconut: { frame: 1, label: "Coconut", desc: "Worth +3 " + pIcon + ".", type: ActionType.SCORE },
    heart: { frame: 2, label: "Heart", desc: "Worth +5 " + pIcon + ". If this is your <b>3rd heart</b>, however, you're <b>out of the game</b>.", type: ActionType.ACTION, hazard: true, minRel: 0.05, maxRel: 0.1 },

    jaguar: { frame: 3, label: "Jaguar", desc: "Worth +6 " + pIcon + ", but only if this is the <b>least</b> occurring type out of everything on the board.", type: ActionType.STATE, prob: 0.75 },
    trap: { frame: 4, label: "Trap", desc: "Worth -2 " + pIcon + ", unless you own the <b>most</b> traps (out of all players).", type: ActionType.STATE, hazard: true, prob: 1.33 },
    attacker: { frame: 5, label: "Soldier", desc: "Worth +2 " + pIcon + ". If there's an <b>adjacent Soldier</b>, however, you <b>can't</b> pick this option.", type: ActionType.STATE, hazard: true },
    flag: { frame: 6, label: "Flag", desc: "Worth +8 " + pIcon + " if <b>more than half the rows</b> contain a Flag, otherwise -8.", type: ActionType.STATE, item: true, prePass: "rowcol", minRel: (1/32), maxRel: (2/32) },
    home: { frame: 7, label: "Home", desc: "Worth +8 " + pIcon + " if <b>less than half the columns</b> contain a Home, otherwise -8.", type: ActionType.STATE, item: true, prePass: "rowcol", minRel: (1/32), maxRel: (2/32) },
 
    lookout: { frame: 8, label: "Lookout", desc: "<b>Nobody but you</b> may enter an <b>adjacent space</b>.", type: ActionType.MOVE, maxRel: 0.05 },
    warningsign: { frame: 9, label: "Warning", desc: "Worth +2 " + pIcon + ", but only pickable if you <b>don't move</b> in its direction.", type: ActionType.MOVE, item: true },
    rocks: { frame: 10, label: "Rocks", desc: "You <b>can't move</b> in the direction of rocks.", type: ActionType.MOVE }, // @TODO: is this interesting enough?

    plant: { frame: 11, label: "Plant", desc: "Worth +1 " + pIcon + ". When picked, turn <b>1 adjacent tile into a plant</b> (if possible).", type: ActionType.TERRA, prePass: "floodfill", minAbs: 5, prob: 1.5 },
    virus: { frame: 12, label: "Virus", desc: "Worth -2 " + pIcon + ". If there's an <b>adjacent Virus</b>, you <b>must</b> pick this option.", type: ActionType.TERRA, forbiddenTypes: ["sheep"], hazard: true, prePass: "chain", minAbs: 5, prob: 1.5 },
    sheep: { frame: 13, label: "Sheep", desc: "Worth +1 " + pIcon + ". If there's an <b>adjacent Sheep</b>, you <b>must</b> pick this option.", type: ActionType.TERRA, forbiddenTypes: ["virus"], prePass: "chain", minAbs: 5, prob: 1.5 },
}

const EXPERT_SET:ActionSet = 
{
    bag: { frame: 0, label: "Bag", desc: "Worth as many " + pIcon + " as the number of " + iIcon + " you collected.", type: ActionType.SCORE, requiresMetadata: true, item: true },
    boar: { frame: 1, label: "Boar", desc: "Worth -2 " + pIcon + ", but immediately <b>take another turn</b>.", type: ActionType.ACTION, maxRel: 0.066 },
    campfire: { frame: 2, label: "Campfire", desc: "Worth -1 " + pIcon + ". When picked, <b>destroy</b> 2 adjacent tiles.", type: ActionType.ACTION, hazard: true, maxRel: 0.06 },

    oasis: { frame: 3, label: "Oasis", desc: "If another player <b>can</b> move to an adjacent space, they <b>must</b> do so.", type: ActionType.MOVE, hazard: true, maxRel: 0.06 },
    tunnel: { frame: 4, label: "Tunnel", desc: "When leaving a tunnel, you take <b>double the steps</b> you otherwise would. (Skipping in-between spaces.)", type: ActionType.MOVE },
    egg: { frame: 5, label: "Egg", desc: "Worth +6 " + pIcon + ", but you're not allowed to visit " + hIcon + " spaces anymore.", type: ActionType.MOVE, requiresMetadata: true, item: true },

    shaman: { frame: 6, label: "Shaman", desc: "Scores +3 if the <b>number of Shamans</b> picked so far is <b>odd</b>, otherwise -3. (Write on the cell to remember.)", type: ActionType.STATE, prob: 1.5, minRel: 0.06 },
    shipwreck: { frame: 7, label: "Shipwreck", desc: "Worth as many " + pIcon + " as the <b>number of Ships</b> in its row and column.", type: ActionType.STATE, item: true, hazard: true, minRel: (1/32) },
    merchant: { frame: 8, label: "Merchant", desc: "Worth +6 " + pIcon + " if you collected the <b>most " + iIcon + "</b> (of all players), otherwise -6.", type: ActionType.STATE, requiresMetadata: true },
    payout: { frame: 9, label: "Payout", desc: "Worth +4 " + pIcon + " if you collected the <b>least " + hIcon + "</b> (of all players), otherwise -4.", type: ActionType.STATE, requiresMetadata: true, item: true },

    gunshot: { frame: 10, label: "Gunshot", desc: "Worth -2 " + pIcon + ". When picked, <b>destroy</b> 2 tiles in the same row or column.", type: ActionType.ACTION, hazard: true, maxRel: 0.066 },

    herd: { frame: 11, label: "Herd", desc: "Worth as many " + pIcon + " as the <b>size of its group</b> ( = all herd connected to it).", type: ActionType.TERRA, prePass: "floodfill", minAbs: 5, prob: 1.5 },
    birdsong: { frame: 12, label: "Birdsong", desc: "Worth +1 " + pIcon + ". When picked, also turn <b>any other square into Birdsong</b> (if possible).", type: ActionType.TERRA, minAbs: 5, prob: 1.5 },
    spell: { frame: 13, label: "Spell", desc: "Worth 0 " + pIcon + ". When picked, decide the type of <b>any unvisited square</b>.", type: ActionType.ACTION, item: true, }
}


const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

const COLORS = 
{
    red: { dark: "#290303", light: "#ffc9c9" },
    yellow: { dark: "#292803", light: "#f9f69a" },
    brown: { dark: "#291103", light: "#f4b693" },
    green: { dark: "#0b2903", light: "#bff8b0" },
    turquoise: { dark: "#032925", light: "#a5f2ea" },
    blue: { dark: "#04082c", light: "#bdc3fe" },
    purple: { dark: "#170323", light: "#ebcafe" },
    pink: { dark: "#31051b", light: "#fcbedd" },
    black: { dark: "#212121", light: "#eeeeee" }
}


export 
{
    ActionData,
    ActionType,
    SETS,
    BASE_SET,
    ADVANCED_SET,
    EXPERT_SET,
    MISC,
    COLORS
}
