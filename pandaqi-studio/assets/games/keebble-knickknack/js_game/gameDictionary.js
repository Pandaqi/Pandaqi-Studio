const OPTIONS = 
{
    letter: { frame: 0, prob: 5, num: { min: 1, max: 3 }, wait: true },
    wall: { frame: 1, prob: 2.5, roundMax: 2, wait: true },
    start_player: { frame: 2.5, prob: 4, oneoff: true },
    points: { frame: 3, prob: 1.5, roundMax: 3 },
    cell: { frame: 4, prob: 3, expansion: "specialCells", num: { min: 1, max: 3 }, roundMax: 2, wait: true },
    swap: { frame: 5, prob: 1, expansion: "ominousOptions", num: { min: 1, max: 2 }, oneoff: true, wait: true },
    destroy: { frame: 6, prob: 1, expansion: "ominousOptions", num: { min: 1, max: 2 }, roundMax: 2, wait: true },
    po_letter: { frame: 7, prob: 1.5, expansion: "poignantPowerups", powerup: true, multi: true, twopart: true },
    po_word: { frame: 8, prob: 1, expansion: "poignantPowerups", powerup: true, twopart: true, oneoff: true },
    po_straight: { frame: 9, prob: 0.75, expansion: "poignantPowerups", powerup: true, oneoff: true },
    po_connect: { frame: 10, prob: 0.75, expansion: "poignantPowerups", powerup: true, oneoff: true },
    po_clear: { frame: 11, prob: 1.0, expansion: "poignantPowerups", powerup: true, oneoff: true },
    empty_backpack: { frame: 12, prob: 2.5, expansion: "beefyBackpacks", roundMax: 2, wait: true }    
}

export {
    OPTIONS
}