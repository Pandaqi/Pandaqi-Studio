
import { seedRandom, shuffleAll, shuffle, rangeInteger, clamp, Bounds } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { createRandomSet } from "../shared/createRandomSet";
import { CardData, ReqType, SETS, Type } from "../shared/dict";
import Card from "./card";
import RequirementData from "./requirementData";
import SideData from "./sideData";

export const cardPicker = () : Card[] =>
{
    // automatically remember the texture needed
    for(const [setName,setData] of Object.entries(SETS))
    {
        for(const [cardName, cardData] of Object.entries(setData))
        {
            cardData.textureKey = setName;
        }
    }

    // save a nice reference with all cards available to use
    console.log(CONFIG);

    const peopleDict = SETS["people_" + CONFIG._settings.sets.setPeople.value] ?? createRandomSet(Type.PERSON);
    const decoDict = SETS["decorations_" + CONFIG._settings.sets.setDecorations.value] ?? createRandomSet(Type.DECORATION);
    const treatDict = SETS["treats_" + CONFIG._settings.sets.setTreats.value] ?? createRandomSet(Type.TREAT);

    console.log(decoDict);

    let dict = Object.assign({}, peopleDict);
    dict = Object.assign(dict, decoDict);
    dict = Object.assign(dict, treatDict);

    CONFIG.allCards = dict;

    const rng = seedRandom(CONFIG._settings.defaults.seed.value);

    // 1) assign cards to their type and count how many we have to fill
    // the "hand" type encompasses both decoration and treat
    // person cards aren't fixed in number, hand cards are
    const cardsPerType = getEmptyTypesObjectList();
    const numHandCards = CONFIG.generation.numHandCards;       
    const numPerType = getEmptyTypesObjectNumber();
    numPerType[Type.HAND] = numHandCards;

    const totalWeightPerType = getEmptyTypesObjectNumber();

    const allCards : Record<string,CardData> = CONFIG.allCards;
    const defPeopleFreq = CONFIG.generation.defaultPeopleFrequency;

    for(const [name,data] of Object.entries(allCards))
    {
        const subType = data.type;
        const globalType = (subType == Type.PERSON) ? Type.PERSON : Type.HAND;
        cardsPerType[globalType].push(name);

        if(globalType == Type.HAND) {
            cardsPerType[subType].push(name);
            totalWeightPerType[subType] += (1.0 / parseFloat((data.value ?? 1).toString()));
        } else if(globalType == Type.PERSON) {
            const freq = data.freq ?? defPeopleFreq;
            data.freq = freq;
            numPerType[subType] += freq;  
            
            data.maxDeco = data.maxDeco ?? Infinity;
            data.minDeco = data.minDeco ?? 1;
            data.maxTreats = data.maxTreats ?? Infinity;
            data.minTreats = data.minTreats ?? 1;
        }                
    }
    shuffleAll(cardsPerType, rng);

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
        const val = (1.0 / data.value);
        const num = Math.ceil(numPerType[subType] * val);
        for(let i = 0; i < num; i++)
        {
            handTypes.push(type);
        }
    }
    shuffle(handTypes, rng);

    // 3) create people with requirements to match (their number of icons slowly rises)
    // then, again, create the list of all icons needed divided by weight
    // so we can just plop them down in order when we create the cards
    shuffle(cardsPerType[Type.PERSON], rng);

    const iconsPerType = getEmptyTypesObjectNumber();
    const statsPerPerson = {};
    
    let counter = 0;
    const maxScore = 8;
    const iconsPerScore = CONFIG.generation.iconsPerScore;
    const maxIconsPerTypeOnPerson = CONFIG.generation.maxIconsPerTypeOnPerson;

    const maxDecosForFlip = CONFIG.generation.maxDecosForFlip;
    const maxFlipsPerSet = CONFIG.generation.maxFlipsPerSet;
    const flipProb = CONFIG.generation.decoFlipProb;
    let numFlipped = 0;

    const specialStats =
    {
        deco: 
        {
            [ReqType.CARD]: [],
            [ReqType.SET]: [],
        },
        treat:
        {
            [ReqType.CARD]: [],
            [ReqType.SET]: []
        }
    }

    const allPeopleCards = cardsPerType[Type.PERSON];
    for(const person of allPeopleCards)
    {
        // total # icons is determined by score; divide randomly over DECORATION and TREAT
        const data = allCards[person];
        const totalIcons = Math.ceil(iconsPerScore.lerp(counter / (maxScore - 1)));
        const maxIconsPerType = Math.min(totalIcons - 1, maxIconsPerTypeOnPerson);
        const minIconsPerType = Math.max(1, totalIcons - maxIconsPerTypeOnPerson);
        let numDecoration = rangeInteger(minIconsPerType, maxIconsPerType, rng);
        numDecoration = clamp(numDecoration, data.minDeco, data.maxDeco);

        let numTreat = totalIcons - numDecoration;
        numTreat = clamp(numTreat, data.minTreats, data.maxTreats);

        // add ourselves to the list if a certain special type is possible
        const specialTypes = data.allowSpecial ?? [];
        if(specialTypes.includes(ReqType.CARD)) 
        { 
            specialStats.deco[ReqType.CARD].push(person); 
            specialStats.treat[ReqType.CARD].push(person); 
        }

        if(numDecoration > 1 && numDecoration <= 4 && specialTypes.includes(ReqType.SET)) { specialStats.deco[ReqType.SET].push(person); }
        if(numTreat > 1 && numTreat <= 4 && specialTypes.includes(ReqType.SET)) { specialStats.treat[ReqType.SET].push(person); }

        // randomly flip cards to say "at most", if allowed
        const canFlip = !data.forbidFlip && numDecoration <= maxDecosForFlip;
        const wantToFlip = numFlipped < maxFlipsPerSet && Math.random() <= flipProb;
        const shouldFlip = canFlip && wantToFlip;
        if(shouldFlip) { numFlipped++; }

        statsPerPerson[person] = 
        {
            numDecoration: numDecoration,
            numTreat: numTreat,
            atMost: shouldFlip,
        }

        counter++;
    }

    
    // assigning special types happens in its own loop (after deciding the number of icons for deco/treat)
    // as that provides greater control over the number and assignment of them
    const randReq = () => { return 1 + Math.round(rng()); } // return 1 or 2

    shuffleAll(specialStats, rng);
    specialStats.deco[ReqType.SET] = specialStats.deco[ReqType.SET].slice(0, randReq());
    specialStats.deco[ReqType.CARD] = specialStats.deco[ReqType.CARD].slice(0, randReq());
    specialStats.treat[ReqType.SET] = specialStats.treat[ReqType.SET].slice(0, randReq());
    specialStats.treat[ReqType.CARD] = specialStats.treat[ReqType.CARD].slice(0, randReq());

    for(const person of allPeopleCards)
    {
        const stats = statsPerPerson[person];
        const types = [ReqType.SET, ReqType.CARD];

        let decoReqType = ReqType.TYPE;
        shuffle(types, rng);
        for(const type of types)
        {
            if(!specialStats.deco[type].includes(person)) { continue; }
            decoReqType = type;
            break;
        }

        let treatReqType = ReqType.TYPE;
        shuffle(types, rng);
        for(const type of types)
        {
            if(!specialStats.treat[type].includes(person)) { continue; }
            treatReqType = type;
            break;
        }

        if(decoReqType == ReqType.TYPE) { iconsPerType[Type.DECORATION] += stats.numDecoration; }
        if(treatReqType == ReqType.TYPE) { iconsPerType[Type.TREAT] += stats.numTreat; }

        stats.decoReqType = decoReqType;
        stats.treatReqType = treatReqType;
    }

    convertToWeighted(iconsPerType, totalWeightPerType);

    const personIcons = getEmptyTypesObjectList();
    for(const type of cardsPerType[Type.HAND])
    {
        const data = allCards[type];
        const subType = data.type;
        const val = (1.0 / data.value);
        const num = Math.ceil(iconsPerType[subType] * val);
        for(let i = 0; i < num; i++)
        {
            personIcons[subType].push(type);
        }
    }
    shuffleAll(personIcons, rng);

    // 4) determine the exact types + frequency for DOUBLES and WILDCARDS (on hand cards)
    // this finalizes our side data
    const numDoubles = pickAllRandomNumbers(CONFIG.generation.percentageDoublesPerType, numHandCards);
    convertToWeighted(numDoubles, totalWeightPerType);

    const numWildcards = pickAllRandomNumbers(CONFIG.generation.percentageWildcardsPerType, numHandCards);
    convertToWeighted(numWildcards, totalWeightPerType);

    const doubleTypes = getEmptyTypesObjectList();
    const wildcardTypes = getEmptyTypesObjectList();

    for(const type of cardsPerType[Type.HAND])
    {
        const data = allCards[type];
        const subType = data.type;
        const val = (1.0 / data.value);

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
    shuffleAll(doubleTypes, rng);
    shuffleAll(wildcardTypes, rng);

    const sidesData = [];
    const emptyObject = getEmptyTypesObjectList();
    for(let i = 0; i < numHandCards; i++)
    {
        const sideData1 = generateSideData(handTypes.pop(), doubleTypes, emptyObject); // only doubles, never wildcards
        const sideData2 = generateSideData(handTypes.pop(), emptyObject, wildcardTypes); // only wildcards, never doubles
        sidesData.push(sideData1);
        sidesData.push(sideData2);
    }
    shuffle(sidesData, rng);

    // 5) now we have all information needed to create the actual cards
    // first the people, then the hand cards
    const cards = [];
    const scoresSoFar = [];
    let useUniqueSets = false; // we flip "unique sets" to true/false every time when used, to ensure an equal spread of persons that use the SAME and UNIQUE variant of this ReqType

    for(const person of allPeopleCards)
    {
        if(!CONFIG._settings.includePeopleCards.value) { break; }

        const data = allCards[person];
        const freq = allCards[person].freq;
        const stats = statsPerPerson[person];

        const numDeco = stats.numDecoration;
        const decoList = stats.decoReqType == ReqType.TYPE ? personIcons[Type.DECORATION].splice(0, numDeco) : [];
        const decos = new RequirementData(stats.decoReqType, decoList, numDeco, useUniqueSets);
        if(stats.atMost) { decos.flip(); }
        if(decos.reqType == ReqType.SET) { useUniqueSets = !useUniqueSets; }

        const numTreat = stats.numTreat;
        const treatList = stats.treatReqType == ReqType.TYPE ? personIcons[Type.TREAT].splice(0, numTreat) : [];
        const treats = new RequirementData(stats.treatReqType, treatList, numTreat, useUniqueSets);
        if(treats.reqType == ReqType.SET) { useUniqueSets = !useUniqueSets; }

        let score = calculateScore(decos, treats);
        const dist = getDistToClosestUnusedScore(score, scoresSoFar);
        score += dist;

        const scoreAlreadyUsed = dist > 0;
        if(scoreAlreadyUsed) { modifyForScore(dist, decos, treats, rng); }
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
        if(!CONFIG._settings.includeHandCards.value) { break; }

        const c = new Card(Type.HAND);
        const data1 = sidesData.pop();
        const data2 = popFirstSuitableData(sidesData, data1, rng);
        c.setSides(data1, data2);
        cards.push(c);
    }

    return cards;
}

