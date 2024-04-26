import { KEEBBLE_LETTER_VALUES, KEEBBLE_TYPES } from "games/keebble-games/js_shared/dict";

export default 
{
    GAME:null, // will contain reference to active game; ugly but I saw no other way while converting to TypeScript

    debugging: false, // @DEBUGGING (should be false)
    gameURL: "/keebble-games/spell/keebble-knickknack/game.html",
    playerSaveKey: "keebbleKnickknackSavedPlayers",
    debugPlayers: ["Harry", "Sally", "John", "Beatrice"],
    debugGameover: false,
    predeterminedPlayers: null,
    maxSpecialCells: 0,
    numLeftoverOptions: 1,
    numTiles: 8*8,
    pointsForPickingPowerup: 2,
    maxPowerups: 4,
    absoluteMaxRounds: 20,
    endGameTileBuffer: 8,
    minLettersForDestroyOption: 5,
    minLettersForWalls: 2,
    enhancedLetterProbForPowerup: 4.0,
    minEmptySpacesForCellOption: 8,
    scrabbleScores: KEEBBLE_LETTER_VALUES,
    cellTypes: KEEBBLE_TYPES,

    maxPlayers: 10,
    maxNameLength: 10,

    addSpecialLetters: true,
    exclamationMarkProb: 0.33,
    questionMarkProb: 0.33,

    expansions: {
        poignantPowerups: false,
        beefyBackpacks: false
    }
};