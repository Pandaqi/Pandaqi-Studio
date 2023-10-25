import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardData, Type } from "../js_shared/dict";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Card from "./card";
import SideData from "./sideData";
import shuffleAll from "js/pq_games/tools/random/shuffleAll";
import Bounds from "js/pq_games/tools/numbers/bounds";
import clamp from "js/pq_games/tools/numbers/clamp";

export default class CardPicker
{
    cards: Card[]

    constructor()
    {
        
    }

    get() { return this.cards; }

    generate()
    {
        // 1) assign cards to their type and count how many we have to fill
        // the "hand" type encompasses both decoration and treat
        // person cards aren't fixed in number, hand cards are
        const cardsPerType = this.getEmptyTypesObjectList();
        const numHandCards = CONFIG.generation.numHandCards;       
        const numPerType = this.getEmptyTypesObjectNumber();
        numPerType[Type.HAND] = numHandCards;

        const totalWeightPerType = this.getEmptyTypesObjectNumber();

        const allCards : Record<string,CardData> = CONFIG.allCards;
        const defPeopleFreq = CONFIG.generation.defaultPeopleFrequency;

        for(const [name,data] of Object.entries(allCards))
        {
            const subType = data.type;
            const globalType = (subType == Type.PERSON) ? Type.PERSON : Type.HAND;
            cardsPerType[globalType].push(name);

            if(globalType == Type.HAND) {
                cardsPerType[subType].push(name);
                totalWeightPerType[subType] += (1.0 / data.value) ?? 1;
            } else if(globalType == Type.PERSON) {
                const freq = data.freq ?? defPeopleFreq;
                data.freq = freq;
                numPerType[subType] += freq;   
            }                
        }

        // 2) distribute this number weighted based on the "value" of each treat/decoration type
        // (the higher their value, the less they should appear, hence the inversion above)
        // now we have a list of stuff we can just plop onto cards in random order
        const totalHandSpots = (numHandCards * 2) / (totalWeightPerType[Type.DECORATION] + totalWeightPerType[Type.TREAT]);
        numPerType[Type.DECORATION] = totalHandSpots * totalWeightPerType[Type.DECORATION];
        numPerType[Type.TREAT] = totalHandSpots * totalWeightPerType[Type.TREAT];

        const handTypes = [];
        for(const type of cardsPerType[Type.HAND])
        {
            const data = allCards[type];
            const subType = data.type;
            const val = (1.0 / data.value) ?? 1;
            const num = Math.ceil(numPerType[subType] * val);
            for(let i = 0; i < num; i++)
            {
                handTypes.push(type);
            }
        }
        shuffle(handTypes);

        // 3) create people with requirements to match (their number of icons slowly rises)
        // then, again, create the list of all icons needed divided by weight
        // so we can just plop them down in order when we create the cards
        shuffle(cardsPerType[Type.PERSON]);

        const iconsPerType = this.getEmptyTypesObjectNumber();
        const statsPerPerson = {};
        
        let counter = 0;
        const maxScore = 8;
        const iconsPerScore = CONFIG.generation.iconsPerScore;
        const maxIconsPerTypeOnPerson = CONFIG.generation.maxIconsPerTypeOnPerson;
        for(const person of cardsPerType[Type.PERSON])
        {
            // total # icons is determined by score; divide randomly over DECORATION and TREAT
            const totalIcons = Math.ceil(iconsPerScore.lerp(counter / (maxScore - 1)));
            const maxIconsPerType = Math.min(totalIcons - 1, maxIconsPerTypeOnPerson);
            const minIconsPerType = Math.max(1, totalIcons - maxIconsPerTypeOnPerson);
            let numDecoration = rangeInteger(minIconsPerType, maxIconsPerType);
            let numTreat = totalIcons - numDecoration;

            iconsPerType[Type.DECORATION] += numDecoration;
            iconsPerType[Type.TREAT] += numTreat;

            statsPerPerson[person] = 
            {
                numDecoration: numDecoration,
                numTreat: numTreat
            }

            counter++;
        }

        this.convertToWeighted(iconsPerType, totalWeightPerType);

        const personIcons = this.getEmptyTypesObjectList();
        for(const type of cardsPerType[Type.HAND])
        {
            const data = allCards[type];
            const subType = data.type;
            const val = (1.0 / data.value) ?? 1;
            const num = Math.ceil(iconsPerType[subType] * val);
            for(let i = 0; i < num; i++)
            {
                personIcons[subType].push(type);
            }
        }
        shuffleAll(personIcons);

        // 4) determine the exact types + frequency for DOUBLES and WILDCARDS (on hand cards)
        // this finalizes our side data
        const numDoubles = this.pickAllRandomNumbers(CONFIG.generation.percentageDoublesPerType, numHandCards);
        this.convertToWeighted(numDoubles, totalWeightPerType);

        const numWildcards = this.pickAllRandomNumbers(CONFIG.generation.percentageWildcardsPerType, numHandCards);
        this.convertToWeighted(numWildcards, totalWeightPerType);

        const doubleTypes = this.getEmptyTypesObjectList();
        const wildcardTypes = this.getEmptyTypesObjectList();

        for(const type of cardsPerType[Type.HAND])
        {
            const data = allCards[type];
            const subType = data.type;
            const val = (1.0 / data.value) ?? 1;

            // first doubles
            const tempNumDoubles = Math.ceil(numDoubles[subType] * val);
            for(let i = 0; i < tempNumDoubles; i++)
            {
                doubleTypes[subType].push(type);
            }

            // then wildcards
            const tempNumWildcards = Math.ceil(numWildcards[subType] * val);
            for(let i = 0; i < tempNumWildcards; i++)
            {
                wildcardTypes[subType].push(type);
            }
        }
        shuffleAll(doubleTypes);
        shuffleAll(wildcardTypes);

        const sidesData = [];
        const emptyObject = this.getEmptyTypesObjectList();
        for(let i = 0; i < numHandCards; i++)
        {
            const sideData1 = this.generateSideData(handTypes.pop(), doubleTypes, emptyObject); // only doubles, never wildcards
            const sideData2 = this.generateSideData(handTypes.pop(), emptyObject, wildcardTypes); // only wildcards, never doubles
            sidesData.push(sideData1);
            sidesData.push(sideData2);
        }
        shuffle(sidesData);

        // 5) now we have all information needed to create the actual cards
        // first the people, then the hand cards
        const cards = [];
        const scoresSoFar = [];
        for(const person of cardsPerType[Type.PERSON])
        {
            const freq = allCards[person].freq;
            const stats = statsPerPerson[person];

            const numDeco = stats.numDecoration;
            const decos = personIcons[Type.DECORATION].splice(0, numDeco);

            const numTreat = stats.numTreat;
            const treats = personIcons[Type.TREAT].splice(0, numTreat);

            let score = this.calculateScore(decos, treats);
            
            const dist = this.getDistToClosestUnusedScore(score, scoresSoFar);
            score += dist;

            const scoreAlreadyUsed = dist > 0;
            if(scoreAlreadyUsed) { this.modifyForScore(dist, decos, treats); }
            scoresSoFar.push(score);
            
            for(let i = 0; i < freq; i++)
            {
                const c = new Card(Type.PERSON);
                c.setScore(score);
                c.setPerson(person);
                c.setDecorations(decos);
                c.setTreats(treats);
                cards.push(c);
            }
        }

        for(let i = 0; i < numHandCards; i++)
        {
            const c = new Card(Type.HAND);
            const data1 = sidesData.pop();
            const data2 = this.popFirstDataOfDifferentType(sidesData, data1.type);
            c.setSides(data1, data2);
            cards.push(c);
        }

        this.cards = cards;
    }

