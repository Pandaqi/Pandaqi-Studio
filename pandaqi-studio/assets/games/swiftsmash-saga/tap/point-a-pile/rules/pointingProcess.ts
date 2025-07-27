import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import Player from "./player";
import Hand from "./hand";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class PointingProcess
{
    cards:Card[]
    players:Player[]
    numPiles:number

    constructor(cards:Card[], players:Player[], numPiles:number = -1)
    {
        this.cards = cards.slice();
        this.players = players.slice();
        this.numPiles = numPiles;
    }

    count() { return this.cards.length; }
    countPlayers() { return this.players.length; }

    async resolve(sim:InteractiveExampleSimulator) : Promise<PointingProcess[]>
    {
        // create piles
        const numPiles = this.numPiles == -1 ? 2 + Math.floor(Math.random() * (this.count() - 2)) : this.numPiles;
        const piles : Hand[] = [];
        for(let i = 0; i < numPiles; i++)
        {
            piles.push(new Hand());
        }
        shuffle(this.cards);

        let counter = 0;
        for(const card of this.cards)
        {
            piles[counter].addCard(card);
            counter = (counter + 1) % piles.length;
        }

        // determine who points at what
        // either the INDEX of the pile, or -1 if pointed at nothing
        const pilePointedAtBy = [];
        const nonPointingPlayers : Player[]  = [];
        for(const player of this.players)
        {
            const pileIndex = Math.floor(Math.random() * (numPiles + 1)) - 1;
            pilePointedAtBy[player.num] = pileIndex;
            if(pileIndex == -1) {
                nonPointingPlayers.push(player);
            } else {
                piles[pileIndex].addPointer(player);
            }
        }

        // display the initial state
        const playerString = this.players.map((p:Player) => (p.num+1)).join(", ");
        sim.print("<b>Point!</b> Players " + playerString + " point at the following piles (at the same time).");
        const topCardsOfPiles = new Hand();
        for(const pile of piles)
        {
            topCardsOfPiles.addCard(pile.getFirst());
        }
        await sim.listImages(topCardsOfPiles);

        // display how it's all handled
        sim.print("The results of this are as follows.");
        const resultList = [];
        const newProcesses : PointingProcess[] = [];
        const discardedCards : Card[] = [];
        for(const pile of piles)
        {
            const numPointers = pile.pointers.length;
            const pointerString = pile.pointers.map((p:Player) => (p.num+1)).join(", ");
            if(numPointers <= 0) {
                resultList.push("<b>Nobody</b> pointed at this pile; discard.");
                discardedCards.push(...pile.cards);
            } else if(numPointers == 1) {
                const singlePointer = pile.pointers[0];
                resultList.push("<b>Only Player " + (singlePointer.num + 1) + "</b> pointed at this pile; they score all its cards.");
                singlePointer.scored.addHand(pile);
            } else {
                let str = "<b>Multiple players</b> pointed at this pile (" + pointerString + ").";
                if(pile.cards.length > 1) {
                    str += " This pile needs to be split again and resolved again later.";
                    newProcesses.push(new PointingProcess(pile.cards, pile.pointers));
                } else {
                    str += " But the pile can't be split further (1 card left); discard.";
                    discardedCards.push(...pile.cards);
                }
                resultList.push(str);
            }
        }
        sim.printList(resultList);

        // handle non-pointing players
        const numNonPointers = nonPointingPlayers.length;
        if(numNonPointers > 0)
        {
            if(numNonPointers == 1) {
                sim.print("Only Player " + (nonPointingPlayers[0].num+1) + " pointed at nothing, so they score all discarded cards."); 
                nonPointingPlayers[0].scored.addCards(discardedCards);
            } else {
                const nonPointerString = nonPointingPlayers.map((p:Player) => (p.num+1)).join(", ");
                sim.print("Multiple players (" + nonPointerString + ") pointed at nothing, so none of them get the discarded cards.");
            }
        }

        return newProcesses;
    }
}