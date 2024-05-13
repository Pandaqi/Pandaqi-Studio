import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import Visualizer from "../js_game/visualizer";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import Card from "../js_game/card";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import CardPicker from "../js_game/cardPicker";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";

class Hand
{
    cards:Card[]

    clone() { return new Hand().fromCards(this.cards.slice()); }
    fromCards(c:Card[]) { this.cards = c; this.sort(); return this; }
    fromNum(num:number, allOptions:Card[])
    {
        const cards = [];
        for(let i = 0; i < num; i++)
        {
            cards.push(allOptions.pop());
        }
        return this.fromCards(cards);
    }

    add(c:Card) { this.cards.push(c); }
    remove(c:Card) { this.cards.splice(this.cards.indexOf(c), 1); }
    sort()
    {
        this.cards.sort((a,b) => { return a.num - b.num; })
    }

    count() { return this.cards.length; }
    getFirstCard() { return this.cards[0]; }

    async draw()
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.drawForRules(visualizer));
        }
        const canvases = await Promise.all(promises);

        const imgs = await convertCanvasToImageMultiple(canvases);
        return imgs;
    }
}

const getPossibleMoves = (hand:Hand, table:Hand) =>
{
    const arr = [];
    const leadingSuit = table.getFirstCard().suit;
    for(const card of hand.cards)
    {
        if(card.suit != leadingSuit) { continue; }
        arr.push(card);
    }
    return arr;
}

const getHighest = (list:Card[]) =>
{
    let highest = null;
    let highestNum = 0;
    for(const elem of list)
    {
        if(elem.num < highestNum) { continue; }
        highestNum = elem.num;
        highest = elem;
    }
    return highest;
}

const getFinalMove = (hand:Hand, table:Hand, possibleMoves:Card[], trumpSuit:string|null, bidSuit:string|null) =>
{
    if(possibleMoves.length > 0) { return getHighest(possibleMoves); }

    let candidates = [];
    for(const elem of hand.cards)
    {
        if(elem.suit != trumpSuit) { continue; }
        if(elem.suit == bidSuit) { continue; }
        candidates.push(elem);
    }

    if(candidates.length <= 0) { candidates = hand.cards.slice(); }
    return getHighest(candidates);
}

const getWinningCard = (table:Hand, trumpSuit:string|null, bidSuit:string|null) =>
{
    const leadingSuit = table.getFirstCard().suit;
    const cards = table.cards.slice();

    const yourCardIsIgnored = cards[cards.length-1].suit == bidSuit;
    const feedback = [];
    if(yourCardIsIgnored) { cards.pop(); feedback.push("You played a card in your own bid suit, so it is ignored."); }

    const trumps = [];
    for(const card of cards)
    {
        if(card.suit != trumpSuit) { continue; }
        trumps.push(card);
    }

    if(trumps.length > 0)
    {
        feedback.push("Trump was played, so highest trump wins.");
        return [getHighest(trumps), feedback];
    }

    const matching = [];
    for(const card of cards)
    {
        if(card.suit != leadingSuit) { continue; }
        matching.push(card);
    }

    feedback.push("Leading suit was " + leadingSuit + ". So the highest card in that suit wins.");
    return [getHighest(matching), feedback];
}

const stringifyList = (hand:Hand, moves:Card[]) =>
{    
    let arr = [];
    for(const move of moves)
    {
        const idx = hand.cards.indexOf(move);
        arr.push(idx + 1);
    }

    if(arr.length <= 1) { return arr[0]; }

    let str = "";
    for(let i = 0; i < arr.length; i++)
    {
        let postfix = ", ";
        if(i == arr.length-1) { postfix = ""; }
        if(i == arr.length-2) { postfix = " and "}
        str += arr[i] + postfix;
    }
    return str;
}

const stringifyCard = (card:Card) =>
{
    return card.num + " of " + card.suit;
} 

