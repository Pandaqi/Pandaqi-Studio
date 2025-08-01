import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import { CONFIG } from "../shared/config";
import Guess from "./guess";
import Hand from "./hand";
import Player from "./player";

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numRounds: 0,
        numRoundsPerGame: 0,
        numTurns: 0,
        numTurnsPerGame: 0,
        numTurnsPerPlayerAvg: 0,
        challengesWonRatio: 0.0, // percentage of challenges that resulted in you winning (and the previous player being incorrect with their guess)
        guesses: { won: [], lost: [] }, // guesses that, when challenged, turned out correct VERSUS guesses that, when challenged, turned out wrong
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numRoundsPerGame = s.numRounds / i;
    s.numPlayersAvg = s.numPlayers / i;
    s.numTurnsPerGame = s.numTurns / i;
    s.numTurnsPerPlayerAvg = s.numTurnsPerGame / s.numPlayersAvg;
    s.challengesWonRatio = s.guesses.lost.length / s.numRounds;

    // extract deeper information about guesses won/lost
    s.guessNumberDist = { won: {}, lost: {} };
    s.guessTargetDist = { won: {}, lost: {} };
    s.guessCompareDist = { won: {}, lost: {} };
    for(const wonLost of Object.keys(s.guesses))
    {
        for(const guess of s.guesses[wonLost])
        {
            s.guessNumberDist[wonLost][guess.number] = (s.guessNumberDist[wonLost][guess.number] ?? 0) + 1;
            s.guessTargetDist[wonLost][guess.target] = (s.guessTargetDist[wonLost][guess.target] ?? 0) + 1;
            s.guessCompareDist[wonLost][guess.compare] = (s.guessCompareDist[wonLost][guess.compare] ?? 0) + 1;
        }
    }
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const numStartingCards = CONFIG.rulebook.numCardsPerPlayer ?? 6;
    const allCards : Card[] = shuffle(sim.getPicker("card").get().slice());

    const numDicePerPlayer = CONFIG.rulebook.numDicePerPlayer[numPlayers] ?? 3;

    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        const h = new Hand();
        h.addCards(allCards.splice(0, numStartingCards));
        p.hand = h;
        players.push(p);        
    }

    let continueTheGame = true;
    let counterRounds = 0;
    let curLiar : Player = fromArray(players);
    let losingPlayer : Player = null;

    while(continueTheGame)
    {
        counterRounds++;

        // prepare round
        sim.print("New round. <b>Player " + (curLiar.num + 1) + "</b> is the Liar, and the <b>player count</b> is " + numPlayers + ".");
        sim.print("Everyone breaks their deck into <b>" + numDicePerPlayer + " smaller piles</b> (or \"dice\"), then \"rolls\" their dice. <i>(Shuffle + secretly look at the top card.)</i>");

        for(const player of players)
        {
            player.rollDice(numDicePerPlayer);
        }

        const handAll = new Hand();
        for(const player of players)
        {
            handAll.addHand(player.getDiceTopCards());
        }

        // go in clockwise turns now (guessing or challenging)
        let continueTheRound = true;
        let counterPlayer = curLiar.num;
        let curGuess = new Guess();
        let counterTurns = 0;
        let losingPlayerRound : Player = null;
        while(continueTheRound)
        {
            // make a decision
            const curPlayer = players[counterPlayer];
            const curDice = curPlayer.getDiceTopCards();

            sim.print("<hr>");
            sim.print("<b>Player " + (counterPlayer + 1) + "'s turn to guess</b>. As a reminder, they rolled the following dice:");
            await sim.listImages(curDice, "draw");
            
            // make some semi-intelligent new guess based on old one
            const newGuess = new Guess();
            newGuess.formulate(curGuess, curDice, handAll);

            const certainlyCorrect = curGuess.matchesDiceResults(curPlayer.hand); // if we are certain the guess is correct from our hand alone, don't stop guessing of course

            const mustGuess = curGuess.isEmpty() || counterTurns < CONFIG.rulebook.minTurnsBeforeChallenge;
            const wannaGuess = Math.random() <= CONFIG.rulebook.keepGuessingProb || certainlyCorrect;
            const cantGuess = newGuess.isEmpty() || counterTurns >= CONFIG.rulebook.maxTurnsBeforeChallenge;
            const hasGuessed = (mustGuess || wannaGuess) && !cantGuess;
            const hasChallenged = !hasGuessed;

            // deal with the fallout
            if(hasGuessed)
            {
                curGuess = newGuess;
                sim.print("They decide to <b>guess</b>: " + curGuess.toString() + ".");
            }

            if(hasChallenged)
            {
                sim.print("They decide to <b>challenge</b> the previous guess (" + curGuess.toString() + "). Reveal all top cards and check who's right.");
                await sim.listImages(handAll, "draw");

                const prevPlayerNum = (counterPlayer + players.length - 1) % players.length;
                const prevPlayer = players[prevPlayerNum];

                const isCorrect = curGuess.matchesDiceResults(handAll);
                if(isCorrect) {
                    sim.print("The previous guess was <b>correct</b>! The current player (Player " + (counterPlayer + 1) + ") loses this round and discards one of their dice piles.");
                    curPlayer.hand.removeCards(curPlayer.getSmallestDie().cards);
                    losingPlayerRound = curPlayer;
                    sim.stats.guesses.won.push(curGuess);
                } else {
                    sim.print("The previous guess was <b>wrong</b>! The previous player (Player " +  (prevPlayerNum + 1) + ") loses this round and discards one of their dice piles.");
                    prevPlayer.hand.removeCards(prevPlayer.getSmallestDie().cards);
                    losingPlayerRound = prevPlayer;
                    sim.stats.guesses.lost.push(curGuess);
                }
            }
            
            // bookkeeping
            continueTheRound = !hasChallenged;

            counterTurns++;
            counterPlayer = (counterPlayer + 1) % players.length;
        }

        curLiar = losingPlayerRound;

        sim.stats.numTurns += counterTurns;

        continueTheGame = true;
        for(const player of players)
        {
            if(player.hand.count() > CONFIG.rulebook.cardsLeftForLoss) { continue; }
            continueTheGame = false;
            losingPlayer = player;
            break;
        }

        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    sim.stats.numRounds += counterRounds;
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 100;
const SHOW_FULL_GAME = false;

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
        showFullGame: SHOW_FULL_GAME,
        callbackInitStats,
        callbackFinishStats,
    }
})