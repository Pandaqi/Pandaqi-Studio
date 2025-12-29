
import { getMaterialDataForRulebook, shuffle, fromArray } from "lib/pq-games";
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";
import Card from "../game/card";
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
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const allCards : Card[] = shuffle(sim.getPicker("cards")());
    const allCardsPerNumber : Record<number, Card[]> = {};
    for(let n = 1; n <= 6; n++)
    {
        const arr = [];
        for(const card of allCards)
        {
            if(card.num != n) { continue; }
            arr.push(card);
        }
        allCardsPerNumber[n] = arr;
    }

    const startingCards = [];
    for(let i = 0; i < numPlayers; i++)
    {
        let arr = [];
        
        if(CONFIG.rulebook.startingCardsArePerfectDice) 
        {
            for(let n = 1; n <= 6; n++)
            {
                arr.push( allCardsPerNumber[n].pop() );
            }

            for(const card of arr)
            {
                allCards.splice(allCards.indexOf(card), 1);
            }
        }

        if(CONFIG.rulebook.startingCardsAreRandom)
        {
            const numCardsPerPlayer = CONFIG.rulebook.numCardsPerPlayer ?? 6;
            arr = allCards.splice(0, numCardsPerPlayer);
        }
        
        startingCards.push(arr);
    }

    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        const h = new Hand();
        h.addCards(startingCards[i]);
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
        const maxDiceAllowed = Math.floor(0.5 * curLiar.hand.count());
        const numDice = 2 + Math.floor(Math.random() * (maxDiceAllowed - 2 + 1));
        sim.print("New round. <b>Player " + (curLiar.num + 1) + "</b> is the Liar, and the <b>player count</b> is " + numPlayers + ".");
        sim.print("They pick a number: <b>" + numDice + "</b>. Everyone now breaks their deck down into that many smaller piles (or \"dice\").");
        sim.print("Everyone \"rolls\" their dice. (Shuffle + secretly look at the top card.)");

        for(const player of players)
        {
            player.rollDice(numDice);
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
                } else {
                    sim.print("The previous guess was <b>wrong</b>! The previous player (Player " +  (prevPlayerNum + 1) + ") loses this round and discards one of their dice piles.");
                    prevPlayer.hand.removeCards(prevPlayer.getSmallestDie().cards);
                    losingPlayerRound = prevPlayer;
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
            if(player.hand.count() > 0) { continue; }
            continueTheGame = false;
            losingPlayer = player;
            break;
        }

        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    sim.stats.numRounds += counterRounds;
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 1000;
const SHOW_FULL_GAME = false;

const CONFIG_RULEBOOK =
{
    examples:
    {
        turn:
        {
            buttonText: "Give me an example round!",
            callback: generate,
            simulator: {
                enabled: SIMULATION_ENABLED,
                iterations: SIMULATION_ITERATIONS,
                showFullGame: SHOW_FULL_GAME,
                callbackInitStats,
                callbackFinishStats,
            }
        }
    }
}

loadRulebook(CONFIG_RULEBOOK);