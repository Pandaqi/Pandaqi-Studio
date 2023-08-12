import Color from "js/pq_games/canvas/color";

export default { 
    POINT_TYPES: {
        numLines: { frame: 0, col: new Color(284, 79, 24), expansion: "sneakySpots", prob: 4, num: { min: -6, max: 6 } },
        distance: { frame: 1, col: new Color(46, 100, 62), expansion: "sneakySpots", prob: 2 },
        points: { frame: 2, col: new Color(145, 100, 61), expansion: "sneakySpots", prob: 2, num: { min: -4, max: 4 } },
        fixed: { frame: 4, col: new Color(217, 100, 56), expansion: "sneakySpots", prob: 2 },
        repel: { frame: 5, col: new Color(30, 13, 33), expansion: "sneakySpots", prob: 1 },
        curve: { frame: 6, col: new Color(194, 100, 66), expansion: "sneakySpots", prob: 1.5 },

        // EXPANSION = action ants
        trap: { frame: 8, col: new Color(284, 79, 24), expansion: "actionAnts", prob: 1.33 },
        wings: { frame: 9, col: new Color(46, 100, 62), expansion: "actionAnts", prob: 2, num: { min: -4, max: 4 } },
        teleport: { frame: 10, col: new Color(145, 100, 61), expansion: "actionAnts", prob: 1.66 },
        poisonTrail: { frame: 11, col: new Color(347, 83, 60), expansion: "actionAnts", prob: 1.66 },

        // EXPANSION = coop colony
        leader: { frame: 12, col: new Color(217, 100, 56), expansion: "coopColony", prob: 2.5 },
        dreamdrawing: { frame: 13, col: new Color(30, 13, 33), expansion: "coopColony", prob: 1.25 },

        // EXPANSION = antertainment break
        break: { frame: 14, col: new Color(194, 100, 66), expansion: "antertainmentBreak", prob: 1.75 },
        pants: { frame: 15, col: new Color(237, 77, 77), expansion: "antertainmentBreak", prob: 1.75 },

        // EXPANSION = precise painters
        add: { frame: 7, col: new Color(237, 77, 77), expansion: "precisePainters", prob: 1.25, num: { min: 2, max: 4 } },
        remove: { frame: 3, col: new Color(347, 83, 60), expansion: "precisePainters", prob: 1.25, num: { min: 2, max: 4 } },
        solid: { frame: 16, col: new Color(284, 79, 24), expansion: "precisePainters", prob: 1 },
        eyes: { frame: 17, col: new Color(46, 100, 62), expansion: "precisePainters", prob: 2 },
        unfinished: { frame: 18, col: new Color(145, 100, 61), expansion: "precisePainters", prob: 1.33 },
        eraser: { frame: 19, col: new Color(347, 83, 60), expansion: "precisePainters", prob: 1.33, num: { min: 2, max: 6 } },
    }
}