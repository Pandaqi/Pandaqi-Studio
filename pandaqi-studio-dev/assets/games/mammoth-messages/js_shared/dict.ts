

interface ColorData
{
    frame: number,
    color: string,
    colorText: string,
}

// @NOTE: the frame is needed to display the right PATTERN image as well
const COLORS:Record<string, ColorData> =
{
    "red": { frame: 0, color: "#FF2127", colorText: "#FFCBCD" },
    "orange": { frame: 1, color: "#964200", colorText: "#FFCEA8" },
    "yellow": { frame: 2, color: "#D0B400", colorText: "#FFF5B6" },
    "green": { frame: 3, color: "#52D000", colorText: "#CCFFAB" },
    "turquoise": { frame: 4, color: "#00D08B", colorText: "#C6FFEC" },
    "blue": { frame: 5, color: "#4863B5", colorText: "#D4DFFF" },
    "pink": { frame: 6, color: "#6513AF", colorText: "#E5C8FF" },
    "purple": { frame: 7, color: "#FF38BC", colorText: "#FFC8EC" },
    "white": { frame: 8, color: "#D8D8D8", colorText: "#E5E5E5" },
    "black": { frame: 9, color: "#333333", colorText: "#D9D9D9" },
}

interface CaveDrawingData
{
    frame: number
}

const DRAWINGS:Record<string, CaveDrawingData> = 
{
    sun: { frame: 0 },
    moon: { frame: 1 },
    star: { frame: 2 },
    male: { frame: 3 }, // or dad/mom, boy/girl, etc.
    female: { frame: 4 },
    tree: { frame: 5 },
    mountain: { frame: 6 },
    cloud: { frame: 7 },

    river: { frame: 8 },
    water: { frame: 9 },
    square: { frame: 10 },
    circle: { frame: 11 },
    triangle: { frame: 12 }, // also pyramid
    spiral: { frame: 13 },
    cross: { frame: 14 }, // also plus
    arrow: { frame: 15 }, // also spear

    hammer: { frame: 16 },
    club: { frame: 17 },
    flower: { frame: 18 },
    stone: { frame: 19 }, // also rock
    hand: { frame: 20 },
    footprint: { frame: 21 },
    pawprint: { frame: 22 },
    net: { frame: 23 },
    
    line: { frame: 24 },
    dots: { frame: 25 },
    plant: { frame: 26 },
    zigzag: { frame: 27 },
    lightning: { frame: 28 },
    cave: { frame: 29 },
    house: { frame: 30 }, // also hut
    leaf: { frame: 31 },

    wood: { frame: 32 },
    feather: { frame: 33 }, // also pen/pencil
    flag: { frame: 34 },
    fire: { frame: 35 },
    rain: { frame: 36 },
    hourglass: { frame: 37 }, // also sandtimer
    egg: { frame: 38 },
    volcano: { frame: 39 },

    heart: { frame: 40 },
    ship: { frame: 41 },
    fork: { frame: 42 },
    bone: { frame: 43 },
    knife: { frame: 44 },
    spoon: { frame: 45 },
    grass: { frame: 46 },
    clover: { frame: 47 },

    

    // Categories left to do:
    // Animals
    // Humans in action
    // Body parts
    // Food
    // Misc (objects, clothing, concepts, etc) => keep some abstract or vague stuff that you could COMBINE with other things


    // Actual unique animals: deer/horse/bison, mammoth, snake, fish, bird, rhino, lion, bear, scorpion, camel, butterfly, elephant, giraffe, turtle, salamander. spider / dragonfly, sheep, mouse, duck, pig, cat, dog, owl, rabbit, worm
    // Misc: ghost, face, baby, hat, shirt, skirt, shoe/boots, fish skeleton, die/dice, snowflake
    // Body Parts: face, ear, leg, eye, skull
    // Food: berries, orange, banana, carrot, meat slab / chicken leg


    human_hunt: { frame: 54 },
    human_carry: { frame: 55 },
    human_sail: { frame: 56 },
    human_idle: { frame: 56 },
}

/*

TOO MODERN?
table
chair
cheese
game?
treasure/diamond
book
cook/cooking?
giant/dwarf/dragon?
rope
key
witch

*/

const MISC =
{
    clay_square: { frame: 0 },
    divider: { frame: 1 }
}

const MESSAGES = [
    "Oh no, a mammoth!",
    "Tiger: 0; Caveman: 1",
    "Just discovered fire, it's lit!",
    "Ooga booga",
    "Mammoths are so soft",
    "Animal skins are out of fashion",
    "Cavemen comedy tonight",
    "Ready to rock and roll?",
    "It's dark in here",
    "Okay, who triggered an ice age!?",
    "Darn dodos and their noise",
    "I found a stick named Spear",
    "Ug thinks dinosaurs still exist",
    "Discovered world peace today",
    "No entry for mammoths",
    "Ugha, I love you",
    "These dudes really can't draw",
    "Time traveler here. Send help.",
    "This is the diary of",
    "Get your own cave wall, Ugha!",
    "Ug, I don't love you back, sorry",
    "Has anybody seen my club?",
    "Caveman was here; mammoth was faster",
    "Me draw better buffalo than Ugh!",
    "Why mammoth never share snacks?",
    "Fire hot. Me not. Ouch!",
    "Ug think square wheel genius idea",
    "Drawn T-Rex, no like, too scary.",
    "Looking for best berry spot",
    "Share secret, get cave hug",    
    "Ug invent wheel, Bah invent flat tire, typical",
    "Hunting mammoth easier than finding true love",
    "Me not lazy. Energy-saving caveperson!",
    "Me invent art. Critics say look like stick figures",
    "Went fishing, fish smarter than Ug, they stay in water",
    "Ug learn to count: one, two, many",
]

export 
{
    COLORS,
    DRAWINGS,
    MESSAGES,
    MISC
}
