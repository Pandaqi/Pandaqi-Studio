import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import { CardData, SETS } from "../js_shared/dict"
import fromArray from "js/pq_games/tools/random/fromArray";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Card from "../js_game/card";
import PowerChecker from "../js_shared/powerChecker";
import getWeighted from "js/pq_games/tools/random/getWeighted";

const CONFIG =
{
    debugSpecificSet: "expert", // @DEBUGGING (should be null)
    debugSimulate: false, // @DEBUGGING (should be false)
    numSimulations: 10000,

    fontFamily: "Pettingill",
    cardSize: new Point(480, 672),
    possibleCards: {},
    setsWeighted: {
        starter: { prob: 10 },
        beginner: { prob: 5 },
        amateur: { prob: 2.5 },
        advanced: { prob: 1 },
        expert: { prob: 0.5 }
    }
}


class Round
{
    cards: Card[]
    checker: PowerChecker

    constructor(cards = [])
    {
        this.cards = cards;
        this.checker = new PowerChecker();
    }

    count() { return this.cards.length; }
    addCard(c:Card) { this.cards.push(c); }
    generate(size:number)
    {
        const arr = [];
        for(let i = 0; i < size; i++)
        {
            const randType = fromArray(Object.keys(CONFIG.possibleCards));
            const newCard = new Card(randType, CONFIG.possibleCards[randType]);
            newCard.fill();
            arr.push(newCard);
        }
        this.cards = arr;
        return this;
    }

    async draw(set = this.cards)
    {
        const arr = [];
        for(const card of set)
        {
            arr.push(card.drawForRules(CONFIG));
        }
        return await Promise.all(arr);
    }

    getPoisonedFood()
    {
        const trueCards = this.getTrueCards();
        const highest = this.getHighest(trueCards);
        return highest;
    }

    getTrueCards()
    {
        return this.checker.getTrueCards(this.cards.slice());
    }

    getHighest(list:Card[])
    {
        const highestNum = Math.max(...list.map(o => o.num));
        const arr = [];
        for(const elem of list)
        {
            if(elem.num != highestNum) { continue; }
            arr.push(elem);
        }
        return arr;
    }
}

async function generate()
{
    let setName = CONFIG.debugSpecificSet ?? getWeighted(CONFIG.setsWeighted);
    const set : Record<string,CardData> = SETS[setName];
    CONFIG.possibleCards = set;

    for(const [key,data] of Object.entries(set))
    {
        if(data.rulesDisabled && !CONFIG.debugSimulate) { delete set[key]; }
    }

    if(CONFIG.debugSimulate)
    {
        const stats = { NONE: 0 };
        for(let i = 0; i < CONFIG.numSimulations; i++)
        {
            const numCards = rangeInteger(4,6);
            const round = new Round().generate(numCards);
            const result = round.getPoisonedFood();
            if(!result || result.length <= 0) { stats.NONE++; continue; }

            const poisonedFood = result[0].food;
            if(!(poisonedFood in stats)) { stats[poisonedFood] = 0; }
            stats[poisonedFood]++;
        }

        console.log(stats);
        return;
    }

    // > cards on the table
    const numCards = rangeInteger(4,6);
    o.addParagraph("These cards were played");
    const round = new Round().generate(numCards);
    o.addFlexList(await round.draw());

    const cardsTrue = round.getTrueCards();
    if(cardsTrue.length <= 0) { o.addParagraph("No card is true. Smash your own card!"); return; }

    // > which cards are true
    o.addParagraph("All these cards are TRUE");
    o.addFlexList(await round.draw(cardsTrue));

    if(cardsTrue.length == 1) { o.addParagraph("Smash that card to win the round!"); return; }

    // > which of those has the highest number
    const cardsHighest = round.getHighest(cardsTrue);
    o.addParagraph("Multiple are true, so search for the highest number:");
    o.addFlexList(await round.draw(cardsHighest));
    o.addParagraph("Smash that card to win the round!");

    if(cardsHighest.length != 1) 
    { 
        console.error("[PLAYFUL EXAMPLE] Exactly one card should be highest! But I received " + cardsHighest); 
    }  
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();