export enum ActionType
{
    SCORE, // scores, perhaps based on certain conditions
    STATE, // scores based on overall board state (usually frequency of occurrence)
    TERRA, // terraforms the map into something organic
    MOVE, // restricts or allows movement
    ACTION, // any other type of action, usually paid for by minus points, or destructive
}

export interface ActionData
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

export const MISC =
{
    points: { frame: 0 },
    item: { frame: 1 },
    hazard: { frame: 2 },
    starting_position: { frame: 3 },
}

export const pIcon = '<img id="misc" frame="' + MISC.points.frame + '">';
export const iIcon = '<img id="misc" frame="' + MISC.item.frame + '">';
export const hIcon = '<img id="misc" frame="' + MISC.hazard.frame + '">';

export type ActionSet = Record<string, ActionData>;
export const BASE_SET:ActionSet = 
{
    food: { frame: 0, label: "Food", desc: "Worth +1 " + pIcon + ".", type: ActionType.SCORE, color: "red" },
    water: { frame: 1, label: "Water", desc: "Worth +3 " + pIcon + ".", type: ActionType.SCORE, color: "blue" },
    diamond: { frame: 2, label: "Diamond", desc: "Worth as many " + pIcon + " as the total <b>number of diamonds that you have.</b>", type: ActionType.SCORE, item: true, maxRel: 0.075, minAbs: 5, color: "purple" },
    mist: { frame: 3, label: "Mist", desc: "Worth as many " + pIcon + " as the <b>number of unvisited spaces.</b>", type: ActionType.STATE, hazard: true, color: "black", maxRel: 0.085 }, // "evil mist / ghost"

    journal: { frame: 4, label: "Journal", desc: "If you own <b>the most</b> Journals, you score +12 " + pIcon + ".", type: ActionType.STATE, item: true, color: "brown" }, // "explorer's journal diary icon"
    bugs: { frame: 5, label: "Bugs", desc: "Worth +3 " + pIcon + " if you own <b>the least</b>, otherwise -3 " + pIcon + ".", type: ActionType.STATE, hazard: true, color: "yellow" },
    rabbit: { frame: 6, label: "Rabbit", desc: "Worth +5 " + pIcon + " if this is the <b>most occuring type</b> (out of everything), otherwise -2.", type: ActionType.STATE, prob: 1.725, color: "pink" }, // "simple rabbit"

    boots: { frame: 7, label: "Boots", desc: "Worth -4 " + pIcon + ". Each Boots allows moving <b>+1 square.</b> (Skip all in-between; only draw yourself at the final destination.)", type: ActionType.MOVE, item: true, minRel: 0.0725, maxRel: 0.15, color: "brown" },
    signpost: { frame: 8, label: "Signpost", desc: "Worth -3 " + pIcon + ". But when you move (this turn), you may start from <b>any</b> square on your trail.", type: ActionType.MOVE, item: true, prob: 1.4, color: "brown" },
    portal: { frame: 9, label: "Portal", desc: "When moving (this turn), move to another free square with a portal.", type: ActionType.MOVE, minAbs: 3, maxRel: 0.05, color: "purple" },
    octopus: { frame: 10, label: "Octopus", desc: "Worth -2 " + pIcon + ". This turn, you may move in <b>any direction</b>.", type: ActionType.MOVE, color: "purple" },

    tree: { frame: 11, label: "Tree", desc: "Worth as much as the number of <b>Trees on adjacent squares</b>.", type: ActionType.TERRA, prePass: "floodfill", minAbs: 5, prob: 1.5, color: "green" },
    trail: { frame: 12, label: "Trail", desc: "Worth as many " + pIcon + " as the <b>longest connected chain of Trails</b> on the board, <b>if</b> you own a piece of that.", type: ActionType.TERRA, prePass: "chain", minAbs: 5, prob: 1.5, color: "brown", forbiddenTypes: ["river"] },
    river: { frame: 13, label: "River", desc: "Worth as many " + pIcon + " as the <b>longest connected chain of Rivers</b> to which this square belongs.", type: ActionType.TERRA, prePass: "chain", minAbs: 5, prob: 1.5, color: "blue", forbiddenTypes: ["trail"] },
}