    popFirstDataOfDifferentType(sidesData:SideData[], type:string)
    {
        for(let i = sidesData.length-1; i >= 0; i--)
        {
            if(sidesData[i].type == type) { continue; }
            const res = sidesData.splice(i, 1);
            return res[0];
        }
        return sidesData.pop();
    }

    getEmptyTypesObjectNumber()
    {
        return {
            [Type.PERSON]: 0,
            [Type.HAND]: 0,
            [Type.DECORATION]: 0,
            [Type.TREAT]: 0
        }
    }

    getEmptyTypesObjectList()
    {
        return {
            [Type.PERSON]: [],
            [Type.HAND]: [],
            [Type.DECORATION]: [],
            [Type.TREAT]: []
        }
    }

    generateSideData(type:string, doubleTypes, wildcardTypes)
    {
        const subType = CONFIG.allCards[type].type;
        const doubleIndex = doubleTypes[subType].indexOf(type);
        const wildcardIndex = wildcardTypes[subType].indexOf(type);

        const shouldDouble = doubleIndex >= 0;
        const shouldWild = wildcardIndex >= 0;

        if(shouldDouble) { doubleTypes[subType].splice(doubleIndex, 1); }
        if(shouldWild) { wildcardTypes[subType].splice(wildcardIndex, 1); } 

        const number = shouldDouble ? 2 : 1;
        const finalType = shouldWild ? CONFIG.generation.wildcardKey : type;

        return new SideData(finalType, number, subType);
    }

