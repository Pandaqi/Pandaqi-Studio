import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "./config";

enum CardType
{
    REGULAR = "regular",
    SPECIAL = "special",
}

enum Shape
{
    TRIANGLE = "triangle",
    RECTANGLE = "rectangle",
    CIRCLE = "circle",
    STAR = "star",
}

enum Color
{
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    PURPLE = "purple"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    prob?: number,
}

const SPECIAL_ACTIONS:Record<string, GeneralData> = 
{
    ignore_color: { frame: 0, desc: "Ignore any %color% cards." },
    ignore_shape: { frame: 1, desc: "Ignore any %shape% cards." },
    ignore_num: { frame: 2, desc: "Ignore any card with number %number%." },
    change_num: { frame: 3, desc: "Add +%change% to every %identifier% card.", prob: 0.75 },
    penalty_lose: { frame: 4, desc: "If you tap a non-winning card, you lose 1 of your cards won." },
    penalty_hand: { frame: 5, desc: "If you tap a non-winning card, you lose 1 hand card." },
    penalty_skip: { frame: 6, desc: "If you tap a non-winning card, you must skip next round.", prob: 0.5 },
    shapeshift: { frame: 7, desc: "All %shape% become %shape% instead.", prob: 0.25 }, // these cards are really hard
    numbershift: { frame: 8, desc: "All %number%s become %number%s instead.", prob: 0.25 },
    colorshift: { frame: 9, desc: "All %color% cards become %color% instead.", prob: 0.25 }
}

const DYNAMIC_STRINGS = 
{
    "%color%": Object.values(Color).map((x) => x.toUpperCase()),
    "%shape%": Object.values(Shape).map((x) => x.toUpperCase()),
    "%number%": CONFIG.generation.numberBounds.asList(),
    "%change%": [1,2,3],
    "%identifier%": [Object.values(Color), Object.values(Shape)].flat().map((x) => x.toUpperCase())
}

const MISC:Record<string, GeneralData> =
{
    [Shape.TRIANGLE]: { frame: 0 },
    [Shape.RECTANGLE]: { frame: 1 },
    [Shape.CIRCLE]: { frame: 2 },
    [Shape.STAR]: { frame: 3 },
    action: { frame: 4 },
    arrow: { frame: 5 }
}

const POSITIONS =
[
    new Point(0, 0), new Point(0.33, 0), new Point(0.66, 0), new Point(1, 0),
    new Point(0, 0.25), new Point(0.33, 0.25), new Point(0.66, 0.25), new Point(1, 0.25),
    new Point(0, 0.5), new Point(0.33, 0.5), new Point(0.66, 0.5), new Point(1, 0.5),
    new Point(0, 0.75), new Point(0.33, 0.75), new Point(0.66, 0.75), new Point(1, 0.75),
    new Point(0, 1), new Point(0.33, 1), new Point(0.66, 1), new Point(1, 1),
]

const COLORS =
{
    [Color.RED]: { hex: "#eb5d5d" },
    [Color.BLUE]: { hex: "#78daef" },
    [Color.GREEN]: { hex: "#97d72d" },
    [Color.PURPLE]: { hex: "#cd8aff" },
}

export {
    CardType,
    Shape,
    Color,
    MISC,
    SPECIAL_ACTIONS,
    DYNAMIC_STRINGS,
    POSITIONS,
    COLORS
};