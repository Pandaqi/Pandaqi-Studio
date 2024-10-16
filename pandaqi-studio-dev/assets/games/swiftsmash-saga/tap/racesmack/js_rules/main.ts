import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import FinishTracker from "./finishTracker";
import Hand from "./hand";
import Player from "./player";
import { CardType } from "../js_shared/dict";

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numRounds: 0,
        numRoundsPerGame: 0,
        gamesWonByFinishTotal: 0, // how often games end by someone finishing (instead of deck running out)
        correctCardsTotal: 0, // how many cards are correct
        noneCorrectRoundTotal: 0, // rounds where nothing is correct
        specialRuleRounds: 0, // if the round has a special rule overwriting the default one
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numRoundsPerGame = s.numRounds / i;
    s.gamesWonByFinishFraction = s.gamesWonByFinishTotal / i;
    s.correctCardsPerRound = s.correctCardsTotal / s.numRounds;
    s.noneCorrectRoundFraction = s.noneCorrectRoundTotal / s.numRounds;
    s.specialRuleFraction = s.specialRuleRounds / s.numRounds;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        players.push(new Player(i));        
    }

    // give players their starting cards
    const allCards : Card[] = shuffle(sim.getPicker("card").get().slice());
    const numStartingCards = CONFIG.rulebook.numCardsPerPlayer ?? 10;
    for(const player of players)
    {
        const h = new Hand();
        h.addCards(allCards.splice(0, numStartingCards));
        player.hand = h;
    }

    let continueTheRound = true;
    while(continueTheRound)
    {
        // play cards
        const cardsPlayed = new Hand();
        for(const player of players)
        {
            cardsPlayed.addCard(player.hand.removeCardRandom());
        }
        sim.print("<b>New round!</b> Everyone simultaneously picks a card. The following cards are revealed:");
        await sim.listImages(cardsPlayed);

        // determine what is smacked
        const cardSmacked = [];
        const nonRuleCards = cardsPlayed.cards.filter((c:Card) => c.type != CardType.RULE);
        for(const player of players)
        {
            cardSmacked[player.num] = nonRuleCards.length > 0 ? fromArray(nonRuleCards) : fromArray(cardsPlayed.cards);
        }

        const activeRuleCard = cardsPlayed.getActiveRuleCard();
        if(activeRuleCard)
        {
            sim.print("The highest <b>Rule Card</b> played changes the rule for correctness to: <i>" + activeRuleCard.actionString + "</i>");
            sim.stats.specialRuleRounds++;
        }

        const playersClone : Player[] = shuffle(players.slice());
        const playerTooLate = CONFIG.rulebook.rules.onePlayerDoesntSmack ? playersClone.pop() : null;

        // handle the consequences of that
        const leftoverCards : Card[] = cardsPlayed.cards.slice();
        const resultList : string[] = [];

        const cardCorrectness = [];
        for(const card of cardsPlayed.cards)
        {
            cardCorrectness.push(cardsPlayed.isCardCorrect(card));
        }
        const numCardsCorrect = cardCorrectness.filter((cor:boolean) => cor).length;
        const noCardsCorrect = numCardsCorrect <= 0;

        sim.stats.correctCardsTotal += numCardsCorrect;
        if(noCardsCorrect) { sim.stats.noneCorrectRoundTotal++; }

        const playersCorrectness = [];
        const playersCorrect = [];
        for(const player of players)
        {
            const myCardSmacked = cardSmacked[player.num];
            const myCardPlayed = cardsPlayed.cards[player.num];
            const isCorrectRaw = cardCorrectness[cardsPlayed.cards.indexOf(myCardSmacked)];
            const isCorrect = (noCardsCorrect && myCardSmacked == myCardPlayed) || (!noCardsCorrect && isCorrectRaw);
            playersCorrectness.push(isCorrect);
            if(isCorrect && player != playerTooLate) { playersCorrect.push(player); }
        }
        const playerFastest = playersCorrect.length > 0 ? fromArray(playersCorrect) : null;

        for(const player of players)
        {
            const myCard = cardSmacked[player.num];
            const myCardPlayed = cardsPlayed.cards[player.num];
            const cardIndex = cardsPlayed.cards.indexOf(myCard) + 1; 
            let str = "<b>Player " + (player.num + 1) + "</b> smashes <b>Card " + cardIndex + "</b>.";

            if(player == playerTooLate) 
            {
                resultList.push("<b>Player " + (player.num + 1) + "</b> was too late and didn't smash anything.");
                continue;
            }

            const isCorrect = playersCorrectness[player.num];
            if(isCorrect) {
                str += " <b>Correct!</b> They score their own card.";
                leftoverCards.splice(leftoverCards.indexOf(myCardPlayed), 1);
                player.scored.addCard(myCardPlayed);
            } else {
                str += " <b>Incorrect!</b>";

                if(CONFIG.rulebook.rules.loseCardIfWrong) 
                {
                    str += " They lose 1 of their Race cards.";
                    const cardRemoved = player.scored.removeCardRandom();
                    if(cardRemoved) { allCards.push(cardRemoved); }
                }
            }

            if(player == playerFastest) 
            {
                str += " (They were also the fastest and win any leftover cards.)"; // this is only actually done after this loop, as then we know what the leftoverCards are!
            }

            resultList.push(str);
        }

        if(playerFastest) {
            playerFastest.scored.addCards(leftoverCards);
        } else {
            allCards.push(...leftoverCards);
        }

        sim.printList(resultList);

        // end: final resolution and setting up next round
        sim.print("Everyone draws a new hand card. Check if anybody won. Next round!");

        // then players draw a new hand card (if possible)
        if(Math.random() <= 0.1) { shuffle(allCards); } // randomization but at low-cost
        for(const player of players)
        {
            if(allCards.length <= 0) { break; }
            player.hand.addCard(allCards.pop());
        }

        sim.stats.numRounds++;

        const cardsLeftInDeck = allCards.length > 0;
        let winningPlayer : Player = null;
        const finishTracker = new FinishTracker();
        for(const player of players)
        {
            if(!player.hasFinished(finishTracker)) { continue; }
            winningPlayer = player;
        }

        continueTheRound = !winningPlayer && cardsLeftInDeck;
        if(winningPlayer) { sim.stats.gamesWonByFinishTotal++; }
        if(sim.displaySingleTurn()) { continueTheRound = false; }
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