    convertToWeighted(dict, weights)
    {
        for(const [key,data] of Object.entries(dict))
        {
            dict[key] = (data as number) / weights[key];
        }
    }

    pickAllRandomNumbers(percentages:Record<string,Bounds>, numCards)
    {
        const obj = {};
        for(const [key,data] of Object.entries(percentages))
        {
            obj[key] = Math.ceil(data.random() * numCards);
        }
        return obj;
    }

    // @TODO: combine decos and treats into one dictionary for much easier param passing? (also in functions below)
    calculateScore(decos:string[], treats:string[])
    {
        let ideal = 0;
        for(const deco of decos) { ideal += CONFIG.allCards[deco].value; }
        for(const treat of treats) { ideal += CONFIG.allCards[treat].value; }

        const modifier = CONFIG.generation.scoreRandomness.random() * CONFIG.generation.scoreMultiplier;
        const scoreModified = ideal * modifier;

        const scoreBounds = CONFIG.generation.scoreBounds;
        const scoreClamped = clamp(Math.round(scoreModified), scoreBounds.min, scoreBounds.max);

        return scoreClamped;
    }

    getDistToClosestUnusedScore(score:number, scoresSoFar:number[])
    {
        if(!scoresSoFar.includes(score)) { return 0; }

        let minDist = 10;
        const bounds = CONFIG.generation.scoreBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            const unused = !scoresSoFar.includes(i);
            if(!unused) { continue; }
            
            const dist = (i - score);
            const smallerDist = Math.abs(dist) < Math.abs(minDist);
            if(!smallerDist) { continue; }
            
            minDist = dist;
        }

        return minDist;
    }

    modifyForScore(distance:number, decos:string[], treats:string[])
    {
        const numSteps = Math.abs(distance);
        const convertToWild = distance < 0;
        const addWild = !convertToWild;
        const key = CONFIG.generation.wildcardKey;

        let convertOptions = [];
        for(let i = 0; i < decos.length; i++) { convertOptions.push("decos"); }
        for(let i = 0; i < treats.length; i++) { convertOptions.push("treats"); }
        shuffle(convertOptions);

        let convertCounters = { decos: 0, treats: 0 };

        for(let i = 0; i < numSteps; i++)
        {
            if(addWild)
            {
                if(decos.length <= treats.length) { decos.push(key); }
                else { treats.push(key); }
                continue;
            }

            if(convertToWild)
            {
                const option = convertOptions.pop();
                if(option == "decos") { decos[convertCounters.decos] == key; }
                if(option == "treats") { decos[convertCounters.treats] == key; }
                convertCounters[option]++;
                continue;
            }
        }

    }
}