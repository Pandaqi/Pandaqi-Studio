import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import anyMatch from "js/pq_games/tools/collections/anyMatch";
import getAllPossibleCombinationsRaw from "js/pq_games/tools/collections/getAllPossibleCombinationsRaw";
import numberRange from "js/pq_games/tools/collections/numberRange";
import fromArray from "js/pq_games/tools/random/fromArray";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import Card from "../game/card";
import Visualizer from "../game/visualizer";
import { CONFIG } from "../shared/config";
import { SUITS, Type } from "../shared/dict";


class Hand
{
    cards:Card[]

    constructor(num, unique = false)
    {
        this.cards = [];
        const numbers = shuffle(numberRange(1,9));
        const suits = Object.keys(SUITS);
        for(let i = 0; i < num; i++)
        {
            const num = unique ? numbers.pop() : fromArray(numbers);
            const card = new Card(Type.NUMBER, num);
            card.suit = fromArray(suits);
            this.cards.push(card);
        }
    }

    getNumbers()
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.num);
        }
        return arr;
    }

    getFirstCard() { return this.cards[0]; }
    getLastCard() { return this.cards[this.cards.length-1]; }

    async draw(sim:InteractiveExampleSimulator)
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.drawForRules(sim.getVisualizer()));
        }
        return await Promise.all(promises);
    }
}

enum MoveSide
{
    LEFT = "left",
    RIGHT = "right"
}

enum MoveMath
{
    ADD = "add",
    SUBTRACT = "subtract"
}

class Move
{
    side: MoveSide;
    math: MoveMath
    cards: Card[]

    constructor(cards:Card[] = [], math = MoveMath.ADD)
    {
        this.cards = cards;
        this.math = math;
    }

    getNumbers()
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.num);
        }
        return arr;
    }

    getSuits()
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.suit);
        }
        return arr;
    }

    getTotal()
    {
        const nums = this.getNumbers();
        let sum = nums[0];
        for(let i = 1; i < nums.length; i++)
        {
            if(this.math == MoveMath.ADD) { sum += nums[i]; }
            else if(this.math == MoveMath.SUBTRACT) { sum -= nums[i]; }
        }
        return sum;
    }

    isStack() { return this.cards.length > 1; }
    needsWager() { return this.isStack(); }
    getValue()
    {
        if(this.isStack()) { return this.getTotal(); }
        else { return this.cards[0].num; }
    }

    getIdealSide(tableCards:Hand)
    {
        const moveSuits = this.getSuits();
        const neighborLeftMatches = moveSuits.includes(tableCards.getFirstCard());
        const neighborRightMatches = moveSuits.includes(tableCards.getLastCard());
        let side = Math.random() <= 0.5 ? MoveSide.RIGHT : MoveSide.LEFT;
        if(neighborRightMatches) { side = MoveSide.RIGHT; }
        else if(neighborLeftMatches) { side = MoveSide.LEFT; }
        return side;
    }

    toString()
    {
        let str = "Play ";
        if(this.needsWager()) { str = "Wager a life, then play "; }

        const nums = this.getNumbers();
        if(this.math == MoveMath.ADD) {
            str += nums.join(" + ");
        } else {
            str += nums.join(" - ");
        }

        if(this.isStack()) {
            str += " = " + this.getTotal();
        }

        return str;
    }
}

const findPossibleMoves = (hand:Hand, table:Hand) =>
{
    const combosRaw = getAllPossibleCombinationsRaw(hand.cards);
    const combos : Move[] = [];
    for(const comboRaw of combosRaw)
    {
        combos.push(new Move(comboRaw.slice(), MoveMath.ADD));
        combos.push(new Move(comboRaw.slice(), MoveMath.SUBTRACT));
    }

    const validMoves : Move[] = [];
    for(const combo of combos)
    {
        if(combo.isStack()) {
            const total = combo.getTotal();
            if(total < 1 || total > 9) { continue; }
            if(anyMatch([total], table.getNumbers())) { continue; }
        } else {
            if(combo.math != MoveMath.ADD) { continue; } // single numbers can't have math differences
            if(anyMatch(combo.getNumbers(), table.getNumbers())) { continue; }   
        }

        validMoves.push(combo);
    }

    return validMoves;
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const o = sim.getOutputBuilder();
    o.addParagraph("These cards are on the table.");
    const numTableCards = rangeInteger(1,4);
    const tableCards = new Hand(numTableCards, true)
    o.addFlexList(await tableCards.draw(sim));

    o.addParagraph("These cards are in your hand");
    const numHandCards = rangeInteger(1,3);
    const handCards = new Hand(numHandCards, true);
    o.addFlexList(await handCards.draw(sim));

    const possibleMoves = findPossibleMoves(handCards, tableCards);
    let finalMove = null;
    if(possibleMoves.length <= 0) {
        o.addParagraph("You have <strong>no possible moves</strong>. You can give up and lose a life, or wager and hope to stay alive.");
    } else if(possibleMoves.length == 1) {
        finalMove = possibleMoves[0];
        finalMove.side = finalMove.getIdealSide(tableCards);
        o.addParagraph("Your <strong>only move</strong> is to " + finalMove.toString() + ". You play it to the <strong>" + finalMove.side + "</strong>.");
    } else {
        const maxMovesReported = 5;
        const str = (possibleMoves.length > maxMovesReported) ? "These are <strong>some</strong> of your possible moves." : "These are <strong>all</strong> your possible moves.";
        o.addParagraph(str);
        
        const selectedMoves = shuffle(possibleMoves).slice(0, maxMovesReported);

        // sort value (ascending) first, then single card vs stack first
        selectedMoves.sort((a,b) => {
            const valA = a.getValue();
            const valB = b.getValue();
            if(valA == valB) { return a.cards.length - b.cards.length; }
            return valA - valB;
        })

        const moveStrings = [];
        for(const move of selectedMoves)
        {
            moveStrings.push(move.toString());
        }
        o.addParagraphList(moveStrings);

        finalMove = selectedMoves[0];
        finalMove.side = finalMove.getIdealSide(tableCards);

        o.addParagraph("You decide to play the first option, to the <strong>" + finalMove.side + "</strong>.");
    }

    if(!finalMove) { return; }

    let neighborCard = finalMove.side == MoveSide.LEFT ? tableCards.getFirstCard() : tableCards.getLastCard();
    if(finalMove.getSuits().includes(neighborCard.suit)) {
        o.addParagraph("You match suit with its neighbor, so draw 2 cards!");
    } else {
        o.addParagraph("You don't match suit with its neighbor. Next player!");
    }
}

CONFIG._rulebook =
{
    examples:
    {
        turn:
        {
            buttonText: "Give me an example turn!",
            callback: generate
        }
    }
}

loadRulebook(CONFIG._rulebook);