const drawMatchingSuitsWithProb = (options:Card[], suits:string[], num:number, prob:number) =>
{
    const arr = [];
    let leadingSuit = null;
    for(let i = 0; i < num; i++)
    {
        let newCard:Card;
        if(!leadingSuit) {
            newCard = options.pop();
            leadingSuit = newCard.suit;
        } else {
            const findMatch = Math.random() <= prob;
            if(!findMatch) { newCard = options.pop(); }
            else {
                for(let a = 0; a < options.length; a++)
                {
                    newCard = options[a];
                    if(newCard.suit != leadingSuit) { continue; }
                    options.splice(a, 1);
                    break;
                }
            }
        }

        arr.push(newCard);
    }
    return arr;
}

async function generate()
{
    await resLoader.loadPlannedResources(); // should only do something on first load

    const possibleCards = shuffle(cardPicker.get().slice());
    const possibleSuits = Object.keys(CONFIG.suits);
    const includeTrumpAndBid = Math.random() <= 0.25;

    const numTableCards = rangeInteger(2,4);
    const tableCards = drawMatchingSuitsWithProb(possibleCards, possibleSuits, numTableCards, 0.4);
    const table = new Hand().fromCards(tableCards);
    o.addParagraph("These cards are on the table.");
    o.addFlexList(await table.draw());

    const numHandCards = rangeInteger(2,5);
    const hand = new Hand().fromNum(numHandCards, possibleCards);
    o.addParagraph("Your hand looks like this.");
    o.addFlexList(await hand.draw());

    let trumpSuit = null; 
    let bidSuit = null;

    if(includeTrumpAndBid) 
    {
        const possibleTrumpSuits = [];
        const possibleBidSuits = [];
        const allCards = table.cards.slice().concat(hand.cards.slice());
        for(const card of allCards)
        {
            possibleTrumpSuits.push(card.suit);
            possibleBidSuits.push(card.suit);
        }

        trumpSuit = fromArray(possibleSuits);
        bidSuit = fromArray(possibleSuits);

        o.addParagraph("The <strong>trump</strong> suit ( = bid card of leading player) is <strong>" + trumpSuit + "</strong>. Your own <strong>bid suit</strong> is <strong>" + bidSuit + "</strong>.");
    }

    const possibleMoves = getPossibleMoves(hand, table);
    let str = "You must follow the leading suit, so you can only play <strong>card " + stringifyList(hand, possibleMoves) + "</strong>";
    if(possibleMoves.length <= 0)
    {
        str = "You must follow the leading suit, but you can't! So, you may play <em>any card</em>."
    }
    o.addParagraph(str);

    const finalMove = getFinalMove(hand, table, possibleMoves, trumpSuit, bidSuit);
    const finalMoveIndex = (hand.cards.indexOf(finalMove) + 1);

    //const trumpOrBidMatters = includeTrumpAndBid && (finalMove.suit == trumpSuit || finalMove.suit == bidSuit);

    o.addParagraph("You decide to play card " + finalMoveIndex + " from your hand (" + stringifyCard(finalMove) + ").");

    table.add(finalMove); // permanently execute this move

    const [winningCard,reasons] = getWinningCard(table, trumpSuit, bidSuit);
    const winningCardIndex = table.cards.indexOf(winningCard) + 1;
    const winningCardString = (winningCardIndex == table.cards.length) ? "your card!" : "card " + winningCardIndex + " (" + stringifyCard(winningCard) + ").";

    o.addParagraph("As it stands now, this trick is won by <strong>" + winningCardString + "</strong> Why?");
    o.addParagraphList(reasons);
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

CONFIG.includePowers = false;
CONFIG.suits = { hearts: true, spades: true, diamonds: true, clubs: true };

const cardPicker = new CardPicker();
cardPicker.generate();

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoad("cats", CONFIG.assets.cats);
resLoader.planLoad("suits", CONFIG.assets.suits);

const visualizer = new Visualizer(resLoader, new Point(480, 600), false);

