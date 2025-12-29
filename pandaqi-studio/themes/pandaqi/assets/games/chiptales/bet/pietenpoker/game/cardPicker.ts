
import { shuffle, fromArray } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { ACTIEPIETEN, CardType, ColorType } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
   const  cards = [];
    
    generateBasisspel(cards);
    generatePietjePrecies(cards);
    generateActiePiet(cards);

    assignSpecialIconsToCards(cards);

    return cards;
}

const generateBasisspel = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    // create big sint and small sint
    cards.push(new Card(CardType.SINT, null, null, "small"));
    cards.push(new Card(CardType.SINT, null, null, "big"));

    const colors = Object.values(ColorType);
    const num = CONFIG.generation.base.numCards;
    const numPerColor = Math.ceil(num / colors.length);
    const dist : Record<number, number> = CONFIG.generation.base.numberDistribution;

    // simply create the numbers per color, equally distributed
    const allCards = [];
    for(const color of colors)
    {
        for(const [numOnCard, freqRaw] of Object.entries(dist))
        {
            const freq = Math.ceil(freqRaw * numPerColor);
            for(let i = 0; i < freq; i++)
            {
                allCards.push(new Card(CardType.REGULAR, parseInt(numOnCard), color));
            }
        }
    }
    
    // if enabled, we keep exactly the number specified, even if it means discarding cards randomly
    if(CONFIG.generation.base.generateExactNumber)
    {
        shuffle(allCards);
        cards.push(...allCards.splice(0,num));
    }
}

const getRandomActionNumber = () : number =>
{
    return CONFIG.generation.actiepiet.cardNumbers.randomInteger();
}

const getRandomActionColor = () : ColorType =>
{
    return fromArray(CONFIG.generation.actiepiet.cardColors);
}

const generatePietjePrecies = (cards) =>
{
    if(!CONFIG._settings.sets.pietjePrecies.value) { return; }

    const num = CONFIG.generation.pietjePrecies.numCards;
    for(let i = 0; i < num; i++)
    {
        cards.push(new Card(CardType.ACTION, getRandomActionNumber(), getRandomActionColor(), "pietje_precies"));
    }
}

const generateActiePiet = (cards) =>
{
    if(!CONFIG._settings.sets.actiepiet.value) { return; }

    const freqDefault = CONFIG.generation.actiepiet.defaultFrequency;
    for(const [key,data] of Object.entries(ACTIEPIETEN))
    {
        const freq = data.freq ?? freqDefault;
        for(let i = 0; i < freq; i++)
        {
            cards.push(new Card(CardType.ACTION, getRandomActionNumber(), getRandomActionColor(), key));
        }
    }
}

const assignSpecialIconsToCards = (cards) =>
{
    const numNeeded = cards.length;
    const surpriseIcons = [];
    const bidIcons = [];
    for(let i = 0; i < numNeeded; i++)
    {
        surpriseIcons.push( i/numNeeded < CONFIG.generation.icons.surprisePercentage );
        bidIcons.push( i/numNeeded < CONFIG.generation.icons.bidPercentage );
    }
    
    shuffle(bidIcons);
    shuffle(surpriseIcons);
    
    for(const card of cards)
    {
        card.hasSurpriseIcon = surpriseIcons.pop();
        card.hasBidIcon = bidIcons.pop();
    }
}