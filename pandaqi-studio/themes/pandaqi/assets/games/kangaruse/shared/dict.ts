
import { Vector2 } from "lib/pq-games"
import { CONFIG } from "../board/config"

// This is an easy reminder/link what every frame stands for in the general spritesheet
export const GENERAL = {
    "dir": { frame: 0 },
    "writingSpace": { frame: 1 },
    "tutorialIcon": { frame: 2 },
    "header": { frame: 3 }
}

export const CELLS = {
    "tree": { frame: 0, desc: "Can't jump on or over it.", unpickable: true, colorGroup: "green" },
    "starting_position": { frame: 1, desc: "A player can start here.", unpickable: true, minAbs: CONFIG.maxNumPlayers, maxAbs: (CONFIG.maxNumPlayers + 1), colorGroup: "brown" },
    "score": { frame: 2, desc: "Scores the number of points shown.", minRel: 0.2, maxRel: 0.33, score: true, colorGroup: "yellow", prob: 1.5 },
    "kangaroo": { frame: 3, desc: "Immediately jump again.", colorGroup: "yellow", prob: 1.5 },
    "crocodile": { frame: 4, desc: "While here, nobody can score from squares in the same row or column.", colorGroup: "blue", prob: 1.25, maxRel: 0.133 },
    "echidna": { frame: 5, desc: "You can only visit if its number is higher than the previous one you visited (of this type).", colorGroup: "pink", prob: 1.5 },
    "tasmanian_devil": { frame: 6, desc: "Destroy all (unused) adjacent squares.", colorGroup: "brown" },
    "thorny_devil": { frame: 7, desc: "If this is your only valid jump, you're out of the game.", colorGroup: "green", prob: 0.75, maxRel: 0.075 },
    "tasmanian_tiger": { frame: 8, desc: "Destroy two (unused) squares in the same row or column.", colorGroup: "yellow", maxRel: 0.2 },
    "koala": { frame: 9, desc: "You can't jump OVER or NEXT TO other players.", colorGroup: "blue", prob: 1.33 },
    "platypus": { frame: 10, desc: "You may jump with any direction or number, and over trees.", colorGroup: "blue", prob: 0.75, maxRel: 0.2 },
    "sugar_glider": { frame: 11, desc: "If you jump on a used square, continue in that direction until you land on an unused square.", colorGroup: "pink", prob: 0.66 },
    "dingo": { frame: 12, desc: "While here, ALL players must obey BOTH commands of this cell (if possible).", colorGroup: "brown", prob: 1.5 },
    "mistletoebird": { frame: 13, desc: "Your jump may wrap around the board.", colorGroup: "pink", prob: 1.25 },
    "kiwi": { frame: 14, desc: "Nobody can jump OVER or NEXT TO you.", colorGroup: "green" },
    "quoll": { frame: 15, desc: "While here, NO other player may pick the direction or number from this cell.", colorGroup: "yellow", prob: 1.5 },
    "moth": { frame: 16, desc: "Fits multiple kangaroos.", maxAbs: 5, multiPosition: true, colorGroup: "pink", prob: 0.66 }, 
    "numbat": { frame: 17, desc: "If you CAN jump to a score square, you MUST do so.", colorGroup: "brown", prob: 1.25 },
    "cacketoo": { frame: 18, desc: "You CAN'T jump towards a score square.", colorGroup: "pink" },
    "frog": { frame: 19, desc: "You may jump to any other (unused) frog.", minAbs: 3, maxRel: 0.08, colorGroup: "green", prob: 1.25 },
    
    // all the other scoring types (besides regular stars)
    "water": { frame: 20, desc: "Each food is worth as many points as how much water you have.", requiredTypes: ["food"], score: true, colorGroup: "blue", minRel: 0.05 },
    "shelter": { frame: 21, desc: "Those with the least shelter at the end get -10. Those with the most shelter +10.", score: true, colorGroup: "brown", minRel: 0.1, prob: 1.25 },
    "food": { frame: 22, desc: "Each food is worth as many points as how much water you have.", requiredTypes: ["water"], score: true, colorGroup: "green", minRel: 0.05 },
    "toys": { frame: 23, desc: "Every set of 3 toys is worth 5 points. (Incomplete sets at the end are worth 0.)", score: true, colorGroup: "pink", minRel: 0.1, prob: 1.25 },
    "gems": { frame: 24, desc: "Worth 1, 1, 3, 5, 8, 12, 16, 21, 28, 35 points (based on how many you have)", score: true, colorGroup: "blue", scoreValues: [1,1,3,5,8,12,16,21,28,35], minRel: 0.075 },
    "coins": { frame: 25, desc: "Each coin is worth +1 IF you have the most coins at the end, otherwise -1.", score: true, colorGroup: "yellow", minRel: 0.15, prob: 1.5 },
    "chests": { frame: 26, desc: "Worth +5 points, but rare.", maxAbs: 5, score: true, colorGroup: "purple" }
}

export const TUTORIALS = {

}

export const NB_OFFSETS = {
    "right": new Vector2().setXY(1,0),
    "left": new Vector2().setXY(-1,0),
    "bottom": new Vector2().setXY(0,1),
    "top": new Vector2().setXY(0,-1)
}

export const CORNER_OFFSETS = {
    "bottom right": new Vector2().setXY(1,1),
    "bottom center": new Vector2().setXY(0,1),
    "bottom left": new Vector2().setXY(-1,1),
    "center left": new Vector2().setXY(-1,0),
    "center center": new Vector2().setXY(0,0),
    "center right": new Vector2().setXY(1,0),
    "top left": new Vector2().setXY(-1,-1),
    "top center": new Vector2().setXY(0,-1),
    "top right": new Vector2().setXY(1,-1),
};

export const COLOR_GROUPS = {
    "green": "#98BB45",
    "greendark": "#0D440C",
    "yellow": "#FCC038",
    "yellowdark": "#27231C",
    "brown": "#AE5F35",
    "pink": "#EF476F", // "#FFB7C3",
    "purple": "#CF0BED", // only used by treasure
    "blue": "#0EB1D2",
    "bluedark": "#7798AB",
}