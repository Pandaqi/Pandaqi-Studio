

interface ColorData
{
    frame: number,
    color: string,
    colorText: string,
}

// @NOTE: the frame is needed to display the right PATTERN image as well
export const COLORS:Record<string, ColorData> =
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

export const DRAWINGS:Record<string, CaveDrawingData> = 
{
    // Almost all symbols are just all the common NATURE elements (that cavemen would've illustrated)
    // that I could think of at the moment
    sun: { frame: 0 },
    moon: { frame: 1 }, // also banana :p
    star: { frame: 2 },
    male: { frame: 3 }, // or dad/mom, boy/girl, etc.
    female: { frame: 4 },
    tree: { frame: 5 },
    mountain: { frame: 6 },
    cloud: { frame: 7 },

    // ABSTRACT SHAPES
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

    // BODY PARTS
    eye: { frame: 48 },
    mouth: { frame: 49 },
    leg: { frame: 50 },
    ear: { frame: 51 },
    face: { frame: 52 },
    skull: { frame: 53 },
    tail: { frame: 54 },
    breasts: { frame: 55 }, // tried to make it look like a chest of either male or female, not really succeeded

    // FOOD
    berries: { frame: 56 },
    orange: { frame: 57 }, // also apple or similar fruits
    carrot: { frame: 58 },
    meat: { frame: 59 },
    chicken: { frame: 60 }, // chicken leg
    fish: { frame: 61 },
    fish_skeleton: { frame: 62 },
    mushroom: { frame: 63 },

    // ANIMALS
    deer: { frame: 64 }, // also horse, bison, cow
    mammoth: { frame: 65 }, // also elephant of course
    snake: { frame: 66 }, // also worm, salamander, scorpion?
    bird: { frame: 67 }, // also duck; this is a top-down view of one
    spider: { frame: 68 }, // also beetle, insect
    turtle: { frame: 69 }, // also sheep, pig
    giraffe: { frame: 70 }, // also camel, dino
    lion: { frame: 71 }, // this is just a general animal (cat-like) face; cat / dog / lion

    // MISC
    skirt: { frame: 72 },
    shirt: { frame: 73 }, // also just general clothing
    hat: { frame: 74 }, // general headwear, also hair
    shoe: { frame: 75 }, // also boots
    die: { frame: 76 }, // does PQ WORDS have this as dice?
    ghost: { frame: 77 },
    snowflake: { frame: 78 },
    baby: { frame: 79 },
     
    // HUMANS (in action) + more ANIMALS + actual CAVEMAN abstract symbols
    flock: { frame: 80 }, // as in flock of birds, the typical wavy symbols for that
    rabbit: { frame: 81 },
    mouse: { frame: 82 },
    owl: { frame: 83 }, // also bird side view
    butterfly: { frame: 84 }, // also dragonfly
    bear: { frame: 85 },
    rhino: { frame: 87 },
    pectiform: { frame: 87 },

    half_circle: { frame: 88 },
    aviform: { frame: 89 },
    flabelliform: { frame: 90 },
    tectiform: { frame: 91 },
    human_idle: { frame: 92 },
    human_hunt: { frame: 93 },
    human_flee: { frame: 94 },
    human_sail: { frame: 95 },

    scalariform: { frame: 96 },
    axe: { frame: 97 },
    bag: { frame: 98 },
    necklace: { frame: 99 },
    penniform: { frame: 100 },
    diamond: { frame: 101 },
    corner: { frame: 102 },
    temple: { frame: 103 },

    cruciform: { frame: 104 },
    plus: { frame: 105 },
    human_carry: { frame: 106 },
    human_archer: { frame: 107 }

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

export const MISC =
{
    clay_square: { frame: 0 },
    divider: { frame: 1 }
}

export const MESSAGES = [
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