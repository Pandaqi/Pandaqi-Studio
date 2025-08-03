interface ElementData { 
    frame?: number,
    desc?: string,
    names?: string[][]
}

export const ELEMENTS:Record<string, ElementData> = 
{
    fire: { frame: 0, desc: "BEFORE: Take 1 Squad card into your hand (from any squad).", names: [
        ["beak", "firetail", "sharp"],
        ["rhino", "horn", "carry", "bag", "backpack"],
        ["torch", "explo", "racco"]
    ] },

    electric: { frame: 1, desc: "AFTER: The loser steals one card <em>or</em> gives away one card to the winner.", names: [
        ["crackle", "beak", "wing", "robo", "talon"],
        ["robo", "bionic", "pig", "piggy", "feeler", "snout", "curly", "pink"],
        ["robo", "bionic", "pig", "piggy", "feeler", "snout", "curly", "pink"],
    ] },

    star: { frame: 2, desc: "BEFORE: Pick a type. Its icons count double!", names: [
        ["horse", "bomb", "pit", "burner", "spit"],
        ["volcano", "bomb", "erupt", "firehair", "pudding", "duddle"],
        ["horse", "unicorn", "horn", "white", "spit", "blonde", "quicksand"]
    ] },

    dragon: { frame: 3, desc: "BEFORE: Add one more card from your hand to one of the squads.", names: [
        ["dragon", "wing", "scale", "spine", "spike", "breath", "flap", "king", "rex"]
    ] },
    
    water: { frame: 4, desc: "BEFORE: Swap 1 card from your squad with 1 from your hand.", names: [
        ["fish", "fin", "seaweed", "scale", "twirl", "garla", "coral"],
        ["dolphi", "snout", "fin", "flipper", "curve", "elega", "swim", "chatter", "squeak", "coral"],
        ["turtle", "torto", "owl", "beak", "tuft", "wise", "slumber", "coral"]
    ] },

    ice: { frame: 5, desc: "BEFORE: For every card with multiple types, pick only <em>one</em> that counts (for that card).", names: [
        ["ice", "pengu", "fox", "arcti", "cube", "white", "shiver", "frost", "snow", "puffy", "glove"]
    ] },

    poison: { frame: 6, desc: "BEFORE: Pick 2 types. All icons of type 1 turn into type 2.", names: [
        ["poison", "sting", "kill", "mushroom", "snake", "serpent", "hydra", "trio", "tongue", "slither"],
        ["poison", "sting", "kill", "mushroom", "snake", "serpent", "hydra", "trio", "tongue", "slither"],
        ["bite", "tongue", "pig", "guin", "guinea", "slither", "swerve", "tail", "bobble", "shuffle"]
    ] },

    weather: { frame: 7, desc: "BEFORE: Swap 1 card from your squad with 1 card from the opponent's squad.", names: [
        ["rain", "snow", "hail", "bubble", "day", "night", "desert", "cloudy", "cover", "aurora", "sunset", "sunrise"]
    ] },

    earth: { frame: 8, desc: "BEFORE: Pick a type. Ignore it entirely. (Icons are worth 0 points and main types do not Counter anything.)", names: [
        ["flower", "dog", "color", "cute", "fur", "rose", "lily", "lotus", "lavend", "jasmin"],
        ["deer", "antler", "butwing", "wing", "fly", "forest", "brown", "dotted", "spike", "hoof", "gallop"],
        ["flam", "mingo", "giraffe", "longneck", "neck", "onepaw", "pink", "dot"]
    ] },

    grass: { frame: 9, desc: "BEFORE: Pick a type. It cannot be Countered.", names: [
        ["porcu", "pine", "spike", "sting", "stalk", "grass", "camou", "hair", "moss"]
    ] },

    rock: { frame: 10, desc: "AFTER: Pick a card. It does not get traded (after the fight).", names: [
        ["rock", "pebble", "stone", "gray", "statue", "metal", "hard", "brick", "unbrik", "shard", "build", "giraffe", "neck"],
        ["rock", "pebble", "stone", "gray", "statue", "metal", "hard", "brick", "unbrik", "shard", "build", "sheep", "wool", "bleat", "fluff", "bobble"],
        ["rock", "pebble", "stone", "gray", "statue", "metal", "hard", "brick", "unbrik", "shard", "build", "zebra", "stripe", "patter", "block"]
    ] },

    bug: { frame: 11, desc: "AFTER: If one of the players says they're \"done\", the other must do so too.", names: [
        ["bug", "lady", "ladybug", "shell", "red", "tenta", "tacle", "octo", "pus", "wing", "creep"],
        ["worm", "snail", "leaf", "rainbow", "color", "crawl", "cater", "pillar", "pointy", "woolly"],
        ["worm", "snail", "leaf", "rainbow", "color", "crawl", "cater", "pillar", "pointy", "woolly"],
    ] },

    air: { frame: 12, desc: "AFTER: The loser must show their whole hand to everyone.", names: [
        ["cloud", "slumber", "baby", "sleep", "crib", "cradle", "dust", "glow", "wishy", "wooshy", "torna", "nado", "hurri", "cane"]
    ] },

    magic: { frame: 13, desc: "BEFORE: Both players add 1 (secret) card to the opponent's squad. The attacker decides: continue fighting, or cancel the fight.", names: [
        ["octo", "pus", "wand", "tenta", "tacle", "eight", "bobhead", "grip", "spell"],
        ["ox", "taur", "mino", "cow", "buffa", "fallo", "horn", "wingback", "blue", "levi", "curse"],
        ["dwarf", "pixie", "beard", "small", "smallwing", "eary", "hat", "fairy", "float"]
    ] },

    ghost: { frame: 14, desc: "AFTER: Both players permanently reveal 1 card from their hand. (Rotate it to face away from you.)", names: [
        ["ele", "phanto", "gray", "ghost", "luce", "trunk", "haunt", "opac", "alpha"],
        ["gray", "ghost", "luce", "haunt", "angel", "hop", "antler", "blackhorn"],
        ["ele", "phanto", "gray", "ghost", "luce", "trunk", "haunt", "opac", "alpha"],
    ] },

    dark: { frame: 15, desc: "BEFORE: Pick a type. All its icons become a penalty (worth -1 instead of +1).", names: [
        ["cat", "black", "night", "gem", "coin", "treasure", "bling", "money", "thief", "burgla", "steal", "shadow", "pillow", "box", "fight", "eyes", "beard", "pirate", "glow", "grab"]
    ] }
}


interface CategoryData {
    color: string,
    colorDark: string,
    names: string[],
    colorBG: string,
    counters: string
}

export const CATEGORIES:Record<string, CategoryData> = 
{
    red: { color: "#FF6C6C", colorDark: "#6F0000", colorBG: "#FFD2D2", names: ["red", "fire", "lava", "star", "hot", "sun", "scorch", "flame", "burn", "demo"], counters: "purple" },
    blue: { color: "#00B3E1", colorDark: "#00495C", colorBG: "#D6FEFA", names: ["blue", "water", "drop", "dew", "flow", "river", "sea", "wave", "moon", "bubble"], counters: "red" },
    green: { color: "#23AC00", colorDark: "#0C3A00", colorBG: "#E8FFDF", names: ["green", "earth", "grass", "flower", "bloom", "life", "sun", "petal", "stalk", "twig", "leaf"], counters: "blue" },
    purple: { color: "#BB56E9", colorDark: "#390053", colorBG: "#F2E3FF", names: ["purple", "air", "magic", "witch", "wizard", "wiz", "faerie", "glow", "gust", "wind", "force"], counters: "green" }
}

export type TypeStats = Record<string,TypeStat>
export interface TypeStat {
    regular: number,
    action: number,
    total: number
}