const determineReqType = (data:CardData, numIcons:number, numSpecial, maxSpecial, rng) =>
{
    const allowedTypes = data.allowSpecial ?? [];
    if(allowedTypes.length <= 0) { return ReqType.TYPE; }

    shuffle(allowedTypes, rng);
    let picked = ReqType.TYPE;
    for(const reqType of allowedTypes)
    {
        if(numSpecial[reqType] >= maxSpecial[reqType]) { continue; }
        if(reqType == ReqType.SET && numIcons < 2) { continue; } // sets are literally useless if only one icon
        picked = reqType;
        break;
    }

    numSpecial[picked]++;
    return picked;
}

const popFirstSuitableData = (sidesData:SideData[], otherSide:SideData, rng) =>
{
    let secondBest = sidesData.length-1;
    for(let i = sidesData.length-1; i >= 0; i--)
    {
        const data = sidesData[i];
        const sameType = data.type == otherSide.type;
        if(sameType) { continue; }
        
        const isWildcard = data.isWildcard();
        const otherIsWildcard = otherSide.isWildcard();
        const sameSubType = data.subType == otherSide.subType;

        if(sameSubType)
        {
            // it's useless to add a wildcard of the same subtype to the other side,
            // unless the sides have a different _number_
            if((otherSide.number <= 1 && isWildcard) || (data.number <= 1 && otherIsWildcard))
            {
                continue;     
            }

            // slightly prefer a split of different subtypes, but don't force it
            if(rng() <= CONFIG.generation.forceDifferentSidesProb) 
            { 
                secondBest = i;
                continue; 
            }
        } 

        const res = sidesData.splice(i, 1);
        return res[0];
    }
    
    const res = sidesData.splice(secondBest, 1);
    return res[0];
}

