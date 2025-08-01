import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import CardPicker from "../game/cardPicker";
import { CONFIG } from "../shared/config";
import Hand from "./hand";
import Player from "./player";

const callbackInitStats = () =>
{
    return {
        numPlayers: 0,
        numPlayersAvg: 0,
        numRounds: 0,
        numRoundsPerGame: 0,
        numTies: 0,
        numTiesPerGame: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numRoundsPerGame = s.numRounds / i;
    s.numTiesPerGame = s.numTies / i;
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

        // find winning card 
        const winningCard = cardsPlayed.getWinner();
        const winningPlayer = cardsPlayed.cards.indexOf(winningCard);
        sim.print("The <b>winning card</b> (latest in alphabet, uppercase beats lowercase) is therefore:");
        await sim.listImages(new Hand().addCard(winningCard));

        sim.print("The first player to smack that card wins the round!");
        sim.print("<i>(This interactive example does not include the spell-a-word rule, as that was too hard to make quick and reliable.)</i>");
        players[winningPlayer].scored.addHand(cardsPlayed);

        const isTie = cardsPlayed.cards.filter((card) => card && card.symbol.toUpperCase() == winningCard.symbol.toUpperCase()).length > 1;
        if(isTie) { sim.stats.numTies++; }

        // draw new cards
        for(const player of players)
        {
            if(allCards.length <= 0) { break; }
            player.hand.addCard(allCards.pop());
        }
    
        sim.stats.numRounds++;

        let noPlayersHaveCards = true;
        for(const player of players)
        {
            if(player.hand.count() <= 0) { continue; }
            noPlayersHaveCards = false;
            break;
        }

        continueTheRound = !noPlayersHaveCards;
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