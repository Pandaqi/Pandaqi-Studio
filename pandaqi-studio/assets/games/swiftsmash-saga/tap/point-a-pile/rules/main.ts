import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import { CONFIG } from "../shared/config";
import Player from "./player";
import PointingProcess from "./pointingProcess";
import ScoreTracker from "./scoreTracker";

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numRounds: 0,
        numRoundsPerGame: 0,
        numRecursions: 0, // how many pointing cycles (to resolve ties and completely distribute cards)
        numRecursionsPerGame: 0,
        gamesWonByScoreTotal: 0,
        avgFinalScore: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numRoundsPerGame = s.numRounds / i;
    s.numRecursionsPerGame = s.numRecursions / i;
    s.numRecursionsPerRound = s.numRecursionsPerGame / s.numRoundsPerGame;
    s.gamesWonByScoreFraction = s.gamesWonByScoreTotal / i;
    s.avgFinalScorePerGame = s.avgFinalScore / i;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    const targetScore = CONFIG.rulebook.targetScore ?? 10;
    sim.stats.numPlayers += numPlayers;

    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        players.push(new Player(i));        
    }

    const allCards : Card[] = shuffle(sim.getPicker("card").get().slice());

    let continueTheRound = true;
    let counterHeadpointer = 0;
    while(continueTheRound)
    {
        // setup: create the initial piles
        const headpointer = players[counterHeadpointer];
        const cardsToDraw = (numPlayers*2);
        const pilesToMake = numPlayers;

        const cardsInitial = allCards.splice(0, cardsToDraw);
        const processInitial = new PointingProcess(cardsInitial, players, pilesToMake);

        sim.print("<b>New round!</b> Player " + (headpointer.num + 1) + " is Headpointer.");
        sim.print("The player count is " + numPlayers + ". So, they <b>draw " + cardsToDraw + " cards</b> from the deck and split those into <b>" + pilesToMake + " piles</b>.");

        // play: keep (recursively) pointing + resolving until done
        const processesToResolve = [processInitial];
        while(processesToResolve.length > 0)
        {
            sim.stats.numRecursions++;
            const pointingProcess = processesToResolve.shift();
            const newProcesses = await pointingProcess.resolve(sim);
            processesToResolve.push(...newProcesses);
        }

        sim.print("All piles are resolved. Headpointer moves to player on the left, next round!");

        // end: final resolution and setting up next round
        sim.stats.numRounds++;

        const cardsLeftInDeck = allCards.length > 0;
        let winningPlayer : Player = null;
        const scoreTracker = new ScoreTracker();
        let totalScore = 0;
        for(const player of players)
        {
            const score = player.getScore(scoreTracker);
            totalScore += score;
            if(score < targetScore) { continue; }
            winningPlayer = player;
        }

        counterHeadpointer = (counterHeadpointer + 1) % numPlayers;
        continueTheRound = !winningPlayer && cardsLeftInDeck;
        if(winningPlayer) { sim.stats.gamesWonByScoreTotal++; }
        if(sim.displaySingleTurn()) { continueTheRound = false; }

        if(!continueTheRound)
        {
            sim.stats.avgFinalScore += totalScore / numPlayers;
        }
    }
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 1000;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example round!",
    callback: generate,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { card: CardPicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        callbackInitStats,
        callbackFinishStats,
    }
})