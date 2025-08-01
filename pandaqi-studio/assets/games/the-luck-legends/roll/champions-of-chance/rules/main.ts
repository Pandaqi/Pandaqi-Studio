import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import { CONFIG } from "../shared/config";
import Player from "./player";

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numTurns: 0,
        numTurnsPerGame: 0,
        numTurnsPerPlayerAvg: 0,
        numTies: 0,
        numTiesPerGame: 0,
        tieProb: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numTurnsPerGame = s.numTurns / i;
    s.numTurnsPerPlayerAvg = s.numTurnsPerGame / s.numPlayersAvg;
    s.numTiesPerGame = s.numTies / i;
    s.tieProb = s.numTiesPerGame / s.numTurnsPerGame;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const numCardsPerPlayer = CONFIG.rulebook.numCardsPerPlayer ?? 6;

    let allCards : Card[] = shuffle(sim.getPicker("card").get().slice());
    let discardPile : Card[] = [];
    
    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        p.addCards(allCards.splice(0, numCardsPerPlayer));
        players.push(p);
    }

    let continueTheGame = true;
    let counter = 0;
    let winningPlayer : Player = null;

    while(continueTheGame)
    {
        sim.stats.numTurns += 1;
        if(allCards.length <= 2)
        {
            allCards = [allCards, discardPile].flat();
            shuffle(allCards);
            discardPile = [];
        }

        const curPlayerNum = counter % players.length;
        const curPlayer = players[curPlayerNum];

        sim.print("It's <b>Player " + (curPlayerNum + 1) + "'s</b> turn. They have the following cards in their hand.");
        await sim.listImages(curPlayer, "draw");

        const opponentPlayerNum = (curPlayerNum + 1 + Math.floor(Math.random() * (players.length-1))) % players.length;
        const opponentPlayer = players[opponentPlayerNum];
        sim.print("They first pick an opponent: <b>Player " + (opponentPlayerNum + 1) + ".</b>");

        const maxNumPossible = Math.min(curPlayer.count(), opponentPlayer.count());
        const maxNumAllowed = Math.max( 2 + Math.floor(Math.random() * (maxNumPossible-2)), 1);
        sim.print("Now the <i>opponent</i> picks a number: <b>" + maxNumAllowed + "</b>. Both battlers select only that many hand cards to use for their die roll.");

        const challenge = Math.random() <= 0.5 ? "highest" : "lowest";
        sim.print("Finally, the active player (<b>Player " + (curPlayerNum + 1) + "</b>) chooses the challenge: <b>" + challenge + "</b>.");

        sim.print("Now both battlers \"roll their die\" (which should have " + maxNumAllowed + " cards). The results are as follows:");
         
        const myResult = curPlayer.getCardRandom(maxNumAllowed);
        const theirResult = opponentPlayer.getCardRandom(maxNumAllowed);
        const tempPlayer = new Player(-1);
        tempPlayer.addCards([myResult, theirResult]);
        await sim.listImages(tempPlayer, "draw");

        const isTie = (myResult.num == theirResult.num);
        if(isTie)
        {
            sim.stats.numTies += 1;

            sim.print("Is't a <b>tie</b>! Both players <b>discard</b> 1 card and <b>draw</b> one from the deck.");
            discardPile.push(curPlayer.removeCardRandom());
            curPlayer.addCard(allCards.pop());

            discardPile.push(opponentPlayer.removeCardRandom());
            opponentPlayer.addCard(allCards.pop());
        }

        if(!isTie)
        {
            let winningPlayerTurn = curPlayer;
            if((challenge == "lowest" && theirResult.num < myResult.num) || (challenge == "highest" && theirResult.num > myResult.num))
            {
                winningPlayerTurn = opponentPlayer;
            }

            const winningResult = (winningPlayerTurn == curPlayer) ? myResult : theirResult;
            const losingResult = (winningResult == myResult) ? theirResult : myResult;

            if(challenge == "lowest") {
                sim.print("<b>Player " + (winningPlayerTurn.num + 1) + " wins.</b> The challenge was <i>lowest</i>, and their number (" + winningResult.num + ") was <i>lower</i> than the other number (" + losingResult.num + ").");
            } else if(challenge == "highest") {
                sim.print("<b>Player " + (winningPlayerTurn.num + 1) + " wins.</b> The challenge was <i>highest</i>, and their number (" + winningResult.num + ") was <i>higher</i> than the other number (" + losingResult.num + ").");
            }

            sim.print("The winner (Player " + (winningPlayerTurn.num + 1) + ") <b>discards</b> the card they rolled. The loser just gets their card back.");
            winningPlayerTurn.removeCard(winningResult);
        }

        continueTheGame = true;
        for(const player of players)
        {
            if(player.count() > 0) { continue; }
            continueTheGame = false;
            winningPlayer = player;
            break;
        }

        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }


}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 10000;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example turn!",
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