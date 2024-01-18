

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
    horse: { frame: 0 },
    bison: { frame: 1 },
    deer: { frame: 2 },
    mammoth: { frame: 3 },
    rhino: { frame: 4 },
    lion: { frame: 5 },
    bear: { frame: 6 },
    human_idle: { frame: 7 },
    handprint: { frame: 8 },
    footprint: { frame: 9 },
    spear: { frame: 10 },
    axe: { frame: 11 },
    club: { frame: 12 },
    fishing_rod: { frame: 13 },
    arrow: { frame: 14 },
    pawprint: { frame: 15 },
    cave: { frame: 16 },
    hut: { frame: 17 },
    sun: { frame: 18 },
    moon: { frame: 19 },
    star: { frame: 20 },
    cloud: { frame: 21 },
    mountain: { frame: 22 },
    river: { frame: 23 },
    water_droplet: { frame: 23 },
    cross: { frame: 24 },
    zigzag: { frame: 25 },
    spiral: { frame: 26 },
    line: { frame: 27 },
    dots: { frame: 28 }, // @NOTE: plural to make it mean a bit more?
    circle: { frame: 29 },
    square: { frame: 30 },
    pyramid: { frame: 31 }, // or just triangle
    male: { frame: 32 }, // or "dad"
    female: { frame: 33 }, // or "mom"

    sheep: { frame: 34 },
    mouse: { frame: 35 },
    boots: { frame: 36 },
    duck: { frame: 37 },
    pig: { frame: 38 },
    ear: { frame: 39 },
    leg: { frame: 40 },
    face: { frame: 41 },
    lightning: { frame: 42 },
    cat: { frame: 43 },
    ghost: { frame: 44 },
    vase: { frame: 45 },
    hammer: { frame: 46 },
    stone: { frame: 47 },
    baby: { frame: 48 },
    spider: { frame: 49 },
    volcano: { frame: 50 },
    tree: { frame: 51 },
    flower: { frame: 52 },
    net: { frame: 53 },
    human_hunt: { frame: 54 },
    human_carry: { frame: 55 },
    human_sail: { frame: 56 }
}

/*

treasure/diamond
camel
book
pen/pencil/feather
wood
flag
butterfly

ocean
grains of sand
candle/fire
cook/cooking?
shoe
bird
scorpion
hourglass/sandtimer
leaf

egg
shirt 
skirt

snowflake
berries
orange
banana
giant/dwarf/dragon?
heart
owl
hat/headwear
rain

elephant
giraffe
rope
witch
ship


TOO MODERN?
table
chair
fork
knife
spoon

cheese
shirt
game?
rabbit
worm
ring
carrot
key
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
