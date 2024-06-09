import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import TilePicker from "../js_game/tilePicker";
import CONFIG from "../js_shared/config";
import Board, { GameState } from "./board";
import Hand from "./hand";
import Tile from "../js_game/tile";
import { ACTIONS, GeneralData, PAWNS } from "../js_shared/dict";
import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";

const callbackInitStats = () =>
{
    return {
        numRounds: 0, // total number of rounds/turns played
        numRoundsDist: {}, // the spread of how often each specific #rounds was attained
        numDeckResets: 0, // how often the tile deck ran out

        actionDist: {}, // how often each action was taken

        numTimesBlocked: 0, // how often one (or both) of your paths was blocked by another pawn
        numTimesBlockedFully: 0, // how often you had to stop your path because it was entirely blocked by other pawns
        numTimesHandEmpty: 0, // how often you could not play any card on your turn because of an empty hand
        pathLengthTheory: 0, // total length you'd travel if nothing could block/stop/reset you
        pathLengthPractice: 0, // total length traveled through waterfall
        numResets: 0, // how often a pawn exited the waterfall below (and reset to the top)

        score: 0, // total winning scores
        scoreDist: {}, // distributions of winning scores    
        
        numWantedScoreButNoMatch: 0,
        numWantedAddButNoTiles: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const iters = sim.getIterations();
    const rounds = sim.stats.numRounds; // = #turns as well

    sim.stats.numRoundsPerGame  = rounds / iters;
    sim.stats.numTimesBlockedPerGame = sim.stats.numTimesBlocked / iters;
    sim.stats.numTimesBlockedFullyPerGame = sim.stats.numTimesBlockedFully / iters;
    
    sim.stats.avgWinningScore = sim.stats.score / iters;

    sim.stats.avgPathLengthTheoryPerTurn = sim.stats.pathLengthTheory / rounds;
    sim.stats.avgPathLengthPracticePerTurn = sim.stats.pathLengthPractice / rounds;
    sim.stats.avgResetsPerTurn = sim.stats.numResets / rounds;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayers.randomInteger();
    const numStartTiles = CONFIG.rulebook.numStartingTiles;

    // prepare board + deck
    const allTiles : Tile[] = shuffle(sim.getPicker("tile").get().slice());
    const allTilesDiscard : Tile[] = [];

    let startingTile = null;
    for(let i = allTiles.length - 1; i >= 0; i--)
    {
        const tile = allTiles[i];
        if(tile.keyAction == "add" && !startingTile)
        {
            startingTile = tile;
            allTiles.splice(i, 1);
        }

        if(tile.type == "pawn")
        {
            allTiles.splice(i,1);
        }
    }

    const board = new Board();
    board.create(startingTile, numPlayers);

    // create starting hands
    const players : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Hand();
        const startTiles = allTiles.splice(0, numStartTiles);
        p.addTiles(startTiles);
        players.push(p);
    }

    const gameState:GameState = {
        curPlayer: null, allTiles, allTilesDiscard, sim,
        playerIndex: -1, players
    }

    // for the example, pre-generate a few random turns
    if(!sim.isHeadless())
    {
        const numTurnsAhead = CONFIG.rulebook.numTurnsPreGenerate.randomInteger();
        for(let i = 0; i < numTurnsAhead; i++)
        {
            const playerIndex = i % numPlayers;
            gameState.curPlayer = players[playerIndex];
            gameState.playerIndex = playerIndex;
            await board.executeTurn(gameState, true);
        }
    }

    const MAX_ROUNDS = 100;

    let continueGame = true;
    let counter = 0;
    let numRounds = 0;
    while(continueGame)
    {
        const curPlayer = players[counter];
        gameState.curPlayer = curPlayer;
        gameState.playerIndex = counter;
        counter = (counter + 1) % numPlayers;
        numRounds++;

        // tell user the state of things
        sim.print("The <strong>waterfall</strong> looks like this. You are the " + PAWNS[gameState.playerIndex].label + " pawn</strong>.");
        await sim.listImages(board, "draw"); // @TODO: also draw the PAWNS on this one

        if(curPlayer.count() > 0) {
            sim.print("You have these tiles in your hand.");
            await sim.listImages(curPlayer, "draw");                
        } else {
            sim.print("You have <strong>no tiles</strong> in your hand.");
        }

        // make sure our deck is fine
        if(allTiles.length <= 3)
        {
            allTiles.push(...allTilesDiscard);
            allTilesDiscard.length = 0;
            shuffle(allTiles);
            sim.stats.numDeckResets++;
        }

        // execute the actual move
        await board.executeTurn(gameState);

        // check if game should end (and who'd win then)
        const maxWaterfallSize = CONFIG.rulebook.maxWaterfallSizeForWin ?? 15;
        continueGame = true;
        if(board.count() >= maxWaterfallSize) {
            sim.print("The waterfall now has <strong>" + maxWaterfallSize + "(+) tiles</strong>. The <strong>game is over</strong>, highest score wins!");
            continueGame = false;
        } else if(allTiles.length <= 0 && CONFIG.rulebook.endGameIfDeckEmpty) {
            sim.print("All tiles have been used. (Both deck and discard are empty.) The <strong> game is over</b>, highest score wins!");
            continueGame = false;
        } else {
            sim.print("The waterfall now has <strong>" + board.count() + " tiles</strong>. You have <strong>" + curPlayer.count() + " tiles</strong> in your hand. Next turn!");
        }

        if(sim.displaySingleTurn()) { continueGame = false; }
        if(numRounds >= MAX_ROUNDS) { continueGame = false; }
    }

    // @DEBUGGING
    if(numRounds >= MAX_ROUNDS)
    {
        console.log("== BAD ROUND (" + numRounds + " rounds) ==");
        console.log(players);
        console.log(board);
    }

    // determine winning score and final stats
    let winningScore = -Infinity;
    for(const player of players)
    {
        const score = player.getScore();
        winningScore = Math.max(winningScore, score);
    }

    sim.stats.score += winningScore;
    if(!sim.stats.scoreDist[winningScore]) { sim.stats.scoreDist[winningScore] = 0; }
    sim.stats.scoreDist[winningScore]++;

    sim.stats.numRounds += numRounds;
    if(!sim.stats.numRoundsDist[numRounds]) { sim.stats.numRoundsDist[numRounds] = 0; }
    sim.stats.numRoundsDist[numRounds]++;
    
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 5000;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example turn!",
    callback: generate,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { tile: TilePicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        showFullGame: SHOW_FULL_GAME,
        runParallel: false,
        callbackInitStats,
        callbackFinishStats,
    }
})


// auto-display all requirement options and descriptions inside rulebook
const rtConversion = { heading: "label", desc: "desc" };
const rtParams = { sheetURL: CONFIG.assets.actions.path, base: CONFIG.assetsBase, sheetWidth: 8, class: null };
const nodeBase = convertDictToRulesTableHTML(ACTIONS, rtConversion, rtParams);
document.getElementById("rules-table-actions").appendChild(nodeBase);

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }