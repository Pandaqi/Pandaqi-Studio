
import { toTextDrawerImageStrings, shuffle } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CONTRACTS, CardType, DYNAMIC_OPTIONS, NUMBERS, SPECIAL_CARDS, SUITS } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];

    // prepare the actual suits/numbers/icons we'll include (and reuse in action texts)
    const suitsIncluded = Object.keys(SUITS).slice(0, CONFIG.generation.numSuits);
    DYNAMIC_OPTIONS["%suit%"] = suitsIncluded;

    const numbersIncluded = NUMBERS.slice(0, CONFIG.generation.numbersUsedPerSuit);;
    DYNAMIC_OPTIONS["%number%"] = numbersIncluded;

    const suitInfoDict = {};
    for(const suit of suitsIncluded) { suitInfoDict[suit] = SUITS[suit]; }
    DYNAMIC_OPTIONS["%suitImageStrings%"] = toTextDrawerImageStrings(suitInfoDict, "suits");

    DYNAMIC_OPTIONS["%numberlow%"] = numbersIncluded.slice(0, Math.floor(0.5*numbersIncluded.length));
    DYNAMIC_OPTIONS["%numberhigh%"] = numbersIncluded.slice(Math.ceil(0.5*numbersIncluded.length));
    DYNAMIC_OPTIONS["%numbermid%"] = numbersIncluded.slice(Math.floor(0.35*numbersIncluded.length), Math.ceil(0.65*numbersIncluded.length));

    // create all the actual cards
    generatePlayingCards(cards);
    generateBaseContracts(cards);
    generateFullFlood(cards);
    generateStraightShakeContracts(cards);

    return cards;
}

const generatePlayingCards = (cards) =>
{
    if(!CONFIG.generatePlayingCards.value) { return; }

    const suitsUsed = DYNAMIC_OPTIONS["%suit%"].slice();
    const numbersUsed = DYNAMIC_OPTIONS["%number%"].slice();

    for(const suit of suitsUsed)
    {
        for(const number of numbersUsed)
        {
            const card = new Card(CardType.CARD);
            card.setSuitAndNumber(suit, number);
            cards.push(card);
        }
    }
}

const generateBaseContracts = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }
    generateContracts("base", cards);
}
    
const generateStraightShakeContracts = (cards) =>
{
    if(!CONFIG._settings.sets.straightShake.value) { return; }
    generateContracts("straightShake", cards);
}

const generateContracts = (targetSet:string, cards) =>
{
    if(!CONFIG.generateContracts.value) { return; }

    const defFreq = CONFIG.generation.defaultFrequencyContracts[targetSet] ?? 1;
    for(const [key,data] of Object.entries(CONTRACTS))
    {
        const set = data.set ?? "base";
        if(set != targetSet) { continue; }

        const freq = data.freq ?? defFreq;
        for(let i = 0; i < freq; i++)
        {
            const card = new Card(CardType.CONTRACT);
            const dynDetails = fillInDynamically(data.desc);
            card.setContract(key, dynDetails);
            cards.push(card);
        }
    }
}

const generateFullFlood = (cards) =>
{
    if(!CONFIG._settings.sets.fullFlood.value) { return; }

    const suitsUsed = DYNAMIC_OPTIONS["%suit%"].slice();
    const numbersUsed = DYNAMIC_OPTIONS["%number%"].slice();
    const allOptions = [];
    for(const suit of suitsUsed)
    {
        for(const number of numbersUsed)
        {
            allOptions.push({ suit, number });
        }
    }
    shuffle(allOptions);

    const defFreq = CONFIG.generation.defaultFrequencySpecialCards ?? 1;
    for(const [key,data] of Object.entries(SPECIAL_CARDS))
    {
        const freq = data.freq ?? defFreq;
        for(let i = 0; i < freq; i++)
        {
            const suitNumData = allOptions.pop();
            const card = new Card(CardType.SPECIAL);
            card.setSpecial(key);
            card.setSuitAndNumber(suitNumData.suit, suitNumData.number);
            cards.push(card);
        }
    }
}

const fillInDynamically = (s:string) : any[] =>
{
    const options = structuredClone(DYNAMIC_OPTIONS);
    const needles = Object.keys(options);
    let foundSomething = true;
    const dynamicDetails = [];
    while(foundSomething)
    {
        foundSomething = false;
        for(const needle of needles)
        {
            if(!s.includes(needle)) { continue; }

            const position = s.indexOf(needle);

            const randOption = shuffle(options[needle]).pop() as string;
            s = s.replace(needle, randOption);
            dynamicDetails.push({ idx: position, val: randOption });
            foundSomething = true;
            break;
        }
    }

    dynamicDetails.sort((a,b) => { return a.idx - b.idx; })
    return dynamicDetails.map((a) => a.val); // we only need values, not indices anymore
}