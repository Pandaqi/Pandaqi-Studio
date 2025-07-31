export const PHOTOMONE_TOKENS = 
{
    team0: { frame: 0, desc: "To mark tiles for team RED." },
    team1: { frame: 1, desc: "To mark tiles for team BLUE." },
    team2: { frame: 2, desc: "To mark tiles for team PURPLE." },
    team3: { frame: 3, desc: "To mark tiles for team GREEN." },
    antsassin: { frame: 4, desc: "If picked, you immediately lose the game." },
    neutral: { frame: 5, desc: "To mark tiles that don't belong to any team." },
    // frame 6 and 7?
}

export const ALMOST_ACTIONS = 
{
    spy: { frame: 0, desc: "Point at two tiles that don't belong to you. (So not your secret tile or a matching almost tile.)", prob: 2.0 },
    double: { frame: 1, desc: "Immediately give another clue.", prob: 2.0 },
    antsassin: { frame: 2, desc: "Give a clue about where antsassins are.", prob: 2.0 },
    secret: { frame: 3, desc: "Give a clue about where secret tiles are. (As opposed to te regular rule, a clue about where it is NOT.", prob: 2.0 },
    rotate: { frame: 4, desc: "Rotate 2 tiles. You can't pick your secret tile(s).", prob: 1.0 },
    swap: { frame: 5, desc: "Swap 2 tiles with new ones from the pile. You can't pick your secret tile(s).", prob: 1.0 }, // @TODO: or swap them within the board??
    hint: { frame: 6, desc: "Tap a tile. All other teams must state its type: team, almost, assassin, or otherwise.", prob: 0.66 },
    retry: { frame: 7, desc: "Swap your code card for a new one", prob: 0.25 }
}