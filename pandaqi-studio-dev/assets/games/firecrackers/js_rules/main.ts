import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import CardPicker from "../js_game/cardPicker";
import shuffle from "js/pq_games/tools/random/shuffle";
import Bounds from "js/pq_games/tools/numbers/bounds";
import Card from "../js_game/card";
import { CardType } from "../js_shared/dict";
import CONFIG from "../js_shared/config";

const SIMULATE = true;
const SIMULATE_STARTER_DECK = true;
const PLAYER_BOUNDS = new Bounds(3,5);
const DECK_BOUNDS = new Bounds(5,8);
const STOP_PROB = 0.25;
const EXPLODE_THRESHOLD = 10; // equal to or greater than
const NUM_SIMULATIONS = 1000; 

interface SimulationStats
{
    playerCount: number,
    cardsUntilExplosion: number,
    totalCardsPlayed: number,
    explodedAfterSingleCard: number,
    didntExplode: number,
}

class Round
{
    decks: Deck[]
    revealed: Deck[]
    stopped: boolean[]
    curPlayer: number

    fromDecks(decks:Deck[])
    {
        this.decks = decks;
        this.stopped = new Array(decks.length).fill(false);
        this.revealed = [];
        for(let i = 0; i < decks.length; i++)
        {
            this.revealed.push(new Deck());
        }
        this.curPlayer = 0;
        return this;
    }

    allPlayersStopped()
    {
        for(const val of this.stopped)
        {
            if(!val) { return false; }
        }
        return true;
    }

    playerStops() { this.stopped[this.curPlayer] = true; }
    playerReveals() : Card
    {
        const c = this.getCurrentDeck().removeCard();
        this.getCurrentRevealed().addCard(c);
        return c;
    }

    doesPlayerExplode(c:Card)
    {
        const cards = this.getAllOfType(c.type)
        let num = 0;
        for(const card of cards)
        {
            num += card.num;
        }
        return [(num >= EXPLODE_THRESHOLD), num];
    }

    getAllOfType(type:CardType)
    {
        const arr = [];
        for(const deck of this.revealed)
        {
            arr.push(deck.getAllOfType(type));
        }
        return arr.flat();
    }

    goNext()
    {
        do
        {
            this.curPlayer = (this.curPlayer + 1) % this.stopped.length;
        }
        while(this.stopped[this.curPlayer]);
    }

    getCurrentDeck()
    {
        return this.decks[this.curPlayer];
    }

    getCurrentRevealed()
    {
        return this.revealed[this.curPlayer];
    }

    count(type:string)
    {
        let sum = 0;
        for(const deck of this[type])
        {
            sum += deck.count();
        }
        return sum;
    }
}

class Deck
{
    cards:Card[]

    constructor() { this.cards = []; }
    count() { return this.cards.length; }
    fromCards(cards:Card[]) { this.cards = shuffle(cards.slice()); return this; }
    fromOptions(num:number, options:Card[])
    {
        this.cards = [];
        for(let i = 0; i < num; i++)
        {
            this.cards.push(options.pop());
        }
        return this;
    }

    addCard(c:Card)
    {
        this.cards.push(c);
        return c;
    }

    removeCard(c:Card = null)
    {
        if(!c) { c = this.cards[this.cards.length - 1]; }
        const idx = this.cards.indexOf(c);
        if(idx < 0) { return; }
        this.cards.splice(idx, 1);
        return c;
    }

    getAllOfType(type:CardType)
    {
        const arr = [];
        for(const card of this.cards)
        {
            if(card.type != type) { continue; }
            arr.push(card)
        }
        return arr;
    }
}

