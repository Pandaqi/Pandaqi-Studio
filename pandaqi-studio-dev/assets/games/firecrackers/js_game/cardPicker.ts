import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import CONFIG from "../js_shared/config";
import { CardType, PACKS } from "../js_shared/dict";
import Card from "./card";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class CardPicker
{
    cards: Card[]
    packs: CardType[]

    constructor() {}
    get() { return this.cards; }
    generate()
    {
        this.cards = [];

        if(!this.packs) { this.readPacksFromConfig(); }

        for(const pack of this.packs)
        {
            const data = PACKS[pack];
            const numbers:Record<number, number> = data.numbers ?? CONFIG.generation.defNumberDistribution;
            const actionsPossible = shuffle(data.actions ?? []);
            const actionPercentages = data.actionPercentages ?? CONFIG.generation.defActionPercentages;
            let actionIndexCounter = 0;
            for(const [num,freq] of Object.entries(numbers))
            {
                const numInt = parseInt(num);
                const numActions = Math.ceil(actionPercentages[numInt] * freq);
                const actionList = this.drawAlternate(actionsPossible, numActions, actionIndexCounter);
                actionIndexCounter += numActions;

                for(let i = 0; i < freq; i++)
                {
                    const action = i < actionList.length ? actionList[i] : null;
                    const card = new Card(pack, numInt, action);
                    this.cards.push(card);
                }
            }
        }
    }

    getStarterDecks(numPlayers:number)
    {
        const highPlayerCount = (numPlayers >= CONFIG.generation.starterDeck.highPlayerCountThreshold);

        let numStartColors = CONFIG.generation.starterDeck.numColors;
        if(highPlayerCount) { numStartColors = CONFIG.generation.starterDeck.numColorsHighPlayerCount; }

        const startColors = this.packs.slice(0, numStartColors);
        const sets = [];
        const allCards = shuffle(this.cards.slice());
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
                    const card = this.getFirstOfType(validCards, col);
                    set.push(card);
                }
            }

            for(let a = 0; a < blackFreq; a++)
            {
                const blackCard = this.getFirstOfType(validCards, CardType.BLACK);
                set.push(blackCard);
            }

            sets.push(set);
        }
        return sets;
    }

    getFirstOfType(options:Card[], type:CardType)
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

    readPacksFromConfig()
    {
        const packs = [];
        for(const [key,included] of Object.entries(CONFIG.packs))
        {
            if(!included) { continue; }
            packs.push(key);
        }
        this.packs = packs;
    }

    setNumPacks(num:number)
    {
        const allPacks = Object.keys(PACKS);
        allPacks.splice(allPacks.indexOf("black"), 1);
        const finalPacks = shuffle(allPacks).slice(0,num);
        finalPacks.push("black");
        this.packs = finalPacks;
    }

    drawAlternate(options:string[], num:number, startIndex:number)
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

}