const getEmptyTypesObjectNumber = () =>
{
    return {
        [Type.PERSON]: 0,
        [Type.HAND]: 0,
        [Type.DECORATION]: 0,
        [Type.TREAT]: 0
    }
}

const getEmptyTypesObjectList = () =>
{
    return {
        [Type.PERSON]: [],
        [Type.HAND]: [],
        [Type.DECORATION]: [],
        [Type.TREAT]: []
    }
}

const generateSideData = (type:string, doubleTypes, wildcardTypes) =>
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

const convertToWeighted = (dict, weights) =>
{
    for(const [key,data] of Object.entries(dict))
    {
        dict[key] = (data as number) * (1 / weights[key]); // as we added weights inverted, it should also be inverted here
    }
}

const pickAllRandomNumbers = (percentages:Record<string,Bounds>, numCards:number) =>
{
    const obj = {};
    for(const [key,data] of Object.entries(percentages))
    {
        obj[key] = Math.ceil(data.random() * numCards);
    }
    return obj;
}

const calculateScore = (decos:RequirementData, treats:RequirementData) =>
{
    let ideal = 0;
    ideal += decos.getTotalValue();
    ideal += treats.getTotalValue();

    const modifier = CONFIG.generation.scoreRandomness.random() * CONFIG.generation.scoreMultiplier;
    const scoreModified = ideal * modifier;

    const scoreBounds = CONFIG.generation.scoreBounds;
    const scoreClamped = clamp(Math.round(scoreModified), scoreBounds.min, scoreBounds.max);

    return scoreClamped;
}

const getDistToClosestUnusedScore = (score:number, scoresSoFar:number[]) =>
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

const modifyForScore = (distance:number, decos:RequirementData, treats:RequirementData, rng:Function) =>
{
    const numSteps = Math.abs(distance);
    const convertToWild = distance < 0;
    const addWild = !convertToWild;
    const key = CONFIG.generation.wildcardKey;

    let convertOptions = [];
    const numDecos = decos.get().length;
    const numTreats = treats.get().length;
    for(let i = 0; i < numDecos; i++) { convertOptions.push("decos"); }
    for(let i = 0; i < numTreats; i++) { convertOptions.push("treats"); }
    shuffle(convertOptions, rng);

    let convertCounters = { decos: 0, treats: 0 };

    for(let i = 0; i < numSteps; i++)
    {
        if(addWild)
        {
            if(decos.get().length <= treats.get().length) { decos.add(key); }
            else { treats.add(key); }
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