import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import CONFIG from "../shared/config";
import Player from "./player";
import { AnimalType, CardType } from "../shared/dict";

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
        numHandCards: 0,
        numZooCardsAtEnd: 0,
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
    s.numHandCardsPerTurnAvg = s.numHandCards / s.numTurns;
    s.numZooCardsAtEndAvg = s.numZooCardsAtEnd / i;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const numCardsPerPlayer = CONFIG.rulebook.numCardsPerPlayer ?? 6;

    let allCards : Card[] = shuffle(sim.getPicker("card").get().slice());
    const allAnimalCards = [];
    const allZooCards = [];
    for(const card of allCards)
    {
        if(card.type == CardType.ANIMAL) { allAnimalCards.push(card); }
        else { allZooCards.push(card); }
    }
    
    const players : Player[] = [];
    const scores : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        p.addCards(allAnimalCards.splice(0, numCardsPerPlayer));
        players.push(p);

        const ps = new Player(i);
        scores.push(ps);
    }

    const zooMarket = new Player(-1);
    zooMarket.addCards(allZooCards.splice(0, CONFIG.rulebook.zooMarketSize ?? 6));

    let continueTheGame = true;
    let counter = 0;
    let winningPlayer : Player = null;

    while(continueTheGame)
    {
        sim.stats.numTurns += 1;

        const curPlayerNum = counter % players.length;
        const curPlayer = players[curPlayerNum];

        sim.stats.numHandCards += curPlayer.count();

        sim.print("It's <b>Player " + (curPlayerNum + 1) + "'s</b> turn. They have the following cards in their hand.");
        await sim.listImages(curPlayer, "draw");

        const zooCard = zooMarket.removeCardRandom();
        zooMarket.addCard(allZooCards.pop()); // instantly refill market!
        sim.print("They first pick a <b>Zoo Card</b> from the options:");

        const tempZooPlayer = new Player(-1);
        tempZooPlayer.addCard(zooCard);
        await sim.listImages(tempZooPlayer, "draw");

        const opponentPlayerNum = (curPlayerNum + 1 + Math.floor(Math.random() * (players.length-1))) % players.length;
        const opponentPlayer = players[opponentPlayerNum];
        sim.print("Then they pick an opponent: <b>Player " + (opponentPlayerNum + 1) + ".</b>");

        sim.print("Both battlers \"roll their die\". (Shuffle + reveal top card.) The results are as follows:");
         
        const myResult = curPlayer.getCardRandom();
        const theirResult = opponentPlayer.getCardRandom();
        const tempPlayer = new Player(-1);
        tempPlayer.addCards([myResult, theirResult]);
        await sim.listImages(tempPlayer, "draw");

        const distMeToThem = zooCard.getDistanceBetween(myResult.key as AnimalType, theirResult.key as AnimalType);
        const distThemToMe = zooCard.getDistanceBetween(theirResult.key as AnimalType, myResult.key as AnimalType);

        const isTie = (distMeToThem == distThemToMe);
        if(isTie)
        {
            sim.stats.numTies += 1;

            const zooReceiver = Math.random() <= 0.5 ? curPlayer : opponentPlayer;
            const discarder = (zooReceiver == curPlayer) ? opponentPlayer : curPlayer;

            scores[zooReceiver.num].addCard(zooCard);
            if(discarder.count() > 1) { discarder.removeCardRandom(); }

            let str = "they <b>score the Zoo Card</b> and their opponent <b>discards</b> a card";
            if(zooReceiver == opponentPlayer)
            {
                str = "they <b>discard</b> a card and their opponent <b>scores the Zoo Card</b>"; 
            } 

            sim.print("Is't a <b>tie</b>! The active player (Player " + (curPlayerNum + 1) + ") decides that " + str + ".");
        }

        if(!isTie)
        {
            const winningPlayerTurn = distMeToThem > distThemToMe ? curPlayer : opponentPlayer;
            const winningResult = (winningPlayerTurn == curPlayer) ? myResult : theirResult;
            const losingResult = (winningResult == myResult) ? theirResult : myResult;
            const winningDist = (winningPlayerTurn == curPlayer) ? distMeToThem : distThemToMe;
            const losingDist = (winningDist == distMeToThem) ? distThemToMe : distMeToThem;

            let strReason = "The <b>distance</b> (number of arrows/icons) between their animal (<i>" + winningResult.key + "</i>) and the opponent's animal (<i>" + losingResult.key + "</i>) is <i>larger</i> than the other way around (" + winningDist + " vs " + losingDist + ").";
            if(losingDist <= 0)
            {
                strReason = "Because their animal (<i>" + winningResult.key + "</i>) is on the cycle, and the opponent's animal (<i>" + losingResult.key + "</i>) is not, it's automatically better.";
            }

            sim.print("<b>Player " + (winningPlayerTurn.num + 1) + " wins!</b> " + strReason);
            sim.print("They get the Zoo Card. Next turn!");
            scores[winningPlayerTurn.num].addCard(zooCard);
        }

        continueTheGame = true;
        for(const score of scores)
        {
            let playerScore = 0;
            for(const card of score.cards)
            {
                playerScore += card.scoreValue ?? 0;
            }
            if(playerScore < CONFIG.rulebook.numPointsToWin) { continue; }

            continueTheGame = false;
            winningPlayer = players[score.num];
            break;
        }

        if(sim.displaySingleTurn()) { continueTheGame = false; }
    }

    let totalNumZooCards = 0;
    for(const score of scores)
    {
        totalNumZooCards += score.count();
    }
    totalNumZooCards /= numPlayers;
    sim.stats.numZooCardsAtEnd += totalNumZooCards;


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