export const ADVANCED_SET:ActionSet = 
{
    cursed: { frame: 0, label: "Curse", desc: "Worth -1 " + pIcon + ".", type: ActionType.SCORE, hazard: true, item: true, color: "black" },
    coconut: { frame: 1, label: "Coconut", desc: "Worth +3 " + pIcon + ".", type: ActionType.SCORE, color: "brown" },
    heart: { frame: 2, label: "Heart", desc: "Worth +5 " + pIcon + ". If this is your <b>3rd heart</b>, however, you're <b>out of the game</b>.", type: ActionType.ACTION, hazard: true, minRel: 0.05, maxRel: 0.1, color: "red" },

    jaguar: { frame: 3, label: "Jaguar", desc: "Worth +6 " + pIcon + ", but only if this is the <b>least</b> occurring type out of everything on the board.", type: ActionType.STATE, prob: 0.75, color: "yellow" },
    trap: { frame: 4, label: "Trap", desc: "Worth -2 " + pIcon + ", unless you own the <b>most</b> traps (out of all players).", type: ActionType.STATE, hazard: true, prob: 1.33, color: "red" },
    attacker: { frame: 5, label: "Soldier", desc: "Worth +4 " + pIcon + ". If there's an <b>adjacent Soldier</b>, however, you <b>can't</b> pick this option.", type: ActionType.STATE, hazard: true, color: "red" },
    flag: { frame: 6, label: "Flag", desc: "Worth +8 " + pIcon + " if <b>more than half the rows</b> contain a Flag, otherwise -8.", type: ActionType.STATE, item: true, prePass: "rowcol", minRel: (1.0/32), maxRel: (2.0/32), color: "blue", forbiddenTypes: ["home"] },
    home: { frame: 7, label: "Home", desc: "Worth +8 " + pIcon + " if <b>less than half the columns</b> contain a Home, otherwise -8.", type: ActionType.STATE, item: true, prePass: "rowcol", minRel: (1.0/32), maxRel: (2.0/32), color: "brown", forbiddenTypes: ["flag"] },
 
    lookout: { frame: 8, label: "Lookout", desc: "Worth -10 " + pIcon + ". If owned, you may <b>wrap</b> around the board. (Exiting at one edge makes you reappear at the opposite edge.)", type: ActionType.MOVE, maxRel: 0.1, prob: 0.75, color: "purple" },
    warningsign: { frame: 9, label: "Warning", desc: "Cross out 3 icons on your trail, then move to <b>any free square</b>.", type: ActionType.MOVE, item: true, color: "yellow" }, // @OLD STATS: minRel: 0.05, prob: 1.0
    rocks: { frame: 10, label: "Rocks", desc: "<b>Nobody but you</b> may enter an <b>adjacent space</b>.", type: ActionType.MOVE, color: "turquoise", maxRel: 0.05 }, // @OLD POWER: "You <b>can't move</b> in the direction of rocks."
    rainbow: { frame: 11, label: "Rainbow", desc: "Worth +12 points, but you can't visit squares anymore that show an icon you already own.", type: ActionType.MOVE, color: "pink", maxRel: 0.08 },

    plant: { frame: 12, label: "Plant", desc: "Worth +1 " + pIcon + ". When picked, turn <b>1 adjacent square into a plant</b> (if possible).", type: ActionType.TERRA, prePass: "floodfill", minAbs: 5, prob: 1.2, color: "green" },
    virus: { frame: 13, label: "Virus", desc: "Worth -2 " + pIcon + ". If a <b>visited neighbor</b> shows a Virus, you <b>must</b> pick this option.", type: ActionType.TERRA, forbiddenTypes: ["sheep"], hazard: true, prePass: "chain", minAbs: 5, prob: 1.5, color: "blue" },
    sheep: { frame: 14, label: "Sheep", desc: "Worth +1 " + pIcon + ". If <b>at least 2 neighbors</b> show a Sheep, you <b>must</b> pick this option.", type: ActionType.TERRA, forbiddenTypes: ["virus"], prePass: "chain", minAbs: 5, prob: 1.0, color: "black" }, // @IMPROV: Make sure this is balanced; there are locations where it does NOT have 2 neighbors, it doesn't appear too often, etcetera => might be better served with floodfill algorithm? Custom parameters for prePass? Or just a better rule?
}

