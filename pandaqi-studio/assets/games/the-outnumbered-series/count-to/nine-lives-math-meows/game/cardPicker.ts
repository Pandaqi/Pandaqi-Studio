import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { CATS, PClass, POWERS, SUITS, Type } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor()
    {
        
    }

    get() { return this.cards; }

    generate()
    {
        this.cards = [];
        this.generateNumberCards();
        this.generateLifeCards();
    }

    generateNumberCards()
    {
        if(!CONFIG.includeNumberCards) { return; }

        for(const [key, data] of Object.entries(SUITS))
        {
            const myNumbers = data.numbers.slice();
            const cardsPerNumber = data.cardsPerNumber ?? 3;

            for(const num of myNumbers)
            {
                for(let a = 0; a < cardsPerNumber; a++)
                {
                    const newCard = new Card(Type.NUMBER, num);
                    newCard.suit = key;
                    newCard.data = data;
                    this.cards.push(newCard);
                }
            }
        }
    }

    generateFullPowerDictionary()
    {
        const entriesToAdd = {};
        const entriesToRemove = [];

        const powers = structuredClone(POWERS);
        for(const [key,data] of Object.entries(powers))
        {
            if(!data.dynamic) { continue; }
            entriesToRemove.push(key);

            let options:any[] = [3,5,7];
            let needle = "%number%";
            if(data.desc.includes("%suit%")) {
                needle = "%suit%" 
                options = Object.keys(SUITS); 
            } else if(data.desc.includes("%side%")) {
                needle = "%side%";
                options = ["left", "right"];
            }

            if(data.dynamicOptions) { options = data.dynamicOptions.slice(); }

            for(const option of options)
            {
                const entryKey = key + "_" + option;
                const entryData = structuredClone(data);
                let desc = data.desc;
                desc = desc.replace(needle, option);

                const hasTwo = desc.includes(needle);
                if(hasTwo) {
                    for(const option2 of options)
                    {
                        if(option == option2) { continue; }

                        const entryData2 = structuredClone(entryData);
                        const entryKey2 = entryKey + "_" + option2;
                        entryData2.desc = desc.replace(needle, option2);
                        entriesToAdd[entryKey2] = entryData2;
                    }
                } else {
                    entryData.desc = desc;
                    entriesToAdd[entryKey] = entryData;
                }
            }
        }

        Object.assign(powers, entriesToAdd);
        for(const removeKey of entriesToRemove)
        {
            delete powers[removeKey];
        }

        return powers;
    }

    generateLifeCards()
    {
        if(!CONFIG.includeLifeCards) { return; }

        const numCats = CONFIG.generation.lifeCards.numCats;
        const numLives = CONFIG.generation.lifeCards.numLives;
        const handLimits = CONFIG.generation.lifeCards.handLimits;
        const catNames = Object.keys(CATS);

        const powerDict = this.generateFullPowerDictionary();
        const powers = Object.keys(powerDict);

        const powersPerNumber = [];
        for(let i = 0; i < numLives; i++) { powersPerNumber.push([]); }
        for(const power of powers)
        {
            const data = powerDict[power];
            let lifeRange = data.lives ?? [];
            if(data.class)
            {
                if(data.class == PClass.LOW) { lifeRange = [1,2,3]; }
                else if(data.class == PClass.MED) { lifeRange = [4,5,6]; }
                else if(data.class == PClass.HIGH) { lifeRange = [7,8,9]; }
            }

            for(const lifeNum of lifeRange)
            {
                powersPerNumber[lifeNum-1].push(power);
            }
        }

        const shuffleAll = (list) =>
        {
            for(const elem of list) { shuffle(elem); }
        }

        const removeInAllLists = (power, powers) =>
        {
            for(const powerList of powers)
            {
                const idx = powerList.indexOf(power);
                if(idx < 0) { continue; }
                powerList.splice(idx, 1);
            }
        }

        shuffleAll(powersPerNumber);
        for(let i = 0; i < numCats; i++)
        {
            const name = catNames[i];

            for(let a = 0; a < numLives; a++)
            {
                const skip = (a == 8 && CONFIG.generation.numberCards.highestCardIsRuleReminder);

                const power = powersPerNumber[a].pop();
                if(!skip) { removeInAllLists(power, powersPerNumber); }

                const newCard = new Card(Type.LIFE, (a+1));
                newCard.cat = name;
                newCard.power = power;
                newCard.data = powerDict[power];

                if(skip) { newCard.power = null; newCard.data = {}; }

                newCard.handLimit = handLimits[a];
                this.cards.push(newCard);
            }
        }
    }
}