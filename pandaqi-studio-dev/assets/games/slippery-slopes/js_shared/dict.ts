import Circle from "js/pq_games/tools/geometry/circle"
import LShape from "js/pq_games/tools/geometry/elShape"
import Polygon from "js/pq_games/tools/geometry/polygon"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import Star from "js/pq_games/tools/geometry/star"

interface ActionData
{
    frame: number,
    prob?: number,
    desc: string
}

const ACTIONS:Record<string, ActionData> = 
{
    add: { frame: 0, prob: 1, desc: "Draw an extra slider and mark your word on it." },
    replace: { frame: 1, prob: 0.5, desc: "Replace one or more sliders by new ones." },
    ignore: { frame: 2, prob: 0.33, desc: "You're allowed to ignore one or more sliders. (Don't mark anything on it.)" },
    double: { frame: 3, prob: 2, desc: "Place two markers on the same slider (to indicate two separate values)." },
    hint: { frame: 4, prob: 1, desc: "Give a one-word hint, but it must start with the same letter as another word on your card. (You can't say your original word.)" },
    category: { frame: 5, prob: 1.33, desc: "Say the category to which the word belongs." },
    order: { frame: 6, prob: 1.33, desc: "Explain the order of importance of your sliders. (Which one is the best hint, until the one that's the worst hint.)" },
    property: { frame: 7, prob: 2.0, desc: "Rename the ends of a slider to two different properties. Now mark your secret word on that new scale." }
}

interface PropertyData
{
    low:string,
    high:string,
    frame:number
}

