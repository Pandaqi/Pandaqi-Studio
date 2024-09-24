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
    "%identifier%": [Object.values(ColorType), Object.values(ShapeType)].flat(),
    "%property%": ["color", "shape"],
    "%properties%": ["colors", "shapes"],
    "%freq%": ["least", "most"],
    "%numlow%": [2,2,3], // this is a trick to make the 2 more likely + allow dynamically replacing this more times than just 2 (after which the array would otherwise be empty)
    "%num%": [2,3,4],
    "%numhigh%": [5,6,7],
    "%numveryhigh": [9,10,11,12],
    "%compare%": ["different", "identical"],
    "%compareStrict%": ["the exact same", "none of the"],
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
    freq: { frame: 0, desc: "The card has the <b>%property%</b> that appears <b>%freq% often</b>.", prob: 2.5 }, // "The card has the icon that appears least often"
    variety: { frame: 1, desc: "The card has <b>%num% %compare% %properties%.</b>" }, // "The card has 2 different colors."
    neighbors: { frame: 2, desc: "The card has <b>%compareStrict% %properties%</b> as its <b>neighbors</b>" }, // "The card has the exact same icons as one of its neighbors." => ??
    number: { frame: 3, desc: "The card has a <b>number %compareNumber% %num%</b>." }, // "The card has a number less than 3."
    number_adjacent: { frame: 4, desc: "The card has the <b>same number</b> as one of its <b>neighbors</b>.", prob: 0.25 },
    rules: { frame: 5, desc: "The card is a <b>Rules Card</b>.", prob: 0.25 },
    rules_adjacent: { frame: 6, desc: "The card is <b>next</b> to a <b>Rules Card</b>.", prob: 0.25 },
    duplicates: { frame: 7, desc: "The card has %invert% double %properties%." }, // "The card has no double shapes."
}

const FINISH_REQUIREMENTS:Record<string, GeneralData> =
{
    specific_cards: { frame: 0, desc: "You need %numhigh% cards showing (at least) one %identifier%" }, // "You need 5 cards showing (at least) one Blue."
    specific_individual: { frame: 1, desc: "You need %numhigh% %identifier% icons." }, // "You need 5 Blue icons."
    num_cards: { frame: 2, desc: "You need %numveryhigh% cards.", prob: 0.5 },
    num_cards_cond: { frame: 3, desc: "You need %numhigh% cards and none shares a %property% with a neighbor.", prob: 0.75 },
    pairs: { frame: 4, desc: "You need every %property% in the game at least %numlow% times." }, // "You need every color in the game at least 2 times."
    variety_cards: { frame: 5, desc: "You need %numhigh% cards without any two cards having exactly matching %properties%." },
    specific_double: { frame: 6, desc: "You need %num% %identifier% icons and %num% %identifier% icons.", prob: 0.66 },
    specific_triple: { frame: 7, desc: "You need %numlow% %identifier% icons, %numlow% %identifier% icons and %numlow% %identifier% icons.", prob: 0.33 }
}

const MISC:Record<string, GeneralData> =
{

}

export {
    CardType,
    CardDisplayType,
    ColorType,
    ShapeType,
    MISC,
    RULE_CARDS,
    FINISH_REQUIREMENTS,
    DYNAMIC_STRINGS,
};