import { PackData } from "games/throneless-games/js_shared/dictShared"
import Point from "js/pq_games/tools/geometry/point"

const PACKS:Record<string, PackData> =
{
    example_template: 
    { 
        frame: 0,
        clarification: "An <strong>open</strong> round means you vote in turn. Starting from Kingseat, clockwise, everybody votes by playing their card face-up.",
        backstory: "The Lionsyre is very close friends with the king. They have access to many state secrets and can whisper their desires into the king's ear. This, however, comes at a cost: they must play nice and follow the rules. Because the king is always watching, and they don't want to fall out of grace.",
        animal: "Lion",
        colorClass: "Yellow",

        name: 
        {
            text: "Lionsyre",
        },
        
        action: 
        {
            text: "The next round is played openly."
        },

        slogan: 
        {
            text: "The sire inspires.",
        },

        dark: 
        [
            "Look at the Loyalty and Hand of the current king",
            "Reveal your Hand to the King. They pick 2 cards to add to the Tell."
        ],

        edges: 
        {
            lineScale: new Point(0.75, 0.825)
        }
    },
}

// @TODO
const SETS =
{
    starter: [],
    medium: [],
    advanced: [],
    complete: Object.keys(PACKS)
}

export
{
    PACKS,
    SETS
}