export const OPTIONS = 
{
    letter: { frame: 0, prob: 5, num: { min: 1, max: 3 }, wait: true },
    wall: { frame: 1, prob: 2.5, roundMax: 2, wait: true },
    start_player: { frame: 2.5, prob: 4, oneoff: true },
    points: { frame: 3, prob: 1.5, roundMax: 3 },
    cell: { frame: 4, prob: 3, expansion: "specialCells", num: { min: 1, max: 3 }, roundMax: 2, wait: true },
    swap: { frame: 5, prob: 1, expansion: "ominousOptions", num: { min: 1, max: 2 }, oneoff: true, wait: true, desc: "Change one letter on the board into any other one. (Cross out the original, write the new one in the cell.)" },
    destroy: { frame: 6, prob: 1, expansion: "ominousOptions", num: { min: 1, max: 2 }, roundMax: 2, wait: true, desc: "Pick a cell and cross out one part of it: <strong>owner, type, score or content</strong>. If you destroy the <em>content</em> (even in an empty cell), it can't be used anymore." },
    po_letter: { frame: 7, prob: 1.5, expansion: "poignantPowerups", powerup: true, multi: true, twopart: true, desc: "The value of a specific letter is changed (by the amount shown)." },
    po_word: { frame: 8, prob: 1, expansion: "poignantPowerups", powerup: true, twopart: true, oneoff: true, desc: "The score for each new word is changed (by the amount shown)" },
    po_straight: { frame: 9, prob: 0.75, expansion: "poignantPowerups", powerup: true, oneoff: true, desc: "If you place new letters, they must all be in the same row or column" },
    po_connect: { frame: 10, prob: 0.75, expansion: "poignantPowerups", powerup: true, oneoff: true, desc: "If you place new letters, they must all connect to existing letters" },
    po_clear: { frame: 11, prob: 1.0, expansion: "poignantPowerups", powerup: true, oneoff: true, desc: "Removes all active powerups!" },
    empty_backpack: { frame: 12, prob: 2.5, expansion: "beefyBackpacks", roundMax: 2, wait: true }    
}