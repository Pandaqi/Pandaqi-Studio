import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import Card from "../js_game/card";
import Point from "js/pq_games/tools/geometry/point";
import CardPicker from "../js_game/cardPicker";
import Visualizer from "../js_game/visualizer";
import CONFIG from "../js_shared/config";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import { POWERS } from "../js_shared/dict";
import RulesTable, { convertDictToRulesTableDict, convertDictToRulesTableHTML } from "js/pq_rulebook/table";

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
        // sort by number of icons on the card (ascending)
        this.cards.sort((a,b) => {
            return a.cats.length - b.cats.length;
        })
    }

    count() { return this.cards.length; }
    cutoff(num:number) { this.cards = shuffle(this.cards.slice(0, num)); this.sort(); }

    getFirstCard() { return this.cards[0]; }

    isValid(move:Card)
    {
        const freqs = this.countCatFrequencies();
        for(const [cat,freq] of Object.entries(freqs))
        {
            if(move.cats.includes(cat) && freq > 9) { return false; }
        }
        return true;
    }

    isPerfectNine(move:Card)
    {
        const freqs = this.countCatFrequencies();
        for(const [cat,freq] of Object.entries(freqs))
        {
            if(!move.cats.includes(cat)) { continue; }
            if(freq != 9) { continue; }
            return true;
        }
        return false;
    }

    countCatFrequencies()
    {
        const dict : Record<string,number> = {};
        for(const card of this.cards)
        {
            for(const cat of card.cats)
            {
                if(!(cat in dict)) { dict[cat] = 0; }
                dict[cat]++;
            }
        }
        return dict;
    }

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

const findPossibleMoves = (hand:Hand, table:Hand) : Hand =>
{
    const allMoves = hand.cards;
    const validMoves = [];
    for(const move of allMoves)
    {
        const tableClone = table.clone();
        tableClone.add(move);
        if(!tableClone.isValid(move)) { continue; }
        validMoves.push(move);
    }

    return new Hand().fromCards(validMoves);
}

async function generate()
{
    await resLoader.loadPlannedResources();

    if(cardPicker.cards.length <= 0)
    {
        cardPicker.generate();
        cardPicker.removeCardsBelow(3); // this is just to make sure we have a variety of possible situations with only a few cards in each example
    }

    const cardOptions = shuffle(cardPicker.get()).slice();
    console.log(cardOptions);

    o.addParagraph("These cards are on the table.");
    const numTableCards = rangeInteger(3,5);
    const tableCards = new Hand().fromNum(numTableCards, cardOptions)
    o.addFlexList(await tableCards.draw());

    o.addParagraph("These cards are in your hand");
    const numHandCards = rangeInteger(2,4);
    const handCards = new Hand().fromNum(numHandCards, cardOptions);
    o.addFlexList(await handCards.draw());

    const possibleMoves = findPossibleMoves(handCards, tableCards);
    if(possibleMoves.count() <= 0) {
        o.addParagraph("You have <strong>no possible moves</strong>. All of these cards make a cat appear more than 9 times. You can give up and lose a life, or wager and hope to be able to play something then.");
    } else {
        o.addParagraph("These are <strong>all</strong> of your possible moves.");
        o.addFlexList(await possibleMoves.draw());

        let bestMove = possibleMoves.getFirstCard();
        let perfectNine = false;
        for(const move of possibleMoves.cards)
        {
            const tableClone = tableCards.clone();
            tableClone.add(move);
            if(!tableClone.isPerfectNine(move)) { continue; }
            bestMove = move;
            perfectNine = true;
            break;
        }

        o.addParagraph("You decide to play <strong>option " + (possibleMoves.cards.indexOf(bestMove) + 1) + ".</strong>");

        if(perfectNine) {
            o.addParagraph("Congratulations! You made a cat appear exactly 9 times. You may stop taking turns for the rest of this round.");
        } else {
            o.addParagraph("Next player!");
        }
    }
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoad("cats", CONFIG.assets.cats)

const visualizer = new Visualizer(resLoader, new Point(600, 840), false);

CONFIG.includeLifeCards = false;
const cardPicker = new CardPicker();

const rtConversion = { heading: "label" };
const rtParams = { sheetURL: CONFIG.assetsBase + CONFIG.assets.powers.path };

const powersLimited = {};
const powersAll = {};
for(const [key,data] of Object.entries(POWERS))
{
    if(data.core) { powersLimited[key] = data; }
    else { powersAll[key] = data; }
}

const node = convertDictToRulesTableHTML(powersLimited, rtConversion, rtParams);
document.getElementById("powers-rules-table-limited").appendChild(node);

const node2 = convertDictToRulesTableHTML(powersAll, rtConversion, rtParams);
document.getElementById("powers-rules-table-advanced").appendChild(node2);

// I don't want to force a fixed order/blockage when loading different scripts,
// so for now, whenever I dynamically add content, also refresh
// @TODO: Possible solution = don't load the rulebook as a separate auto-script, but as part of THIS script.
// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }