import { CardData, SETS } from "../shared/dict"
import Card from "../game/card";
import PowerChecker from "../shared/powerChecker";
import createRandomSet from "../shared/createRandomSet";
import { Vector2, fromArray, getWeighted, rangeInteger } from "lib/pq-games";
import { InteractiveExample } from "lib/pq-rulebook";

export const CONFIG =
{
    debugSpecificSet: "starter", // @DEBUGGING (should be null)
    debugSimulate: false, // @DEBUGGING (should be false)
    numSimulationsSets: 1000,
    numSimulations: 1000,

    fontFamily: "Pettingill",
    cardSize: new Vector2(480, 672),
    possibleCards: {},
    setsWeighted: {
        starter: { prob: 10 },
        amateur: { prob: 5 },
        expert: { prob: 2.5 },
        random: { prob: 1.0 }
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
        const options = Object.keys(CONFIG.possibleCards);

        // @TODO: find better way to ensure emperor is part of sets but unpickable
        if(options.includes("emperor")) { options.splice(options.indexOf("emperor"), 1); }

        for(let i = 0; i < size; i++)
        {
            let randType = fromArray(options);
            if(i == 0) { randType = "emperor"; } // first card always emperor, for simplicity
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
    
    getEmperorEliminationData()
    {
        const cardsCopy = this.checker.cloneCards(this.cards);
        return this.checker.getEmperorEliminationData(cardsCopy);
    }

    getValidMoves(inDanger = null)
    {
        if(inDanger == null) { inDanger = this.getEmperorEliminationData().eliminated; }
        return this.checker.getValidMoves(this.cards, inDanger);
    }
}

const determineSet = () =>
{
    let setName = CONFIG.debugSpecificSet ?? getWeighted(CONFIG.setsWeighted);
    let set : Record<string, CardData> = SETS[setName];
    if(setName == "random") { set = createRandomSet(); }
    CONFIG.possibleCards = set;
}

const performSimulation = () =>
{
    const cardValid = { NONE: 0 };
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
            const result = round.getValidMoves();
            if(!result || result.length <= 0) { stats.NONE++; continue; }
    
            for(const validMove of result)
            {
                const type = validMove.card.type;
                if(!(type in stats)) { stats[type] = 0; }
                stats[type]++;
            }            
        }

        for(const [key,data] of Object.entries(stats))
        {
            if(!(key in cardValid)) { cardValid[key] = 0; }
            cardValid[key] += data;
        }
    }

    // now assemble stats into an accurate probability (given as PERCENTAGE)
    // "how often, when this card was in the set, was it the poisoned one?"
    const finalStats : Record<string,number> = {};
    let mean = 0;
    for(const [key,data] of Object.entries(cardValid))
    {
        const howOftenItOccured = CONFIG.numSimulations * cardFreq[key];
        const howOftenItWasAValidMove = data;
        const val = Math.round((howOftenItWasAValidMove / howOftenItOccured) * 100);
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

const performExample = async () =>
{
    determineSet();

    // > cards on the table
    const numCards = rangeInteger(4,6);
    o.addParagraph("These cards were played. (Imagine they're in a circle.)");
    const round = new Round().generate(numCards);
    o.addFlexList(await round.draw());

    const elimData = round.getEmperorEliminationData();
    let str = "Nothing threatens the Emperor. Let's find a card that would put them in danger (if removed).";
    if(elimData.eliminated) 
    { 
        const perp = elimData.perpetrator.person;
        const idx = elimData.index + 1;
        str = "The Emperor is in danger! (Killed by " + perp + " at position " + idx + ") Let's find a card that makes them safe (if removed).";
    }
    o.addParagraph(str);

    const validMoves = round.getValidMoves(elimData.eliminated);
    if(validMoves.length <= 0) { o.addParagraph("No such card exists. Smash the Emperor to win!"); return; }

    o.addParagraph("Below are all valid moves.");

    // @TODO: for now, we discard the REASON for valid move, but I should display that in the future
    const validMoveCards = [];
    for(const move of validMoves)
    {
        validMoveCards.push(move.card);
    }

    o.addFlexList(await round.draw(validMoveCards));
    o.addParagraph("Smash any of these to win the round!");
}

async function generate()
{
    if(CONFIG.debugSimulate) { performSimulation(); }
    else { performExample(); }    
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();