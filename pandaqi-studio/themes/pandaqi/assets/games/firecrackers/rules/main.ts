import { Bounds, Vector2, convertCanvasToImageMultiple, getMaterialDataForRulebook, shuffle } from "lib/pq-games";
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";
import Card from "../game/card";
import { getStarterDecks, setNumPacks } from "../game/cardPicker";
import { CONFIG } from "../shared/config";
import { CardType } from "../shared/dict";


const SIMULATE = false;
const SIMULATE_STARTER_DECK = false; // if true, it simulates the first round of a game; otherwise it's a random moment from a game
const SIMULATE_PLAYER_BOUNDS = new Bounds(3,5);
const PLAY_PLAYER_BOUNDS = new Bounds(3,3);
const DECK_BOUNDS = new Bounds(5,8);
const STOP_PROBS = [0, 0.1, 0.3, 0.45, 0.66];
const EXPLODE_THRESHOLD = 10; // equal to or greater than
const NUM_SIMULATIONS = 1000; 
const MAX_REVEAL_PER_ROUND = 5;
const CARD_DRAW_CONFIG = {
    size: new Vector2(100, 140)
}

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

    countRevealed()
    {
        let sum = 0;
        for(const deck of this.revealed)
        {
            sum += deck.count();
        }
        return sum;
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

    async draw()
    {
        const promises = [];
        for(const deck of this.revealed)
        {
            promises.push(deck.draw());
        }
        const nodes = await Promise.all(promises);

        // fade out those whoe have stopped or exploded
        for(let i = 0; i < nodes.length; i++)
        {
            if(this.stopped[i]) { nodes[i].style.opacity = "0.5"; }
        }

        return nodes;
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

    async draw()
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.drawForRules(CARD_DRAW_CONFIG));
        }
        
        const canvases = await Promise.all(promises);
        const images = await convertCanvasToImageMultiple(canvases);

        const div = document.createElement("div");
        div.style.display = "flex";
        for(const img of images)
        {
            img.style.maxHeight = "8vw";
            div.appendChild(img);
        }
        
        return div;
    }
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    // determine decks
    const o = sim.getOutputBuilder();
    const numPlayers = SIMULATE ? SIMULATE_PLAYER_BOUNDS.randomInteger() : PLAY_PLAYER_BOUNDS.randomInteger();

    let allCards : Card[] = shuffle(sim.getPicker("cards")());
    allCards = setNumPacks(allCards, Math.max(numPlayers, CONFIG.generation.starterDeck.numColors));
    const starterDecks : Card[][] = shuffle(getStarterDecks(allCards, numPlayers).slice());
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

        if(!SIMULATE)
        {
            o.addNode(document.createElement("hr"));
        }
        
        const curPlayerNum = (round.curPlayer + 1);
        const curDeck = round.getCurrentDeck();
        const curRevealed = round.getCurrentRevealed();
        const numRevealed = curRevealed.count();
        let stop = Math.random() <= STOP_PROBS[Math.min(numRevealed, STOP_PROBS.length-1)]; // probability raises with each card
        if(numRevealed <= 0) { stop = false; }
        if(numRevealed >= MAX_REVEAL_PER_ROUND) { stop = true; }
        if(SIMULATE) { stop = false; } // simulation always continues until explosion, as that's what we're interested in
        if(curDeck.count() <= 0) { stop = true; }

        let feedback = "";

        if(stop) 
        {
            round.playerStops();
            stats.cardsUntilExplosion += numRevealed;
            stats.didntExplode++;

            feedback += "Player " + curPlayerNum + " decides to <strong>STOP</strong>. They played <strong>" + numRevealed + " cards</strong>, so they have " + numRevealed + " coins with which to buy new cards from the shop. "

        } else {
            const cardRevealed = round.playerReveals();
            feedback += "Player " + curPlayerNum + " decides to <strong>REVEAL</strong>: a <strong>" + cardRevealed.toString() + "</strong>. "

            const [explodes, num] = round.doesPlayerExplode(cardRevealed);
            if(explodes) { 
                round.playerStops(); 
                stats.cardsUntilExplosion += numRevealed;
                if(numRevealed == 0) { stats.explodedAfterSingleCard++; }
                feedback += "Oh no, this brings the total number for that type to " + num + "! This player <strong>explodes</strong>. They're out of the round."
            } else {
                feedback += "Total for this type is " + num + ", so they're safe!"
            }
        }

        if(!SIMULATE)
        {
            o.addParagraph(feedback);
            const node = o.addFlexList(await round.draw());
            node.style.flexWrap = "wrap";
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

const callbackInitStats = () =>
{
    return { cardsUntilExplosion: 0, totalCardsPlayed: 0, playerCount: 0, explodedAfterSingleCard: 0, didntExplode: 0 }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    console.log("=== Simulation Results ===");
    console.log("Games Played: " + NUM_SIMULATIONS);
    console.log("Average player count: " + sim.stats.playerCount / NUM_SIMULATIONS);
    console.log("Average cards revealed per round: " + sim.stats.totalCardsPlayed / NUM_SIMULATIONS);
    console.log("Average cards revealed until explosion: " + sim.stats.cardsUntilExplosion / NUM_SIMULATIONS);
    console.log("Average % of players who revealed their whole deck (without exploding): " + sim.stats.didntExplode / NUM_SIMULATIONS);
    console.log("Average % of players who exploded on their first card: " + sim.stats.explodedAfterSingleCard / NUM_SIMULATIONS);
}

const CONFIG_RULEBOOK =
{
    examples:
    {
        turn:
        {
            buttonText: "Give me an example round!",
            callback: generate,
            simulator:
            {
                enabled: SIMULATE,
                callbackInitStats: callbackInitStats,
                callbackFinishStats: callbackFinishStats
            }
        }
    }
}

loadRulebook(CONFIG_RULEBOOK);
