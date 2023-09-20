interface ActionData
{
    frame: number,
    prob?: number
}

// @TODO: invent actions and fill them in here
const ACTIONS:Record<string, ActionData> = 
{
    lala: { frame: 0 }
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
    property: PROPERTIES,
    words: {},
    shapes: {},
    color: {},
}



export {
    ACTIONS,
    SLIDERS,
    PROPERTIES
}