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
    high:string
}

// @TODO: come up with way more properties
const PROPERTIES:Record<string, PropertyData> =
{
    temperature: { low: "cold", high: "hot" },
    weight: { low: "heavy", high: "light" },
    size: { low: "tiny", high: "huge" },
}

const SLIDERS:Record<string, any> = 
{
    property: { subTypes: PROPERTIES, prob: 5, needsMeter: true },
    words: { subTypes: {}, prob: 3, max: 10, actionsForbidden: true },
    shapes: { subTypes: {}, prob: 2, max: 7, actionsForbidden: true },
    color: { subTypes: {}, prob: 1, max: 4, needsMeter: true },
}



export {
    ACTIONS,
    SLIDERS,
    PROPERTIES
}