import arraysAreDuplicates from "js/pq_games/tools/collections/arraysAreDuplicates";
import CONFIG from "../js_shared/config";
import { CATS, POWERS, Type } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }

    generate()
    {
        this.cards = [];
        this.generateCatCards();
        this.generateLifeCards();
    }

    getCombosRecursively(options:string[], spaceLeft:number)
    {
        if(spaceLeft <= 0) { return [[]]; } // this is the point of return in this recursive chain
        if(options.length <= 0) { return null; } // we have space left, but no options? Invalid combo!

        options = options.slice();
        const option = options.pop();

        const results = [];
        for(let i = 0; i <= spaceLeft; i++)
        {
            const arr = [];
            for(let a = 0; a < i; a++)
            {
                arr.push(option);
            }

            const newSpaceLeft = spaceLeft - i;
            const remainder = this.getCombosRecursively(options, newSpaceLeft);
            if(!remainder) { continue; }

            for(const elem of remainder)
            {
                let arrCopy = arr.slice();
                arrCopy.push(elem);
                results.push(arrCopy.flat());
            }
        }

        return results;
    }

    generateCatCards()
    {
        if(!CONFIG.includeCatCards) { return; }

        const maxCatsOnComboCard = 4; // @DEBUGGING: keep it low to prevent hanging/infinite loop issues
        const maxCatsOnRegularCard = 9;

        // get ALL possible combos
        const combos = [];
        for(let i = 0; i <= maxCatsOnRegularCard; i++) { combos.push([]); }

        const options = [];
        const optionsNoCombo = [];
        for(const [key,data] of Object.entries(CATS))
        {
            if(data.excludeFromCombos) { optionsNoCombo.push(key); continue; }
            options.push(key);
        }

        for(let i = 1; i <= maxCatsOnComboCard; i++)
        {
            combos[i] = this.getCombosRecursively(options, i);
        }

        // create all non-combo cards
        for(const option of optionsNoCombo)
        {
            for(let i = 1; i <= maxCatsOnRegularCard; i++)
            {
                const arr = new Array(i).fill(option);
                combos[i].push(arr);
            }
        }

        const countEntries = (a) =>
        {
            let sum = 0;
            for(const elem of a)
            {
                if(Array.isArray(elem)) { sum += elem.length; }
                else { sum += 1; }
            }
            return sum;
        }

        console.log("[Generator] # Combos: " + countEntries(combos));

        for(const comboLayer of combos)
        {
            for(const combo of comboLayer)
            {
                const newCard = new Card(Type.CAT);
                newCard.cats = combo;
                this.cards.push(newCard);
            }
        }
    }

    generateFullPowersDictionary()
    {
        const powersToRemove = [];
        const powersToAdd = {};

        const catOptions = Object.keys(CATS);
        const powerDict = structuredClone(POWERS);
        for(const [key,data] of Object.entries(powerDict))
        {
            if(!data.reqs || data.reqs.length <= 0) { continue; }
            
            powersToRemove.push(key);

            const reqs = data.reqs;

            let options = catOptions.slice();
            for(const option of options)
            {
                let key1 = key + "_" + option;
                
                if(reqs.length == 2) {
                    for(const option2 of options)
                    {
                        if(option2 == option) { continue; }
                        const dataCopy = structuredClone(data);
                        let key2 = key1 + "_" + option2;
                        dataCopy.reqs = [option, option2];
                        powersToAdd[key2] = dataCopy;
                    }
                } else {
                    const dataCopy = structuredClone(data);
                    dataCopy.reqs = [option];
                    powersToAdd[key1] = dataCopy;
                }
            }
        }

        for(const power of powersToRemove)
        {
            delete powerDict[power];
        }

        for(const [key,data] of Object.entries(powersToAdd))
        {
            powerDict[key] = data;
        }

        return powerDict;
    }

    generateLifeCards()
    {
        if(!CONFIG.includeLifeCards) { return; }

        const powers = this.generateFullPowersDictionary();
        const numCards = CONFIG.generation.lifeCards.num;
        
        const cardTypes = [];

        // include each power at least once
        for(const key of Object.keys(powers))
        {
            cardTypes.push(key);
        }

        // then just draw randomly based on probability
        while(cardTypes.length < numCards)
        {
            const randType = getWeighted(powers);
            cardTypes.push(randType);
        }

        for(const type of cardTypes)
        {
            const newCard = new Card(Type.LIFE);
            newCard.power = type;
            newCard.data = powers[type];
            this.cards.push(newCard);
        }
    }
}