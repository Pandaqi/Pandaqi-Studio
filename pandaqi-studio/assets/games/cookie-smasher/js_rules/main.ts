import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import { CardData, SETS } from "../js_shared/dict"
import fromArray from "js/pq_games/tools/random/fromArray";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Card from "../js_game/card";
import PowerChecker from "../js_shared/powerChecker";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import createRandomSet from "../js_shared/createRandomSet";
import { getIndexOfProp } from "../js_shared/queries";
import RulesSettings, { SettingsType } from "js/pq_rulebook/examples/rulesSettings";

const CONFIG =
{
    debugSpecificSet: null, // @DEBUGGING (should be null)
    debugSimulate: false, // @DEBUGGING (should be false)
    numSimulationsSets: 1000,
    numSimulations: 1000,

    fontFamily: "pettingill",
    itemSize: new Point(480, 672),
    possibleCards: {},
    setsWeighted: {
        starter: { prob: 10 },
        beginner: { prob: 5 },
        amateur: { prob: 2.5 },
        advanced: { prob: 1 },
        expert: { prob: 0.5 },
        random: { prob: 0.25 }
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

    hasDuplicateNumbers()
    {
        for(let i = 0; i < this.cards.length; i++)
        {
            const card = this.cards[i];
            const idx = getIndexOfProp(this.cards, "num", card.num);
            if(idx != i) { return true; }
        }
        return false;
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

const determineSet = () =>
{
    let setName = CONFIG.debugSpecificSet ?? settings.get("set");
    let set : Record<string, CardData> = SETS[setName];
    if(setName == "random") { set = createRandomSet(); }
    CONFIG.possibleCards = set;

    for(const [key,data] of Object.entries(set))
    {
        if(data.rulesDisabled && !CONFIG.debugSimulate) { delete set[key]; }
    }
}

const checkSimulation = () =>
{
    if(!CONFIG.debugSimulate) { return false; }

    const cardPoisoned = { NONE: 0 };
    const cardFreq = { NONE: CONFIG.numSimulationsSets };

    for(let i = 0; i < CONFIG.numSimulationsSets; i++)
    {
        determineSet();

        // count the fact we used that card in a set
        for(const [key,data] of Object.entries(CONFIG.possibleCards))
        {
            if(!(key in cardFreq)) { cardFreq[key] = 0; }
            cardFreq[key]++;
        }

        // count how often each type is the poisoned food
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

        for(const [key,data] of Object.entries(stats))
        {
            if(!(key in cardPoisoned)) { cardPoisoned[key] = 0; }
            cardPoisoned[key] += data;
        }
    }

    // now assemble POISON and FREQUENCY stats into an accurate probability (given as PERCENTAGE)
    // "how often, when this card was in the set, was it the poisoned one?"
    const finalStats : Record<string,number> = {};
    let mean = 0;
    for(const [key,data] of Object.entries(cardPoisoned))
    {
        const howOftenItOccured = CONFIG.numSimulations * cardFreq[key];
        const howOftenItWasPoisoned = data;
        const val = Math.round((howOftenItWasPoisoned / howOftenItOccured) * 100);
        finalStats[key] = val;
        mean += val;
    }

    const numElements = Object.keys(finalStats).length;
    mean /= numElements;

    let mse = 0;
    let bestElem = null, bestVal = -Infinity;
    let worstElem = null, worstVal = Infinity;
    for(const [key,data] of Object.entries(finalStats))
    {
        mse += Math.pow(data - mean, 2);
        if(data > bestVal) { bestVal = data; bestElem = key; }
        if(data < worstVal) { worstVal = data; worstElem = key; }
    }
    mse /= numElements;

    console.log("MEAN: " + mean);
    console.log("MSE: " + mse);
    console.log("STANDARD DEVIATION: " + Math.sqrt(mse));
    console.log("BEST: " + bestElem + " with " + bestVal);
    console.log("WORST: " + worstElem + " with " + worstVal);

    console.log(finalStats);
    return true;
}

async function generate()
{
    const result = checkSimulation();
    if(result) { return; }

    determineSet();

    // > cards on the table
    const numCards = rangeInteger(4,6);
    o.addParagraph("These cards were played. (Imagine they're in a circle. The first card is from the king.)");
    const round = new Round().generate(numCards);
    o.addFlexList(await round.draw());

    const cardsTrue = round.getTrueCards();
    if(cardsTrue.length <= 0) { o.addParagraph("No card is true. Smash your own card!"); return; }

    // > which cards are true
    const duplicateNumbers = round.hasDuplicateNumbers();
    let str = "The following cards are TRUE.";
    if(duplicateNumbers) { str += " (If numbers are duplicate, only the first is evaluated.)"; }
    o.addParagraph(str);
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

const settings = new RulesSettings();
settings.add({ id: "set", type: SettingsType.ENUM, values: ["starter", "beginner", "amateur", "advanced", "expert", "random"], label: "Card Set?" });
e.attachSettings(settings);

const o = e.getOutputBuilder();