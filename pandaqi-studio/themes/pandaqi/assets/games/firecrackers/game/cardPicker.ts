import { shuffle } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CardMainType, CardType, PACKS, SCORING_RULES } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    const packs = CONFIG._settings.packs.value;

    // playing cards (per pack)
    for(const pack of packs)
    {
        const data = PACKS[pack];
        const numbers:Record<number, number> = data.numbers ?? CONFIG.generation.defNumberDistribution;
        const actionsPossible : string[] = shuffle(data.actions ?? []);
        const actionPercentages = data.actionPercentages ?? CONFIG.generation.defActionPercentages;
        let actionIndexCounter = 0;
        for(const [num,freq] of Object.entries(numbers))
        {
            const numInt = parseInt(num);
            const numActions = Math.ceil(actionPercentages[numInt] * freq);
            const actionList = drawAlternate(actionsPossible, numActions, actionIndexCounter);
            actionIndexCounter += numActions;

            for(let i = 0; i < freq; i++)
            {
                const action = i < actionList.length ? actionList[i] : null;
                const card = new Card(CardMainType.PLAY, pack as CardType, numInt, action);
                cards.push(card);
            }
        }
    }

    // scoreworks cards (if enabled)
    if(CONFIG._settings.scoreCards.value)
    {
        for(const [key,data] of Object.entries(SCORING_RULES))
        {
            const card = new Card(CardMainType.SCORE, CardType.BLACK, 0, key);
            cards.push(card);
        }
    }

    return cards;
}

// this is for the simulation, not material generation
export const getStarterDecks = (cards:Card[], numPlayers:number) : Card[][] =>
{
    const highPlayerCount = (numPlayers >= CONFIG.generation.starterDeck.highPlayerCountThreshold);

    let numStartColors = CONFIG.generation.starterDeck.numColors;
    if(highPlayerCount) { numStartColors = CONFIG.generation.starterDeck.numColorsHighPlayerCount; }

    const startColors = Object.keys(PACKS).slice(0, numStartColors) as CardType[];
    const sets = [];
    const allCards = shuffle(cards.slice());
    const validCards = [];

    for(const card of allCards)
    {
        const coloredActionCard = card.hasAction() && card.type != CardType.BLACK;
        if(coloredActionCard && !highPlayerCount) { continue; }
        validCards.push(card);
    }

    const startColFreq = CONFIG.generation.starterDeck.colorFreq;
    let blackFreq = CONFIG.generation.starterDeck.numBlack;
    if(highPlayerCount) { blackFreq = CONFIG.generation.starterDeck.numBlackHighPlayerCount; }

    for(let i = 0; i < numPlayers; i++)
    {
        const set = [];
        for(const col of startColors)
        {
            for(let a = 0; a < startColFreq; a++)
            {
                const card = getFirstOfType(validCards, col);
                set.push(card);
            }
        }

        for(let a = 0; a < blackFreq; a++)
        {
            const blackCard = getFirstOfType(validCards, CardType.BLACK);
            set.push(blackCard);
        }

        sets.push(set);
    }
    return sets;
}

const getFirstOfType = (options:Card[], type:CardType) =>
{
    for(let i = 0; i < options.length; i++)
    {
        const card = options[i];
        if(card.type != type) { continue; }
        options.splice(i, 1);
        return card;
    }
    return null;
}

export const setNumPacks = (cards:Card[], num:number) =>
{
    const allPacks = Object.keys(PACKS);
    allPacks.splice(allPacks.indexOf("black"), 1);
    const finalPacks = shuffle(allPacks).slice(0,num);
    finalPacks.push("black");

    return cards.filter((x) => finalPacks.includes(x.type));
}

const drawAlternate = (options:string[], num:number, startIndex:number) =>
{
    const numOptions = options.length;
    const arr = [];
    if(numOptions <= 0) { return arr; }
    let counter = startIndex % numOptions;
    while(arr.length < num)
    {
        arr.push(options[counter]);
        counter = (counter + 1) % numOptions;
    }
    return arr;
}