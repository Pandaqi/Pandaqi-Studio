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

export const ACTIONS:Record<string, ActionData> = 
{
    add: { frame: 0, prob: 1, desc: "Draw two extra sliders and mark your word on those." },
    replace: { frame: 1, prob: 1.33, desc: "Replace one or more sliders by new ones." },
    ignore: { frame: 2, prob: 0.33, desc: "You're allowed to ignore one or more sliders. (Don't mark anything on them.)" },
    double: { frame: 3, prob: 1, desc: "Place two markers on the same slider (to indicate two separate values)." },
    hint: { frame: 4, prob: 1, desc: "Give a one-word hint, but it can't be a word from your card." },
    category: { frame: 5, prob: 1.33, desc: "Say the category to which the word belongs." },
    order: { frame: 6, prob: 1.33, desc: "Explain the order of importance of your sliders. (Which one is the best hint -> which one's the worst hint.)" },
    property: { frame: 7, prob: 2.5, desc: "Rename the ends of a slider to two different properties. Now mark your secret word on that new scale!" }
}

interface PropertyData
{
    low:string,
    high:string,
    frame:number,
    req?:boolean,
    prob?:number
}

export const PROPERTIES:Record<string, PropertyData> =
{
    temperature: { low: "cold", high: "hot", frame: 0, req: true, prob: 1.5 },
    weight: { low: "heavy", high: "light", frame: 1, req: true, prob: 3 },
    size: { low: "tiny", high: "huge", frame: 2, req: true, prob: 4 },
    strength: { low: "weak", high: "strong", frame: 3 },
    lightness: { low: "dark", high: "bright", frame: 4, prob: 0.66 }, // dull-bright?
    volume: { low: "quiet", high: "loud", frame: 5, prob: 1.25 },
    intelligence: { low: "dumb", high: "clever", frame: 6 },
    danger: { low: "harmless", high: "harmful", frame: 7, req: true, prob: 1.75 },
    length: { low: "short", high: "tall", frame: 8, req: true, prob: 1.25 },
    solidity: { low: "squishy", high: "solid", frame: 9 }, // ??
    smell: { low: "aromatic", high: "smelly", frame: 10, req: true, prob: 1.75 }, // ??
    distance: { low: "near", high: "far", frame: 11, prob: 0.5 },
    difficulty: { low: "easy", high: "hard", frame: 12 },
    depth: { low: "shallow", high: "deep", frame: 13, prob: 0.5 },
    life: { low: "lifeless", high: "alive", frame: 14, req: true, prob: 3 },
    quality: { low: "bad", high: "good", frame: 15, prob: 1.25 }, // ??
    beauty: { low: "ugly", high: "pretty", frame: 16, req: true, prob: 1.5 },
    humor: { low: "serious", high: "funny", frame: 17, prob: 0.66 }, // ??
    taste: { low: "disgusting", high: "delicious", frame: 18, req: true, prob: 1.5 },
    cleanliness: { low: "dirty", high: "clean", frame: 19 },
    age: { low: "young", high: "old", frame: 20, prob: 1.5 },
    fright: { low: "comfortable", high: "scary", frame: 21 },
    price: { low: "cheap", high: "expensive", frame: 21, req: true, prob: 2 },
    likeability: { low: "disliked", high: "liked", frame: 22 },
    health: { low: "sick", high: "healthy", frame: 23 }, // ??
    speed: { low: "slow", high: "fast", frame: 24, req: true, prob: 1.5 },
    girth: { low: "skinny", high: "fat", frame: 25, prob: 0.66 },
    environment: { low: "inside", high: "outside", frame: 26, req: true, prob: 1.5 },
    legality: { low: "illegal", high: "legal", frame: 27, prob: 0.66 }, // ??
    wealth: { low: "poor", high: "rich", frame: 28 },
    openness: { low: "closed", high: "open", frame: 29, prob: 0.5 }, // ??
    relevance: { low: "useless", high: "crucial", frame: 30, req: true, prob: 2 }, // ??
    space: { low: "spaceous", high: "crowded", frame: 31 },
    skill: { low: "incapable", high: "capable", frame: 32, prob: 0.5 },
    expertise: { low: "amateur", high: "professional", frame: 32, prob: 0.5 }, // ??
    entertainment: { low: "boring", high: "interesting", frame: 33, prob: 1.5 }, // boring-amusing?
    popularity: { low: "unknown", high: "well-known", frame: 34, req: true, prob: 2.5 },
    frequency: { low: "rare", high: "common", frame: 35, req: true, prob: 2 }, // scarce-plentiful?
    sweetness: { low: "bitter", high: "sweet", frame: 36, prob: 0.5 },
    safety: { low: "unsafe", high: "safe", frame: 37 },
    elegance: { low: "awkward", high: "graceful", frame: 38, prob: 0.75 }, // ??
    clarity: { low: "obscure", high: "apparent", frame: 39 }, // ??
    ego: { low: "arrogant", high: "humble", frame: 40, prob: 0.25 }, // ??
    cover: { low: "bare", high: "covered", frame: 41, prob: 0.25 }, // revealed-hidden?
    energy: { low: "curse", high: "blessing", frame: 42, req: true, prob: 1.75 },
    weather: { low: "calm", high: "windy", frame: 43, prob: 0.25 }, // ?? chilly-warm?
    emotion: { low: "sad", high: "cheerful", frame: 44, prob: 0.5 },
    simplicity: { low: "simple", high: "complex", frame: 45, req: true, prob: 2 },
    sanity: { low: "crazy", high: "sane", frame: 46, prob: 1.25 }, // ??
    kindness: { low: "cruel", high: "kind", frame: 47 },
    care: { low: "careless", high: "careful", frame: 48, prob: 0.66 }, // ??
    damage: { low: "damaged", high: "whole", frame: 49, prob: 0.4 }, // broken-whole?
    wetness: { low: "dry", high: "wet", frame: 50, req: true }, // rough-slick
    fill: { low: "empty", high: "full", frame: 51, prob: 0.75 },
    truth: { low: "fiction", high: "fact", frame: 52, req: true, prob: 1.5 }, // fake-real / sincere-insincere
    fashion: { low: "outdated", high: "modern", frame: 53, req: true, prob: 1.5 }, // old-fashioned vs fashionable
    rigidity: { low: "flabby", high: "firm", frame: 54, prob: 0.66 },
    float: { low: "float", high: "sink", frame: 55, prob: 0.25 }, // ??
    freedom: { low: "restricted", high: "free", frame: 56, prob: 0.5 }, // lenient-strict
    roughness: { low: "gentle", high: "rough", frame: 57, prob: 0.75 }, // smooth-rough / mild-rough
    religion: { low: "hell", high: "heaven", frame: 58, req: true, prob: 1.25 },
    height: { low: "low", high: "high", frame: 59, prob: 0.75 },
    tightness: { low: "loose", high: "tight", frame: 60, prob: 0.75 },
    gender: { low: "male", high: "female", frame: 61, req: true },
    experience: { low: "nasty", high: "pleasant", frame: 62 },
    consequence: { low: "negative", high: "positive", frame: 63 },
    function: { low: "part", high: "standalone", frame: 64, prob: 1.25 }, // part-whole
    time: { low: "temporary", high: "permanent", frame: 65, req: true, prob: 1.5 },
    chaos: { low: "unpredictable", high: "predictable", frame: 66, prob: 1.33 }, // unsurprising-surprising
    outcome: { low: "success", high: "failure", frame: 67, prob: 0.75 },
    control: { low: "wild", high: "tame", frame: 68, prob: 0.5 }, // ??
    perception: { low: "terrible", high: "wonderful", frame: 69, prob: 0.5 },
    opacity: { low: "transparent", high: "opaque", frame: 70, prob: 0.75 }, // ??
    specificity: { low: "vague", high: "specific", frame: 71, req: true, prob: 1.5 }, // vague-definite / vague-concrete
    trait: { low: "vice", high: "virtue", frame: 72, req: true, prob: 1.75 },
    visibility: { low: "invisible", high: "visible", frame: 73, prob: 0.5 }, // ??
    pain: { low: "painless", high: "painful", frame: 74, req: true, prob: 1.5 }, // pleasant-sore
    fairness: { low: "unfair", high: "fair", frame: 75 }, // ??
    class: { low: "rough", high: "refined", frame: 76, prob: 0.75 }, // coarse-classy / indelicate-delicate
    friendliness: { low: "unfriendly", high: "friendly", frame: 77, prob: 0.66 }, // annoying-nice
}

export const SLIDERS:Record<string, any> = 
{
    property: { subTypes: PROPERTIES, prob: 5, needsMeter: true },
    words: { subTypes: {}, prob: 3, max: 10, actionsForbidden: true },
    shapes: { subTypes: {}, prob: 2, max: 7, actionsForbidden: true },
    color: { subTypes: {}, prob: 1, max: 4, needsMeter: true },
}

export const RANDOM_SHAPE_LIST = 
{
    circle: new Circle(),
    rect: new Rectangle(),
    triangle: new Polygon({ corners: 3 }),
    pentagon: new Polygon({ corners: 5 }),
    hexagon: new Polygon({ corners: 6 }),
    octagon: new Polygon({ corners: 8 }),
    star: new Star(),
    el: new LShape(),
}