import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import { CONFIG } from "../shared/config";
import Bid from "./bid";
import Hand from "./hand";
import Player from "./player";

enum ChallengeType
{
    SIMUL = "together",
    TURN = "turn-based"
}

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numTurns: 0,
        numTurnsPerGame: 0,
        numTurnsPerPlayerAvg: 0,
        numChallenges: 0,
        numChallengesTurn: 0,
        numChallengesSimul: 0,
        numChallengesPerGame: 0,
        challengeLength: 0,
        challengeLengthAvg: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numTurnsPerGame = s.numTurns / i;
    s.numTurnsPerPlayerAvg = s.numTurnsPerGame / s.numPlayersAvg;
    s.numChallengesPerGame = s.numChallenges / i;
    s.challengeLengthAvg = s.challengeLength / s.numChallengesTurn;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const numStartingCards = CONFIG.rulebook.numCardsPerPlayer ?? 10;
    
    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Player(i);
        players.push(p);        
    }

    // PHASE 1) DEALING
    sim.print("<b>Phase 1: DEAL.</b> Give cards to the players one by one. They must bid once, at some point.");
    sim.print("Below are the final bids for a <b>" + numPlayers + " player game</b>.");

    const allCards : Card[] = shuffle(sim.getPicker("card").get().slice());
    const bidStrings = [];
    for(const player of players)
    {
        const h = new Hand();
        h.addCards(allCards.splice(0, numStartingCards));
        player.hand = h;

        const b = new Bid(
            CONFIG.rulebook.bidNumWinsBounds.randomInteger(),
            CONFIG.rulebook.bidHandSizeBounds.randomInteger()
        );
        player.bid = b;
        bidStrings.push("<b>Player " + (player.num + 1) + "</b>: <b>" + b.toString() + "</b> <i>(" + b.toStringDetailed() + ")</i>");
    }
    sim.printList(bidStrings);

    // PHASE 2) PLAYING
    sim.print("<b>Phase 2: PLAY.</b> Now players will play small challenges (\"build homes\") trying to reach their bid perfectly.");
    
    let continueTheRound = true;
    let counterChallenges = 0;
    let curDealer : Player = fromArray(players);
    let winningPlayer : Player = null;

    while(continueTheRound)
    {
        // go in clockwise turns now (guessing or challenging)
        let continueTheChallenge = true;
        let counterPlayer = curDealer.num;
        let counterTurns = 0;
        let counterChallengeTurns = 0;
        let winningPlayerChallenge : Player = null;

        let challengeType = Math.random() <= CONFIG.rulebook.simulTurnProb ? ChallengeType.SIMUL : ChallengeType.TURN;
        if(curDealer.hand.count() <= 0) { challengeType = ChallengeType.TURN; } // just for simplification and I can't find a bug otherwise

        sim.print("<hr>");
        sim.print("The <b>Dealer</b> (Player " + (curDealer.num + 1) + ") decides how to play this challenge: <b>" + challengeType + "</b>.");

        const cardsPlayed = new Hand();

        // a SIMULTANEOUS round is a very simple one-step process
        if(challengeType == ChallengeType.SIMUL)
        {
            sim.stats.numChallengesSimul++;
            
            // play some random cards
            for(let i = 0; i < numPlayers; i++)
            {
                const player = players[(curDealer.num + i) % numPlayers];
                cardsPlayed.addCard(player.hand.removeCardRandom());
            }

            sim.print("Everyone simultaneously plays a facedown card. After revealing, this is the result:");
            await sim.listImages(cardsPlayed, "draw");

            // determine highest card in leading suit
            const dealerSuit = cardsPlayed.getFirst().suit;
            let actualCardsPlayed = 0;
            let highestNum = -Infinity;
            let highestCard : Card = null;
            for(const card of cardsPlayed.cards)
            {
                if(!card) { continue; }
                actualCardsPlayed++;
                if(card.suit != dealerSuit) { continue; }
                if(card.num <= highestNum) { continue; }
                highestNum = card.num;
                highestCard = card;
            }

            counterTurns += actualCardsPlayed;

            // give them the win
            const highestPlayerNum = cardsPlayed.cards.indexOf(highestCard);
            const highestPlayer = players[highestPlayerNum];
            winningPlayerChallenge = highestPlayer;

            sim.print("The winning card is " + highestCard.toString() + " by Player " + (highestPlayerNum + 1) + ". (It's the <b>highest</b> card of the <b>type the Dealer played</b>.) They win the challenge and become Dealer.");   
        }

        if(challengeType == ChallengeType.TURN)
        {
            sim.stats.numChallengesTurn++;
        }

        // a TURN-BASED round has to use the old loop-until-done
        let prevPlayer : Player = curDealer;
        while(continueTheChallenge && challengeType == ChallengeType.TURN)
        {
            // make a decision
            const curPlayer = players[counterPlayer];
            counterPlayer = (counterPlayer + 1) % players.length;
            if(curPlayer.hand.count() <= 0) { continue; }

            const possibleMoves : Card[] = curPlayer.getValidMoves(cardsPlayed);
            const canPlay = possibleMoves.length > 0 && cardsPlayed.count() < CONFIG.rulebook.maxTurnsPerChallenge;
            const wannaPlay = cardsPlayed.count() < CONFIG.rulebook.minTurnsPerChallenge || Math.random() <= CONFIG.rulebook.dontGiveUpProb; 

            // deal with the fallout
            const hasPlayed = canPlay && wannaPlay;
            if(hasPlayed)
            {
                const randMove = fromArray(possibleMoves);
                curPlayer.hand.removeCard(randMove);
                cardsPlayed.addCard(randMove);
                prevPlayer = curPlayer;

                counterChallengeTurns++;
                counterTurns++;
            }

            let strDecision = hasPlayed ? "They play a card (that fits on top of the previous one)." : "They give up. (They can't or don't want to play a card.)";
            if(cardsPlayed.count() <= 0) { strDecision = "They play the first card."; }

            sim.print("<b>Turn = Player " + (curPlayer.num + 1) + "</b>. " + strDecision);

            // bookkeeping
            if(hasPlayed)
            {
                await sim.listImages(cardsPlayed, "draw");
            }

            continueTheChallenge = hasPlayed;
            
            // @NOTE: nasty exception too => all players are out of cards before someone gives up
            let allPlayersOutOfCards = true;
            for(const player of players)
            {
                if(player.hand.count() <= 0) { continue; }
                allPlayersOutOfCards = false;
                break;
            }
            if(allPlayersOutOfCards) { continueTheChallenge = false; }

            if(!continueTheChallenge)
            {
                winningPlayerChallenge = prevPlayer;
                sim.print("The <b>final card</b> played wins the round. (That's " + cardsPlayed.getLast().toString() + " by Player " + (winningPlayerChallenge.num + 1) + ".) They win the challenge and become Dealer.");   
            }
        }

        winningPlayerChallenge.challengesWon++;
        curDealer = winningPlayerChallenge;

        counterChallenges++;
        sim.stats.numTurns += counterTurns;
        sim.stats.challengeLength += counterChallengeTurns;

        // as long as even a SINGLE player still has cards, continue
        let allPlayersOutOfCards = true;
        let firstPlayerWithCardsFromDealer = null;
        for(let i = 0; i < numPlayers; i++)
        {
            const player = players[(curDealer.num + i) % numPlayers];
            if(player.hand.count() <= 0) { continue; }
            firstPlayerWithCardsFromDealer = player;
            allPlayersOutOfCards = false;
            break;
        }

        curDealer = firstPlayerWithCardsFromDealer;
        continueTheRound = !allPlayersOutOfCards;

        // @NOTE: I want players to see the entire round (deal->play->score), so this is a rare instance where I turn this off
        //if(sim.displaySingleTurn()) { continueTheRound = false; }
    }

    sim.stats.numChallenges += counterChallenges;

    // PHASE 3) SCORING
    sim.print("<b>Phase 3: SCORE.</b> All players are out of cards; the round is over! Players calculate their score based on how well they did.");
    const scoreFeedback = [];
    let bestScore = -Infinity;
    let bestPlayer = null;

    for(const player of players)
    {
        const diff = Math.abs(player.challengesWon - player.bid.numWins);
        let scoreRaw = 0;
        if(diff == 0) { scoreRaw = 100; }
        if(diff == 1) { scoreRaw = 50; }
        
        const score = Math.round(scoreRaw / player.bid.handSize);
        const str = "<b>Player " + (player.num + 1) + "</b> scored <b>" + score + " points</b>. (They predicted " + player.bid.numWins + " wins and won " + player.challengesWon + ". Thus " + scoreRaw + " / " + player.bid.handSize + " = " + score + ".)";
        scoreFeedback.push(str);

        player.score = score;

        if(score > bestScore)
        {
            bestScore = score;
            bestPlayer = player;
        }
    }

    sim.printList(scoreFeedback);
    sim.print("Add the scores to the player's tallies. Play another round!");
}

const SIMULATION_ENABLED = true;
const SIMULATION_ITERATIONS = 1000;
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