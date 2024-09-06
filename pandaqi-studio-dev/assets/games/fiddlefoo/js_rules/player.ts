import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import Board, { Move } from "./board";
import fromArray from "js/pq_games/tools/random/fromArray";
import Pair from "./pair";
import CONFIG from "../js_shared/config";

export default class Player
{
    num = -1
    cards: Card[] = []

    constructor(n:number)
    {
        this.num = n;
    }

    getCards() { return this.cards.slice(); }
    count() { return this.cards.length; }
    addCard(c:Card) { if(!c) { return; } this.cards.push(c); }
    addCards(cards:Card[])
    {
        for(const card of cards) { this.addCard(card); }
    }
    
    removeCardRandom() 
    { 
        const randIdx = Math.floor(Math.random() * this.count());
        return this.removeCardAtIndex(randIdx); 
    }

    removeCardAtIndex(idx:number)
    {
        if(idx < 0) { return; }
        return this.cards.splice(idx,1)[0];
    }

    removeCard(c:Card) : Card
    {
        const idx = this.cards.indexOf(c);
        return this.removeCardAtIndex(idx);
    }
    
    removeCards(cards:Card[])
    {
        for(const card of cards) { this.removeCard(card); }
    }

    getAllValidMoves(board:Board) : Move[]
    {
        const moves : Move[] = [];
        for(const card of this.cards)
        {
            const positions = board.getValidPositions(card);
            for(const pos of positions)
            {
                moves.push({ pos: pos, card: card });
            }
        }
        return moves;
    }

    pickMove(board:Board) : Move
    {
        const options = this.getAllValidMoves(board);
        if(options.length <= 0) { return null; }
        return fromArray(options);
    }

    getCardsFittingPair(pair:Pair) : Card[]
    {
        const arrRange : Card[] = [];
        const arrDist : Card[] = [];
        for(const card of this.cards)
        {
            // randomly decide to throw out a few if we have too many/or just randomly?
            if(Math.random() > CONFIG.rulebook.throwCardProb) { continue; }

            // otherwise, save options divided by match criteria
            const inRange = pair.inRange(card.num) && (card.color == pair.getColor());
            const matchesDist = card.numNotes == pair.getDistance();
            if(inRange) { arrRange.push(card); }
            if(matchesDist) { arrDist.push(card); }
        }

        // distance / music note matches only allow giving ONE card at most
        // @NOTE: if we can give away LOADS of numbers, though, do that instead
        const giveDistFit = arrDist.length > 0 && (Math.random() <= 0.25 || arrRange.length <= 0) && arrRange.length < 3;
        if(giveDistFit)
        {
            return [fromArray(arrDist)];
        }
        
        // otherwise, you may give all within range
        return arrRange;
    }

    receiveThrownCardsForPair(pair:Pair, players:Player[]) : Player
    {
        const arr : Card[] = [];
        for(const player of players)
        {
            const cards = player.getCardsFittingPair(pair);
            player.removeCards(cards);
            arr.push(...cards);
        }
        
        this.addCards(arr);

        // this is just a trick to hold cards and display them easily; this is not a player, it's a Hand of cards really
        const tempPlayer = new Player(-1);
        tempPlayer.addCards(arr);
        return tempPlayer;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            canvases.push(await card.drawForRules(sim.getVisualizer()));
        }
        return convertCanvasToImageMultiple(canvases);
    }
}