async function generate()
{
    // determine decks
    const numPlayers = PLAYER_BOUNDS.randomInteger();

    const cardPicker = new CardPicker();
    cardPicker.setNumPacks(Math.max(numPlayers, CONFIG.generation.starterDeck.numColors));
    cardPicker.generate();

    const allCards = shuffle(cardPicker.get().slice());
    const starterDecks = shuffle(cardPicker.getStarterDecks(numPlayers).slice());
    const decks = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const deck = new Deck();
        if(SIMULATE && SIMULATE_STARTER_DECK) {
            deck.fromCards(starterDecks.pop());
        } else {
            const deckSize = DECK_BOUNDS.randomInteger();
            deck.fromOptions(deckSize, allCards);
        }

        decks.push(deck);
    }

    const round = new Round().fromDecks(decks);

    const stats:SimulationStats = { cardsUntilExplosion: 0, totalCardsPlayed: 0, playerCount: numPlayers, explodedAfterSingleCard: 0, didntExplode: 0 };

    if(!SIMULATE)
    {
        o.addParagraph("Below is an example of how a round plays out.");
    }

    while(!round.allPlayersStopped())
    {
        round.goNext();
        
        const curPlayerNum = (round.curPlayer + 1);
        const curDeck = round.getCurrentDeck();
        const curRevealed = round.getCurrentRevealed();
        const numRevealed = curRevealed.count();
        let stop = Math.random() <= STOP_PROB;
        if(numRevealed <= 0) { stop = false; }
        if(SIMULATE) { stop = false; } // simulation always continues until explosion, as that's what we're interested in
        if(curDeck.count() <= 0) { stop = true; }

        if(stop) 
        {
            round.playerStops();
            stats.cardsUntilExplosion += numRevealed;
            stats.didntExplode++;

            if(!SIMULATE)
            {
                o.addParagraph("Player " + curPlayerNum + " decides to <strong>STOP</strong>. They played <strong>" + numRevealed + " cards</strong>, so they have " + numRevealed + " coins with which to buy new cards from the shop.");
            }

        } else {
            const cardRevealed = round.playerReveals();
            if(!cardRevealed)
            {
                console.log(curDeck);
                console.log(curRevealed);
            }

            if(!SIMULATE)
            {
                o.addParagraph("Player " + curPlayerNum + " decides to <strong>REVEAL</strong>. They revealed a <strong>" + cardRevealed.toString() + "</strong>.");
                o.addParagraph("The table now looks like this.");
                await round.draw();
            }

            const [explodes, num] = round.doesPlayerExplode(cardRevealed);
            if(explodes) 
            { 
                round.playerStops(); 
                stats.cardsUntilExplosion += numRevealed;
                if(numRevealed == 0) { stats.explodedAfterSingleCard++; }
                if(!SIMULATE)
                {
                    o.addParagraph("Oh no, this brings the total number for that card type to " + num + "! This player <strong>explodes</strong>. They're out of the round.");
                }
            }
        }
    }

    stats.totalCardsPlayed += round.count("revealed");
    stats.cardsUntilExplosion /= numPlayers;
    stats.didntExplode /= numPlayers;
    stats.explodedAfterSingleCard /= numPlayers;

    if(!SIMULATE)
    {
        o.addParagraph("The round is over! (Everybody has stopped or exploded.) Play the next one.");
    }

    return stats;
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

const performSimulation = async () =>
{
    if(!SIMULATE) { return; }

    const stats:SimulationStats = { cardsUntilExplosion: 0, totalCardsPlayed: 0, playerCount: 0, explodedAfterSingleCard: 0, didntExplode: 0 };
    for(let i = 0; i < NUM_SIMULATIONS; i++)
    {
        const results = await generate();

        for(const [key,data] of Object.entries(results))
        {
            stats[key] += data;
        }
    }

    console.log("=== Simulation Results ===");
    console.log("Games Played: " + NUM_SIMULATIONS);
    console.log("Average player count: " + stats.playerCount / NUM_SIMULATIONS);
    console.log("Average cards revealed per round: " + stats.totalCardsPlayed / NUM_SIMULATIONS);
    console.log("Average cards revealed until explosion: " + stats.cardsUntilExplosion / NUM_SIMULATIONS);
    console.log("Average % of players who revealed their whole deck (without exploding): " + stats.didntExplode / NUM_SIMULATIONS);
    console.log("Average % of players who exploded on their first card: " + stats.explodedAfterSingleCard / NUM_SIMULATIONS);
}

performSimulation();