// @TODO: come up with way more properties
const PROPERTIES:Record<string, PropertyData> =
{
    temperature: { low: "cold", high: "hot", frame: 0 },
    weight: { low: "heavy", high: "light", frame: 1 },
    size: { low: "tiny", high: "huge", frame: 2 },
    strength: { low: "weak", high: "strong", frame: 3 },
    lightness: { low: "dark", high: "bright", frame: 4 }, // dull-bright?
    volume: { low: "quiet", high: "loud", frame: 5 },
    intelligence: { low: "dumb", high: "clever", frame: 6 },
    danger: { low: "harmless", high: "harmful", frame: 7 },
    length: { low: "short", high: "tall", frame: 8 },
    solidity: { low: "squishy", high: "solid", frame: 9 }, // ??
    smell: { low: "aromatic", high: "smelly", frame: 10 }, // ??
    distance: { low: "near", high: "far", frame: 11 },
    difficulty: { low: "easy", high: "hard", frame: 12 },
    depth: { low: "shallow", high: "deep", frame: 13 },
    life: { low: "lifeless", high: "alive", frame: 14 },
    quality: { low: "bad", high: "good", frame: 15 }, // ??
    beauty: { low: "ugly", high: "pretty", frame: 16 },
    humor: { low: "serious", high: "funny", frame: 17 }, // ??
    taste: { low: "disgusting", high: "delicious", frame: 18 },
    cleanliness: { low: "dirty", high: "clean", frame: 19 },
    age: { low: "young", high: "old", frame: 20 },
    fright: { low: "comfortable", high: "scary", frame: 21 },
    price: { low: "cheap", high: "expensive", frame: 21 },
    likeability: { low: "disliked", high: "liked", frame: 22 },
    health: { low: "sick", high: "healthy", frame: 23 }, // ??
    speed: { low: "slow", high: "fast", frame: 24 },
    girth: { low: "skinny", high: "fat", frame: 25 },
    environment: { low: "inside", high: "outside", frame: 26 },
    legality: { low: "illegal", high: "legal", frame: 27 }, // ??
    wealth: { low: "poor", high: "rich", frame: 28 },
    openness: { low: "closed", high: "open", frame: 29 }, // ??
    relevance: { low: "useless", high: "crucial", frame: 30 }, // ??
    space: { low: "spaceous", high: "crowded", frame: 31 },
    skill: { low: "incapable", high: "capable", frame: 32 },
    expertise: { low: "amateur", high: "professional", frame: 32 }, // ??
    entertainment: { low: "boring", high: "interesting", frame: 33 }, // boring-amusing?
    popularity: { low: "unknown", high: "well-known", frame: 34 },
    frequency: { low: "rare", high: "common", frame: 35 }, // plentiful-scarce?
    sweetness: { low: "bitter", high: "sweet", frame: 36 },
    safety: { low: "unsafe", high: "safe", frame: 37 },
    elegance: { low: "awkward", high: "graceful", frame: 38 }, // ??
    clarity: { low: "obscure", high: "apparent", frame: 39 }, // ??
    ego: { low: "arrogant", high: "humble", frame: 40 }, // ??
    cover: { low: "bare", high: "covered", frame: 41 }, // revealed-hidden?
    energy: { low: "curse", high: "blessing", frame: 42 },
    weather: { low: "calm", high: "windy", frame: 43 }, // ?? chilly-warm?
    emotion: { low: "sad", high: "cheerful", frame: 44 },
    simplicity: { low: "simple", high: "complex", frame: 45 },
    sanity: { low: "crazy", high: "sane", frame: 46 }, // ??
    kindness: { low: "cruel", high: "kind", frame: 47 },
    care: { low: "careless", high: "careful", frame: 48 }, // ??
    damage: { low: "damaged", high: "whole", frame: 49 }, // broken-whole?
    wetness: { low: "dry", high: "wet", frame: 50 }, // rough-slick
    fill: { low: "empty", high: "full", frame: 51 },
    truth: { low: "fiction", high: "fact", frame: 52 }, // fake-real / sincere-insincere
    fashion: { low: "outdated", high: "modern", frame: 53 }, // old-fashioned vs fashionable
    rigidity: { low: "flabby", high: "firm", frame: 54 },
    float: { low: "float", high: "sink", frame: 55 }, // ??
    freedom: { low: "restricted", high: "free", frame: 56 }, // lenient-strict
    roughness: { low: "gentle", high: "rough", frame: 57 }, // smooth-rough / mild-rough
    religion: { low: "hell", high: "heaven", frame: 58 },
    height: { low: "low", high: "high", frame: 59 },
    tightness: { low: "loose", high: "tight", frame: 60 },
    gender: { low: "male", high: "female", frame: 61 },
    experience: { low: "nasty", high: "pleasant", frame: 62 },
    consequence: { low: "negative", high: "positive", frame: 63 },
    function: { low: "part", high: "standalone", frame: 64 }, // part-whole
    time: { low: "temporary", high: "permanent", frame: 65 },
    chaos: { low: "unpredictable", high: "predictable", frame: 66 }, // unsurprising-surprising
    outcome: { low: "success", high: "failure", frame: 67 },
    control: { low: "wild", high: "tame", frame: 68 }, // ??
    perception: { low: "terrible", high: "wonderful", frame: 69 },
    opacity: { low: "transparent", high: "opaque", frame: 70 }, // ??
    specificity: { low: "vague", high: "specific", frame: 71 }, // vague-definite / vague-concrete
    trait: { low: "vice", high: "virtue", frame: 72 },
    visibility: { low: "invisible", high: "visible", frame: 73 }, // ??
    pain: { low: "painless", high: "painful", frame: 74 }, // pleasant-sore
    fairness: { low: "unfair", high: "fair", frame: 75 }, // ??
    class: { low: "rough", high: "refined", frame: 76 }, // coarse-classy / indelicate-delicate
    friendliness: { low: "unfriendly", high: "friendly", frame: 77 }, // annoying-nice
}

const SLIDERS:Record<string, any> = 
{
    property: { subTypes: PROPERTIES, prob: 5, needsMeter: true },
    words: { subTypes: {}, prob: 3, max: 10, actionsForbidden: true },
    shapes: { subTypes: {}, prob: 2, max: 7, actionsForbidden: true },
    color: { subTypes: {}, prob: 1, max: 4, needsMeter: true },
}

const RANDOM_SHAPE_LIST = 
{
    circle: new Circle(),
    rect: new Rectangle(),
    pentagon: new Polygon({ corners: 5 }),
    hexagon: new Polygon({ corners: 6 }),
    octagon: new Polygon({ corners: 8 }),
    star: new Star(),
    el: new LShape(),
}

export {
    ACTIONS,
    SLIDERS,
    PROPERTIES,
    RANDOM_SHAPE_LIST
}