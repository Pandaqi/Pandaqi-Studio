import Players from "./players"
import Header from "./header"
import Score from "./score"
import GameOver from "./gameOver"
import Options from "./options"
import Instructions from "./instructions"
import Powerups from "./powerups"
import Backpacks from "./backpacks"
import CONFIG from "./config"

export default class Game 
{
    phases: string[]
    phase: number
    round: number
    roundGameOver: number
    lettersPlaced: number
    cellsPlaced: number
    gameover: GameOver
    players: Players
    powerups: Powerups
    header: Header
    score: Score
    backpacks: Backpacks
    options: Options
    instructions: Instructions

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
        window.localStorage.removeItem(CONFIG.playerSaveKey);
        this.generateConfig(playerNames);
        this.gotoNextPhase();
    }

    restart()
    {
        window.localStorage.setItem(CONFIG.playerSaveKey, JSON.stringify(this.players.getPlayerNames()));
        window.location.href = CONFIG.gameURL;
    }

    destroy()
    {
        this.gameover.destroyHTML();
    }

    generateConfig(playerNames:string[])
    {
        let userConfig = JSON.parse(window.localStorage.keebbleKnickKnackConfig);
        Object.assign(CONFIG, userConfig);

        CONFIG.predeterminedPlayers = playerNames;
        CONFIG.maxSpecialCells = 0.66*CONFIG.numTiles;
        console.log(CONFIG);
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

        const optionsExhausted = this.options.count() <= CONFIG.numLeftoverOptions;
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
        return CONFIG.numTiles - this.lettersPlaced;
    }

    getNumCellsPlaced()
    {
        return this.cellsPlaced;
    }

    recalculateGameOverRound()
    {
        if(this.round <= 0) { return; }

        const spacesLeftOver = this.getNumEmptySpaces() - CONFIG.endGameTileBuffer;
        const avgLettersPerRound = (this.lettersPlaced / this.round);
        const roundsLeft = Math.floor( spacesLeftOver / Math.ceil(avgLettersPerRound) );
        
        const predictedRound = (this.round + roundsLeft);
        const maxRound = CONFIG.absoluteMaxRounds;

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

const gm = new Game();
CONFIG.GAME = gm;
const prevPlayers = JSON.parse(window.localStorage.getItem(CONFIG.playerSaveKey) || "{}");
gm.start(prevPlayers);