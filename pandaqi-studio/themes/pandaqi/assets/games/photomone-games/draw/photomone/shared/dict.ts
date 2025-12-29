import { Color } from "lib/pq-games";

export const POINT_TYPES = 
{
    numLines: { frame: 0, col: new Color(284, 79, 24), expansion: "sneakySpots", prob: 4, num: { min: -6, max: 6 }, desc: "Changes your number of lines (allowed when drawing) by the number shown." },
    distance: { frame: 1, col: new Color(46, 100, 62), expansion: "sneakySpots", prob: 2, desc: "All points from your drawing must be within a certain distance of each other: the length of your thumb." },
    points: { frame: 2, col: new Color(145, 100, 61), expansion: "sneakySpots", prob: 2, num: { min: -4, max: 4 }, desc: "Changes the food you score by the number shown." },
    fixed: { frame: 4, col: new Color(217, 100, 56), expansion: "sneakySpots", prob: 2, desc: "Your drawing must be one continuous line. (No lifting the pen!)" },
    repel: { frame: 5, col: new Color(30, 13, 33), expansion: "sneakySpots", prob: 1, desc: "Your lines are allowed to <strong>curve</strong> (instead of being straight)." },
    curve: { frame: 6, col: new Color(194, 100, 66), expansion: "sneakySpots", prob: 1.5, desc: "Your drawing must only use points that have <strong>not</strong> been used already." },

    // EXPANSION = action ants
    trap: { frame: 8, col: new Color(284, 79, 24), expansion: "actionAnts", prob: 1.33, desc: "You <strong>cannot</strong> move your ant (at the end of your turn)." },
    wings: { frame: 9, col: new Color(46, 100, 62), expansion: "actionAnts", prob: 2, num: { min: -4, max: 4 }, desc: "Changes how far your ant is allowed to move (at the end of your turn), by the amount shown." },
    teleport: { frame: 10, col: new Color(145, 100, 61), expansion: "actionAnts", prob: 1.66, desc: "When moving your ant (at the end of your turn), you're allowed to move <em>anywhere</em>!" },
    poisonTrail: { frame: 11, col: new Color(347, 83, 60), expansion: "actionAnts", prob: 1.66, desc: "You are <strong>not</strong> allowed to go through ( = \"cross\") other lines." },

    // EXPANSION = coop colony
    leader: { frame: 12, col: new Color(217, 100, 56), expansion: "coopColony", prob: 2.5, desc: "The player that activated this point, must finish the entire drawing on their own." },
    dreamdrawing: { frame: 13, col: new Color(30, 13, 33), expansion: "coopColony", prob: 1.25, desc: "Even the players who <strong>don't</strong> know the word, participate in drawing one line at a time." },

    // EXPANSION = antertainment break
    break: { frame: 14, col: new Color(194, 100, 66), expansion: "antertainmentBreak", prob: 1.75, desc: "Pause your drawing immediately. (End your turn without guessing/scoring.)" },
    pants: { frame: 15, col: new Color(237, 77, 77), expansion: "antertainmentBreak", prob: 1.75, desc: "You <strong>can't</strong> pause your drawing. If it's not guessed this turn, you get -5 food." },

    // EXPANSION = precise painters
    add: { frame: 7, col: new Color(237, 77, 77), expansion: "precisePainters", prob: 1.25, num: { min: 2, max: 4 }, desc: "Add as many new Vector2s to the map (of any type) as the number shown. They can't overlap an existing line or point." },
    remove: { frame: 3, col: new Color(347, 83, 60), expansion: "precisePainters", prob: 1.25, num: { min: 2, max: 4 }, desc: "Remove as many points from the board as the number shown. (Cross them out, they're gone from now on.)" },
    solid: { frame: 16, col: new Color(284, 79, 24), expansion: "precisePainters", prob: 1, desc: "Color in a closed shape on the board. (Add scribbles, turning the area completely solid and unusable.)" },
    eyes: { frame: 17, col: new Color(46, 100, 62), expansion: "precisePainters", prob: 2, desc: "Draw one circle in <em>empty space</em> ( = \"between te lines\"). It can be any size, filled or not, but <em>can't</em> include an existing point or line." },
    unfinished: { frame: 18, col: new Color(145, 100, 61), expansion: "precisePainters", prob: 1.33, desc: "You may use any position on an existing line as the start / end point for new lines." },
    eraser: { frame: 19, col: new Color(347, 83, 60), expansion: "precisePainters", prob: 1.33, num: { min: 2, max: 6 }, desc: "Erase as many lines as the number shown <em>from your current drawing</em>. (Cross them out. They don't exist, but their two points also can't receive a new line.) If you don't have enough lines, you can't use this location." },
}