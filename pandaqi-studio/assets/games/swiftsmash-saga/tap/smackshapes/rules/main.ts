
import { getMaterialDataForRulebook, shuffle } from "lib/pq-games";
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";
import Card from "../game/card";
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
        numSmackheadChanges: 0,
        numSmackheadChangesPerGame: 0,
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    s.numPlayersAvg = s.numPlayers / i;
    s.numRoundsPerGame = s.numRounds / i;
    s.numSmackheadChangesPerGame = s.numSmackheadChanges / i;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const numPlayers = CONFIG.rulebook.numPlayerBounds.randomInteger() ?? 4;
    sim.stats.numPlayers += numPlayers;

    const players : Player[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        players.push(new Player(i));        
    }

    const allCards : Card[] = shuffle(sim.getPicker("cards")());
    const numStartingCards = CONFIG.rulebook.numCardsPerPlayer ?? 10;
    for(const player of players)
    {
        const h = new Hand();
        h.addCards(allCards.splice(0, numStartingCards));
        player.hand = h;
    }

    let continueTheRound = true;
    let smackheadPlayer = players[0];
    while(continueTheRound)
    {
        sim.print("<b>New round!</b> Player " + (smackheadPlayer.num + 1) + " is the <b>Smackhead</b>.");

        // play cards
        const cardsPlayed = new Hand();
        for(const player of players)
        {
            cardsPlayed.addCard(player.hand.removeCardRandom());
        }
        sim.print("Everyone simultaneously picks a card. The following cards are revealed:");
        await sim.listImages(cardsPlayed);

        // find winning card
        const smackheadCard = cardsPlayed.cards[smackheadPlayer.num];
        const winningCard = cardsPlayed.getWinner(smackheadCard);
        const winningIndex = cardsPlayed.cards.indexOf(winningCard);
        sim.print("The <b>shape ranking</b> is: " + smackheadCard.ranking.join(", ").toUpperCase() + ". (Given by Smackhead's card.)");
        sim.print("The <b>winning card</b> (earliest shape, most icons) is therefore: ");
        await sim.listImages(new Hand().addCard(winningCard));
        
        sim.print("The first player to smack that card wins the round and becomes Smackhead!");
        const newSmackheadPlayer = players[winningIndex];
        if(newSmackheadPlayer != smackheadPlayer) { sim.stats.numSmackheadChanges++; }
        smackheadPlayer = newSmackheadPlayer;

        // draw new cards
        for(const player of players)
        {
            if(allCards.length <= 0) { break; }
            player.hand.addCard(allCards.pop());
        }
    
        sim.stats.numRounds++;

        let allPlayersHaveCards = true;
        for(const player of players)
        {
            if(player.hand.count() > 0) { continue; }
            allPlayersHaveCards = false;
            break;
        }

        continueTheRound = allPlayersHaveCards;
        if(sim.displaySingleTurn()) { continueTheRound = false; }
    }
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