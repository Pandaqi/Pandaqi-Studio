import Players from "./players"
import Header from "./header"
import Score from "./score"
import GameOver from "./gameOver"
import Options from "./options"
import Instructions from "./instructions"
import Powerups from "./powerups"
import Backpacks from "./backpacks"
import { KEEBBLE_TYPES, KEEBBLE_LETTER_VALUES } from "games/keebble/js_shared/gameDictionary"

export default class Game {
    constructor()
    {
        this.phases = ["setup", "game", "gameover"];
        this.phase = -1;
        this.round = -1;
        this.roundGameOver = Infinity;
        this.lettersPlaced = 0;
        this.cellsPlaced = 0;
        this.protectAgainstLeaving();
    }

    protectAgainstLeaving()
    {
        window.onbeforeunload = (ev) => {
            if(this.getPhase() != "game") { return undefined; }
            return "You're about to exit this game, losing all progress. Are you sure?";
        };
    }

    start(playerNames = [])
    {
        this.generateConfig(playerNames);
        this.gotoNextPhase();
    }

    destroy()
    {
        this.gameover.destroyHTML();
    }

    generateConfig(playerNames)
    {
        let cfg = {
            debugging: false, // @DEBUGGING (should be false)
            debugPlayers: ["Harry", "Sally", "John", "Beatrice"],
            debugGameover: false,
            predeterminedPlayers: playerNames,
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

            addSpecialLetters: true,
            exclamationMarkProb: 0.33,
            questionMarkProb: 0.33
        };

        cfg.maxSpecialCells = 0.66*cfg.numTiles;

        let userConfig = JSON.parse(window.localStorage.keebbleKnickKnackConfig);
        Object.assign(cfg, userConfig);

        this.cfg = cfg;
        console.log(this.cfg);
    }

    getConfig()
    {
        return this.cfg;
    }

    getPhase()
    {
        return this.phases[this.phase];
    }

    gotoNextPhase()
    {
        this.phase += 1;

        const curPhase = this.getPhase();
        if(curPhase == "setup")
        {
            this.players = new Players(this);
            this.players.checkInstantStart();
            return;
        }

        if(curPhase == "game")
        {
            this.powerups = new Powerups(this);

            this.header = new Header(this);
            this.score = new Score(this);
            this.backpacks = new Backpacks(this);

            this.options = new Options(this);
            this.instructions = new Instructions(this);

            this.gotoNextRound();
            this.options.checkInstantGameOver();
            return;
        }

        if(curPhase == "gameover")
        {
            if(this.powerups) { this.powerups.destroyHTML(); }
            if(this.backpacks) { this.backpacks.destroyHTML(); }

            this.gameover = new GameOver(this);

            this.score.destroyHTML();
            this.header.destroyHTML();
            this.options.destroyHTML();
            this.instructions.destroyHTML();
        }
    }

    gotoWaitOnPlayer(option)
    {
        this.instructions.waitOnOption(option);
    }

    gotoNextTurn()
    {
        this.options.show();
        this.instructions.hide();

        const optionsExhausted = this.options.count() <= this.cfg.numLeftoverOptions;
        if(optionsExhausted)
        {
            this.gotoNextRound();
            return;
        }

        this.players.nextTurn();
    }

    gotoNextRound()
    {
        this.round += 1;

        const isGameOver = this.round >= this.roundGameOver;
        if(isGameOver)
        {
            this.gotoNextPhase();
            return;
        }

        this.recalculateGameOverRound();

        this.players.nextRound();
        this.options.nextRound();
        this.header.nextRound();
    }

    registerLettersPlaced(num)
    {
        this.lettersPlaced += num;
    }

    registerSpecialCellsPlaced(num)
    {
        this.cellsPlaced += num;
    }

    getNumLettersPlaced()
    {
        return this.lettersPlaced;
    }

    getNumEmptySpaces()
    {
        return this.cfg.numTiles - this.lettersPlaced;
    }

    getNumCellsPlaced()
    {
        return this.cellsPlaced;
    }

    recalculateGameOverRound()
    {
        if(this.round <= 0) { return; }

        const cfg = this.getConfig();
        const spacesLeftOver = this.getNumEmptySpaces() - cfg.endGameTileBuffer;
        const avgLettersPerRound = (this.lettersPlaced / this.round);
        const roundsLeft = Math.floor( spacesLeftOver / Math.ceil(avgLettersPerRound) );
        
        const predictedRound = (this.round + roundsLeft);
        const maxRound = cfg.absoluteMaxRounds;

        this.roundGameOver = Math.min(predictedRound, maxRound);
    }

    isLastRound()
    {
        return this.round >= (this.roundGameOver - 1);
    }

    playPopup(node)
    {
        node.classList.remove("popUp");
        void node.offsetWidth; // forces a reflow and thus animation update
        node.classList.add("popUp");
    }

    getLetterScore(letter)
    {
        const letterDoesntExist = !this.options.letterDictionary[letter];
        if(letterDoesntExist)
        {
            if(letter == "!") { return 0; }
            if(letter == "?") { return Math.floor(Math.random()*4) + 1; }
            return 0;
        }

        return this.options.letterDictionary[letter].score || 0;
    }
}