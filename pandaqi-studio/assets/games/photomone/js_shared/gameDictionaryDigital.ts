import Color from "js/pq_games/layout/color/color";

export default {
    POINT_TYPES: {
        numLines: { frame: 0, col: new Color(284, 79, 24), expansion: "sneakySpots", prob: 4, num: { min: -5, max: 5 }, title: "Line Counter", desc: "Changes how many lines you have, by the number shown." },
        distance: { frame: 1, col: new Color(46, 100, 62), expansion: "sneakySpots", prob: 1.66, title: "Distance", desc: "You can only use points near ones you already used." },
        points: { frame: 2, col: new Color(145, 100, 61), expansion: "sneakySpots", prob: 2, num: { min: -2, max: 2 }, title: "Food Feast", desc: "Changes your food score (for this word), by the number shown." },
        stuck: { frame: 3, col: new Color(347, 83, 60), expansion: "sneakySpots", prob: 1, title: "Stuck", desc: "Immediately stop drawing." },
        fixed: { frame: 4, col: new Color(217, 100, 56), expansion: "sneakySpots", prob: 2, title: "Glued", desc: "You can't lift your finger anymore and continue somewhere else." },
        repel: { frame: 5, col: new Color(30, 13, 33), expansion: "sneakySpots", prob: 2, title: "Repel", desc: "You can't use points that already have a line." },
        eraser: { frame: 6, col: new Color(194, 100, 66), expansion: "sneakySpots", prob: 1, title: "Eraser", desc: "Immediately erases the whole canvas." },
        magiciant: { frame: 7, col: new Color(237, 77, 77), expansion: "sneakySpots", prob: 0.66, title: "Magiciant", desc: "Randomly shuffles the canvas, moving or changing points." },

        timer: { frame: 8, col: new Color(284, 79, 24), expansion: "sneakySpots", prob: 4, num: { min: -15, max: 15 }, title: "Sant Timer", desc: "Changes your timer, by the number (of seconds) shown." },
        wordeater: { frame: 9, col: new Color(46, 100, 62), expansion: "sneakySpots", prob: 4, title: "Word Eater",desc: "The next player only has two word options to choose from." },
        foodloose: { frame: 10, col: new Color(145, 100, 61), expansion: "sneakySpots", prob: 2, num: { min: -2, max: 2 }, title: "Foodloose", desc: "Changes your target food ( = what's needed to win), by the number shown." },
        wolverine: { frame: 11, col: new Color(347, 83, 60), expansion: "sneakySpots", prob: 1.25, title: "Wolverine", desc: "Any points used for your drawing, will be removed from the board." },

        //TODO1: { frame: 12, col: new Color(217, 100, 56), expansion: "sneakySpots", prob: 2 },
        //TODO2: { frame: 13, col: new Color(30, 13, 33), expansion: "sneakySpots", prob: 2 },
        //TODO3: { frame: 14, col: new Color(194, 100, 66), expansion: "sneakySpots", prob: 1 },

        // this one repeats the red color (ignoring the second purple), because red is by far the best color for this powerup, and we already have way too much purple
        poisonTrail: { frame: 15, col: new Color(347, 83, 60), expansion: "sneakySpots", prob: 2.0, title: "Poison Trail", desc: "Your lines cannot go through / cross existing lines." },
    },

    TUTORIAL_PARAMS: {
        maxTurns: 4,
        screens: {
            pick: "<p>Pick one of these words.</p><p><img src='/photomone/assets/icon_lines.webp' /> says how many lines you may draw.</p><p><img src='/photomone/assets/icon_points.webp' /> says how much food you score if the word is guessed.</p>",
            draw: "<p>Draw lines between points to communicate your word! The other players must guess the word.</p><p>If you hear the right guess, tap the timer bar.</p><p>Otherwise, if the timer runs out, you've lost this round and score no points.</p>"
        }
    }
}