export const EXPERT_SET:ActionSet = 
{
    bag: { frame: 0, label: "Bag", desc: "Worth as many " + pIcon + " as the number of " + iIcon + " you collected.", type: ActionType.SCORE, requiresMetadata: true, item: true, color: "brown" },
    boar: { frame: 1, label: "Boar", desc: "Worth -2 " + pIcon + ", but immediately <b>take another turn</b>.", type: ActionType.ACTION, maxRel: 0.066, color: "brown" },
    campfire: { frame: 2, label: "Campfire", desc: "Worth -2 " + pIcon + ". When picked, decide the type of all adjacent squares with a " + hIcon + ".", type: ActionType.ACTION, hazard: true, maxRel: 0.1, color: "red", requiresMetadata: true },

    oasis: { frame: 3, label: "Oasis", desc: "Worth -15 " + pIcon + ". If owned, you must pick <b>two</b> options from each square.", type: ActionType.MOVE, hazard: true, maxRel: 0.06, color: "turquoise" }, // @OLD POWER: "If another player <b>can</b> move to an adjacent space, they <b>must</b> do so.", maxRel: 0.06,
    tunnel: { frame: 4, label: "Tunnel", desc: "When moving (this turn), go to a <b>free Tunnel square</b> in the <b>same row or column.</b>", type: ActionType.MOVE, color: "black" },
    egg: { frame: 5, label: "Egg", desc: "Worth +10 " + pIcon + ", but you're not allowed to visit spaces with a " + hIcon + " anymore.", type: ActionType.MOVE, requiresMetadata: true, item: true, color: "pink" },
    mermaid: { frame: 6, label: "Siren", desc: "Move <b>another player</b> one step (as if taking their turn).", type: ActionType.MOVE, color: "turquoise" },

    shaman: { frame: 7, label: "Shaman", desc: "Scores +3 if the <b>number of Shamans</b> picked so far is <b>odd</b>, otherwise -3. (Write on the cell to remember.)", type: ActionType.STATE, prob: 1.5, minRel: 0.06, color: "green" },
    shipwreck: { frame: 8, label: "Shipwreck", desc: "Worth as many " + pIcon + " as the <b>number of Ships</b> in its row and column.", type: ActionType.STATE, item: true, hazard: true, minRel: (1/32), color: "turquoise" },
    merchant: { frame: 9, label: "Merchant", desc: "Worth +6 " + pIcon + " if you collected the <b>most " + iIcon + "</b> (of all players), otherwise -6.", type: ActionType.STATE, requiresMetadata: true, color: "blue" },
    payout: { frame: 10, label: "Payout", desc: "Worth +4 " + pIcon + " if you collected the <b>least " + hIcon + "</b> (of all players), otherwise -4.", type: ActionType.STATE, requiresMetadata: true, item: true, color: "yellow" },

    gunshot: { frame: 11, label: "Gunshot", desc: "Worth -3 " + pIcon + ". When picked, completely <b>cross out</b> 2 visited squares in the same row or column.", type: ActionType.ACTION, hazard: true, maxRel: 0.066, color: "red" },

    herd: { frame: 12, label: "Herd", desc: "Worth as many " + pIcon + " as the <b>size of its group</b> ( = all herd connected to it).", type: ActionType.TERRA, prePass: "floodfill", minAbs: 5, prob: 1.5, color: "green" },
    birdsong: { frame: 13, label: "Birdsong", desc: "Worth +1 " + pIcon + ". When picked, also turn <b>one other square into Birdsong</b> (if possible).", type: ActionType.TERRA, minAbs: 5, prob: 1.5, color: "turquoise" },
    spell: { frame: 14, label: "Spell", desc: "When picked, decide the icon of <b>any unvisited square</b> with a " + iIcon + ".", type: ActionType.ACTION, item: true, color: "purple", requiresMetadata: true },
    empty: { frame: 15, label: "Empty", desc: "When picked, draw <b>any icon</b> (from the available options) inside it!", type: ActionType.ACTION, color: "black" } // this simply doesn't exist in the spritesheet, so it shows ... nothing
}


export const SETS:Record<string, ActionSet> = 
{
    base: BASE_SET,
    advanced: ADVANCED_SET,
    expert: EXPERT_SET
}

export const COLORS = 
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