import Point from "js/pq_games/tools/geometry/point"

enum CardType
{
    REGULAR = "regular",
    RULE = "rule",
}

enum CardDisplayType
{
    SYMBOLS = "symbols", // 2 squares = simply displays two square icons
    NUMBER = "number", // displays a NUMBER x SHAPE
    INVERT = "invert", // shows all shapes it's NOT with a CROSS through them => very hard, limit this
    COPY = "copy", // points at left/right neighbor and becomes whatever they are
    HAND = "hand", // number is shown by how many fingers the hand displays
    DICE = "dice", // number is shown by a die face
    ROMAN = "roman", // number is shown by roman numerals
}

enum ShapeType
{
    RECTANGLE = "rectangle",
    TRIANGLE = "triangle",
    CIRCLE = "circle",
    STAR = "star"
}

enum ColorType
{
    RED = "red",
    GREEN = "green",
    BLUE = "blue",
    PURPLE = "purple"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    prob?: number,
}

const DYNAMIC_STRINGS:Record<string,any[]> =
{
    "%identifier%": [Object.values(ColorType), Object.values(ShapeType)].flat().map((x) => x.toUpperCase()),
    "%property%": ["color", "shape"],
    "%properties%": ["colors", "shapes"],
    "%freq%": ["least", "most"],
    "%numlow%": [2,2,3], // this is a trick to make the 2 more likely + allow dynamically replacing this more times than just 2 (after which the array would otherwise be empty)
    "%num%": [2,3,4],
    "%numhigh%": [5,6],
    "%numveryhigh%": [7,8,9],
    "%compare%": ["different", "identical"],
    "%compareStrict%": ["the exact same", "none of the same"],
    "%compareNumber%": ["less than", "greater than"],
    "%invert%": ["some", "no"]
}

/*
EXAMPLE RULES CARDS.
* "Correct = has three different shapes"
* "Correct = has exact same shapes/colors as neighbors"

EXAMPLE FINISH REQUIREMENT.
* "Finish = 3xBlue, 5xTriangle"
* "Finish = 8 cards, and none shares a shape AND color with a neighbor."
*/

const RULE_CARDS:Record<string, GeneralData> =
{
    freq: { frame: 0, desc: "The card has the <b><i>%property%</i></b> that appears <b><i>%freq% often</i></b>.", prob: 2.5 }, // "The card has the color/shape that appears least often"
    variety: { frame: 1, desc: "The card has <b><i>%num% %compare% %properties%.</i></b>" }, // "The card has 2 different colors."
    neighbors: { frame: 2, desc: "The card has <b><i>%compareStrict% %properties%</i></b> as one of its <b><i>neighbors</i></b>" }, // "The card has the exact same icons as one of its neighbors."
    number: { frame: 3, desc: "The card has a <b><i>number %compareNumber% %num%</i></b>." }, // "The card has a number less than 3."
    number_adjacent: { frame: 4, desc: "The card has the <b><i>same number</i></b> as one of its <b><i>neighbors</i></b>.", prob: 0.25 },
    rules: { frame: 5, desc: "The card is a <b><i>Rule Card</i></b>.", prob: 0.25 },
    rules_adjacent: { frame: 6, desc: "The card is <b><i>next</i></b> to a <b><i>Rule Card</i></b>.", prob: 0.25 },
    duplicates: { frame: 7, desc: "The card has <b><i>%invert% double %properties%</i></b>." }, // "The card has no double shapes."
}

const FINISH_REQUIREMENTS:Record<string, GeneralData> =
{
    specific_cards: { frame: 0, desc: "You need <b><i>%numhigh% cards</i></b> showing (at least) <b><i>1 %identifier%</i></b>" }, // "You need 5 cards showing (at least) one Blue."
    specific_individual: { frame: 1, desc: "You need <b><i>%numhigh% %identifier%</i></b>." }, // "You need 5 Blue icons."
    num_cards: { frame: 2, desc: "You need <b><i>%numveryhigh% cards</i></b>.", prob: 0.5 },
    num_cards_cond: { frame: 3, desc: "You need <b><i>%numhigh% cards</i></b> and <b><i>none shares a %property%</i></b> with a neighbor.", prob: 0.75 },
    pairs: { frame: 4, desc: "You need <b><i>every %property%</i></b> in the game at least <b><i>%numlow% times</i></b>." }, // "You need every color in the game at least 2 times."
    variety_cards: { frame: 5, desc: "You need <b><i>%numhigh% cards without</i></b> any two cards having 100% <b><i>matching %properties%</i></b>." },
    specific_double: { frame: 6, desc: "You need <b><i>%num% %identifier%</i></b> and <b><i>%num% %identifier%</i></b>.", prob: 0.66 },
    specific_triple: { frame: 7, desc: "You need <b><i>%numlow% %identifier%</i></b>, <b><i>%numlow% %identifier%</i></b> and <b><i>%numlow% %identifier%</i></b>.", prob: 0.33 }
}

const MISC:Record<string, GeneralData> =
{
    [ShapeType.RECTANGLE]: { frame: 0 },
    [ShapeType.TRIANGLE]: { frame: 1 },
    [ShapeType.CIRCLE]: { frame: 2 },
    [ShapeType.STAR]: { frame: 3 },
    hand_display: { frame: 4 },
    dice_display: { frame: 9 }
}

const COLORS =
{
    [ColorType.RED]: { hex: "#fa3f3f" },
    [ColorType.GREEN]: { hex: "#63ca2b" },
    [ColorType.BLUE]: { hex: "#3faffa" },
    [ColorType.PURPLE]: { hex: "#a459e1" },
}

const POSITIONS =
[
    new Point(0, 0), new Point(0.5, 0), new Point(1, 0),
    new Point(0, 0.5), new Point(0.5, 0.5), new Point(1, 0.5),
    new Point(0, 1), new Point(0.5, 1), new Point(1, 1),
]

export {
    CardType,
    CardDisplayType,
    ColorType,
    ShapeType,
    MISC,
    RULE_CARDS,
    FINISH_REQUIREMENTS,
    DYNAMIC_STRINGS,
    COLORS,
    POSITIONS
};