interface ElementData { 
    frame: number,
    names: string[][]
}

const ELEMENTS:Record<string, ElementData> = {
    fire: { frame: 0, names: [
        ["beak", "firetail", "sharp"],
        ["rhino", "horn", "carry", "bag", "backpack"],
        ["torch", "explo", "racco"]
    ] },

    electric: { frame: 1, names: [
        ["crackle", "beak", "wing", "robo", "talon"],
        ["robo", "bionic", "pig", "piggy", "feeler", "snout", "curly", "pink"],
        ["robo", "bionic", "pig", "piggy", "feeler", "snout", "curly", "pink"],
    ] },

    star: { frame: 2, names: [
        ["horse", "bomb", "pit", "burner", "spit"],
        ["volcano", "bomb", "erupt", "firehair", "pudding", "duddle"],
        ["horse", "unicorn", "horn", "white", "spit", "blonde", "quicksand"]
    ] },

    dragon: { frame: 3, names: [
        ["dragon", "wing", "scale", "spine", "spike", "breath", "flap", "king", "rex"]
    ] },
    
    water: { frame: 4, names: [
        ["fish", "fin", "seaweed", "scale", "twirl", "garla", "coral"],
        ["dolphi", "snout", "fin", "flipper", "curve", "elega", "swim", "chatter", "squeak", "coral"],
        ["turtle", "torto", "owl", "beak", "tuft", "wise", "slumber", "coral"]
    ] },

    ice: { frame: 5, names: [
        ["ice", "pengu", "fox", "arcti", "cube", "white", "shiver", "frost", "snow", "puffy", "glove"]
    ] },

    poison: { frame: 6, names: [
        ["poison", "sting", "kill", "mushroom", "snake", "serpent", "hydra", "trio", "tongue", "slither"],
        ["poison", "sting", "kill", "mushroom", "snake", "serpent", "hydra", "trio", "tongue", "slither"],
        ["bite", "tongue", "pig", "guin", "guinea", "slither", "swerve", "tail", "bobble", "shuffle"]
    ] },

    weather: { frame: 7, names: [
        ["rain", "snow", "hail", "bubble", "day", "night", "desert", "cloudy", "cover", "aurora", "sunset", "sunrise"]
    ] },

    earth: { frame: 8, names: [
        ["flower", "dog", "color", "cute", "fur", "rose", "lily", "lotus", "lavend", "jasmin"],
        ["deer", "antler", "butwing", "wing", "fly", "forest", "brown", "dotted", "spike", "hoof", "gallop"],
        ["flam", "mingo", "giraffe", "longneck", "neck", "onepaw", "pink", "dot"]
    ] },

    grass: { frame: 9, names: [
        ["porcu", "pine", "spike", "sting", "stalk", "grass", "camou", "hair", "moss"]
    ] },

    rock: { frame: 10, names: [
        ["rock", "pebble", "stone", "gray", "statue", "metal", "hard", "brick", "unbrik", "shard", "build", "giraffe", "neck"],
        ["rock", "pebble", "stone", "gray", "statue", "metal", "hard", "brick", "unbrik", "shard", "build", "sheep", "wool", "bleat", "fluff", "bobble"],
        ["rock", "pebble", "stone", "gray", "statue", "metal", "hard", "brick", "unbrik", "shard", "build", "zebra", "stripe", "patter", "block"]
    ] },

    bug: { frame: 11, names: [
        ["bug", "lady", "ladybug", "shell", "red", "tenta", "tacle", "octo", "pus", "wing", "creep"],
        ["worm", "snail", "leaf", "rainbow", "color", "crawl", "cater", "pillar", "pointy", "woolly"],
        ["worm", "snail", "leaf", "rainbow", "color", "crawl", "cater", "pillar", "pointy", "woolly"],
    ] },

    air: { frame: 12, names: [
        ["cloud", "slumber", "baby", "sleep", "crib", "cradle", "dust", "glow", "wishy", "wooshy", "torna", "nado", "hurri", "cane"]
    ] },

    magic: { frame: 13, names: [
        ["octo", "pus", "wand", "tenta", "tacle", "eight", "bobhead", "grip", "spell"],
        ["ox", "taur", "mino", "cow", "buffa", "fallo", "horn", "wingback", "blue", "levi", "curse"],
        ["dwarf", "pixie", "beard", "small", "smallwing", "eary", "hat", "fairy", "float"]
    ] },

    ghost: { frame: 14, names: [
        ["ele", "phanto", "gray", "ghost", "luce", "trunk", "haunt", "opac", "alpha"],
        ["gray", "ghost", "luce", "haunt", "angel", "hop", "antler", "blackhorn"],
        ["ele", "phanto", "gray", "ghost", "luce", "trunk", "haunt", "opac", "alpha"],
    ] },

    dark: { frame: 15, names: [
        ["cat", "black", "night", "gem", "coin", "treasure", "bling", "money", "thief", "burgla", "steal", "shadow", "pillow", "box", "fight", "eyes", "beard", "pirate", "glow", "grab"]
    ] }
}


interface CategoryData {
    color: string,
    colorDark: string,
    names: string[]
}

const CATEGORIES:Record<string, CategoryData> = {
    red: { color: "#FF6C6C", colorDark: "#6F0000", names: ["red", "fire", "lava", "star", "hot", "sun", "scorch", "flame", "burn", "demo"] },
    blue: { color: "#00B3E1", colorDark: "#00495C", names: ["blue", "water", "drop", "dew", "flow", "river", "sea", "wave", "moon", "bubble"] },
    green: { color: "#23AC00", colorDark: "#0C3A00", names: ["green", "earth", "grass", "flower", "bloom", "life", "sun", "petal", "stalk", "twig", "leaf"] },
    purple: { color: "#BB56E9", colorDark: "#390053", names: ["purple", "air", "magic", "witch", "wizard", "wiz", "faerie", "glow", "gust", "wind", "force"] }
}


export {
    ELEMENTS,
    CATEGORIES
}