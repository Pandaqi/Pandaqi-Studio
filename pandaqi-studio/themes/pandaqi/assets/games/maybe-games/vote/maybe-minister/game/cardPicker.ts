
import { toTextDrawerImageStrings, shuffle, BalancedFrequencyPickerWithMargin, getWeighted, Bounds, fromArray } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CardType, DYNAMIC_OPTIONS, DecreeType, ICONS, IconData, LAWS, LawData, LawDataRaw, LawType, LawVibe, ResourceVibe, SPECIAL_RESOURCES, SideDetails } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];

    preparePossibleIcons();

    generateBaseCards(cards);
    generateAbstainLaws(cards);
    generateAdvancedCards(cards);

    return cards;
}

const preparePossibleIcons = () =>
{
    const iconDict:Record<string,IconData> = {};
    for(const [key,data] of Object.entries(ICONS))
    {
        const set = data.set ?? "base";
        if(set == "never") { continue; }
        if(set != "always" && !CONFIG._settings.sets[set].value) { continue; }
        iconDict[key] = data;
    }

    if(CONFIG.includeWildcard)
    {
        iconDict.wildcard = ICONS.wildcard;
    }

    DYNAMIC_OPTIONS["%resource%"] = Object.keys(iconDict);
    DYNAMIC_OPTIONS["%resourceImageStrings%"] = toTextDrawerImageStrings(iconDict, "misc");
}

const generateBaseCards = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    // collect final data needed
    const freqData:Record<string,number> = CONFIG.generation.numDecreeCardsPerType;
    let totalNumCards = 0;
    for(const freq of Object.values(freqData))
    {
        totalNumCards += freq;
    }

    // pre-create list of max-vote-capacities
    const storageData:Record<string, number> = CONFIG.generation.maxVoteStorageDistribution;
    const maxVoteStorages = [];
    for(const [key,freq] of Object.entries(storageData))
    {
        const num = Math.ceil(totalNumCards * freq);
        for(let i = 0; i < num; i++)
        {
            maxVoteStorages.push(parseInt(key));
        }
    }
    shuffle(maxVoteStorages);

    // pre-create list of support numbers
    // (config dist already ensures good numbers are higher on average than bad)
    const supportNumbers = { good: [], bad: [] };
    const numSupportCards = freqData[DecreeType.SUPPORT];
    const numSupportNumbersNeededPerSide = numSupportCards;
    for(const [side,arr] of Object.entries(supportNumbers))
    {
        const supportNumDist:Record<string,number> = CONFIG.generation.supportNumberDistribution[side];

        for(const [key,freq] of Object.entries(supportNumDist))
        {
            const num = Math.ceil(numSupportNumbersNeededPerSide * freq);
            for(let i = 0; i < num; i++)
            {
                arr.push(parseInt(key));
            }
        }
    }
    shuffle(supportNumbers.good);
    shuffle(supportNumbers.bad);

    // pre-create list of sides (good + bad resources)
    const resourceSides = [];
    const numResourceCards = freqData[DecreeType.RESOURCE];
    const pickerGood = new BalancedFrequencyPickerWithMargin({ 
        options: DYNAMIC_OPTIONS["%resource%"], 
        maxDist: CONFIG.generation.maxDistBetweenIconFreqs ?? 2
        });

    const pickerBad = pickerGood.clone(true);
    for(let i = 0; i < numResourceCards; i++)
    {
        resourceSides.push( drawBalancedSideDetails(pickerGood, pickerBad));
    }

    //
    // pre-create list of laws
    //

    // sort them based on type for easy option selection later
    const lawsAllowed = filterLaws("base");
    const lawsPerType = {};
    for(const [key,data] of Object.entries(lawsAllowed))
    {
        const types = !Array.isArray(data.type) ? [data.type] : data.type;
        for(const type of types)
        {
            if(!lawsPerType[type]) { lawsPerType[type] = {}; }
            lawsPerType[type][key] = data;
        }
    }

    // sort scoring laws based on GOOD/BAD vibe as well (this is an exception, override structure from before)
    const scoringLaws:Record<string, Record<string,LawData>> = structuredClone(lawsPerType[LawType.SCORING]);
    lawsPerType[LawType.SCORING] = { [LawVibe.GOOD]: {}, [LawVibe.BAD]: {} };
    for(const [key,data] of Object.entries(scoringLaws))
    {
        const vibe = data.vibe;
        lawsPerType[LawType.SCORING][vibe][key] = data;
    }

    // go through all types and select exactly as many laws as needed
    const laws = [];
    const lawTypeDist:Record<string,number> = CONFIG.generation.lawTypeDistribution;
    const numLawCards = freqData[DecreeType.LAW];

    const pickerGoodLaws = new BalancedFrequencyPickerWithMargin({ 
        options: DYNAMIC_OPTIONS["%resourceImageStrings%"], 
        maxDist: 0
    });
    const pickerBadLaws = pickerGoodLaws.clone(true);
    const percBadVibeLaws = CONFIG.generation.percentageBadVibesLaws;

    for(const [key,freq] of Object.entries(lawTypeDist))
    {
        const subType = key as LawType;
        if(!(subType in lawsPerType)) { continue; }

        const num = Math.ceil(numLawCards * freq);
        const isScoring = subType == LawType.SCORING;
        for(let i = 0; i < num; i++)
        {
            // scoring cards create a X% / Y% split on GOOD/BAD vibes (heavily leaning towards more GOOD ones, as you need these to score)
            // they draw randomly, but filling in the entries uses a picker to make sure each resource appears equally often (and no resource is way easier/harder to score)
            if(isScoring) {
                const whichVibe = i < (percBadVibeLaws*num) ? LawVibe.BAD : LawVibe.GOOD;
                const whichPicker = (whichVibe == LawVibe.GOOD) ? pickerGoodLaws : pickerBadLaws;
                const relatedDict = lawsPerType[subType][whichVibe];
                const lawKey = getWeighted(relatedDict);
                const lawData = LAWS[lawKey].desc;
                const obj = fillDynamicEntry(lawData, DYNAMIC_OPTIONS, whichPicker);
                obj.rawData.key = lawKey;
                laws.push(obj);
                continue;
            }

            // otherwise, just draw randomly from options, fill in randomly, that's all fine
            const lawKey = getWeighted(lawsPerType[subType]);
            const lawData = LAWS[lawKey].desc;
            const obj = fillDynamicEntry(lawData);
            obj.rawData.key = lawKey;
            laws.push(obj);
        }
    }
    shuffle(laws);

    // create the actual cards, with slight tweaks per subType
    // based on all lists we already generated (in a balanced way) above
    for(const [key,freq] of Object.entries(freqData))
    {
        const subType = key as DecreeType;
        for(let i = 0; i < freq; i++)
        {
            const newCard = new Card(CardType.DECREE, subType);
            newCard.setVoteStorage(maxVoteStorages.pop());
            cards.push(newCard);

            if(subType == DecreeType.LAW) { 
                newCard.setLaw(laws.pop()); 
            } else if(subType == DecreeType.SUPPORT) { 
                const num1 = supportNumbers.good.pop();
                const num2 = supportNumbers.bad.pop();
                newCard.setSides( createSidesObject(num1, num2, "support") );
                if(num1 == 1) { newCard.setVoteStorage(2); }
            } else if(subType == DecreeType.RESOURCE) {
                newCard.setSides( resourceSides.pop() );
            }
        }
    }

    // @DEBUGGING: stats for me
    console.log("== (DEBUGGING) Resource Stats (Good, Bad)");
    console.log(pickerGood.getStats());
    console.log(pickerBad.getStats());

    console.log("== (DEBUGGING) Law Stats (Good, Bad)");
    console.log(pickerGoodLaws.getStats());
    console.log(pickerBadLaws.getStats());
}

const createSidesObject = (numGood:number, numBad:number, type:string) =>
{
    const s : SideDetails = { goodIcons: [], badIcons: [] };
    for(let i = 0; i < numGood; i++)
    {
        s.goodIcons.push(type);
    }

    for(let i = 0; i < numBad; i++)
    {
        s.badIcons.push(type);
    }
    return s;
}

const drawBalancedSideDetails = (pickerGood, pickerBad) : SideDetails =>
{
    const numGood = CONFIG.generation.numResourceIconsBounds.randomInteger();
    const numBad = new Bounds(Math.max(1, numGood-2), numGood).randomInteger();

    const goodIcons = pickerGood.pickMultiple(numGood);
    const badIcons = pickerBad.pickMultiple(numBad);

    return { goodIcons, badIcons };
}

const drawBalancedSideDetailsSpecial = (pickerGood, pickerBad, options) : SideDetails =>
    {
        const goodKey = getWeighted(options.good);
        const goodObj = fillDynamicEntry(options.good[goodKey].desc, DYNAMIC_OPTIONS, pickerGood);

        const badKey = getWeighted(options.bad);
        const badObj = fillDynamicEntry(options.bad[badKey].desc, DYNAMIC_OPTIONS, pickerBad);

        return { goodText: goodObj.resultString, badText: badObj.resultString };
    }

const filterLaws = (setTarget:string) : Record<string, LawData> =>
{
    const lawsAllowed = {};
    for(const [key,data] of Object.entries(LAWS))
    {
        const set = data.set ?? "base";
        if(set != setTarget) { continue; }
        lawsAllowed[key] = data;
    }
    return lawsAllowed;
}

const fillDynamicEntry = (s:string, needles = DYNAMIC_OPTIONS, resourcePicker:BalancedFrequencyPickerWithMargin = null) =>
{
    let foundNeedle = true;
    
    const hasPicker = resourcePicker != null;
    const resourcesAlreadyPicked = [];
    const replacements = {};

    const registerReplacement = (key:string, val:any) => {
        if(!replacements[key]) { replacements[key] = []; }
        replacements[key].push(val);
    }

    while(foundNeedle)
    {
        foundNeedle = false;
        for(const needle of Object.keys(needles))
        {
            if(!s.includes(needle)) { continue; }
            
            foundNeedle = true;

            if(hasPicker && needle == "%resource%")
            {
                let elem = resourcePicker.pickNext();

                // @NOTE: to prevent silly duplicates of the same resource in one text/action
                if(resourcesAlreadyPicked.includes(elem)) { elem = resourcePicker.pickAny([elem]); } 
                
                s = s.replace(needle, elem);
                resourcesAlreadyPicked.push(elem);
                registerReplacement(needle, elem);
                continue;
            }
            
            // @NOTE: this does NOT pop the option off the needles, to save me from cloning/slicing that object all the time for no benefit
            const options = shuffle(needles[needle].slice());
            const randOption = fromArray(options) as string;
            s = s.replace(needle, randOption);
            registerReplacement(needle, randOption);
        }
    }

    const resultString = s;
    const rawData:LawDataRaw = { key: "", replacements: replacements };
    return { resultString, rawData };
}

const fillArrayWithLeastDuplicates = (num:number, options:any[]) =>
{
    let arr = [];
    while(arr.length < num)
    {
        arr = arr.concat(options);
    }
    shuffle(arr);
    return arr;
}

const generateAbstainLaws = (cards) =>
{
    if(!CONFIG._settings.sets.abstain.value) { return; }

    // filter laws for this expansion
    // + create a list long enough to cover all cards, with as little duplicates as possible
    const numCards = CONFIG.generation.numAbstainLaws;
    const lawsAllowed = filterLaws("abstain");
    const laws = fillArrayWithLeastDuplicates(numCards, Object.keys(lawsAllowed));

    // dynamically fill in the entries needed
    for(let i = 0; i < laws.length; i++)
    {
        const lawKey = laws[i];
        const lawData = LAWS[lawKey];
        const obj = fillDynamicEntry(lawData.desc);
        obj.rawData.key = lawKey;
        laws[i] = obj;
    }
    shuffle(laws);
    
    // assign to created cards
    for(let i = 0; i < numCards; i++)
    {
        const newCard = new Card(CardType.DECREE, DecreeType.LAW);
        newCard.setLaw(laws.pop());
        cards.push(newCard);
    }
}

const generateAdvancedCards = (cards) =>
{
    if(!CONFIG._settings.sets.advanced.value) { return; }

    // filter law cards for this expansion
    // + create a list long enough to cover all cards, with as little duplicates as possible
    const numLawCards = CONFIG.generation.numAdvancedCardsLaw;
    const lawsAllowed = filterLaws("advanced");
    const laws = fillArrayWithLeastDuplicates(numLawCards, Object.keys(lawsAllowed));

    // fairly fill in the many dynamic resources on these cards
    const resourcePicker = new BalancedFrequencyPickerWithMargin({ 
        options: DYNAMIC_OPTIONS["%resourceImageStrings%"], 
        maxDist: 1
    });
    for(let i = 0; i < laws.length; i++)
    {
        const lawKey = laws[i];
        const lawData = LAWS[lawKey];
        const obj = fillDynamicEntry(lawData.desc, DYNAMIC_OPTIONS, resourcePicker);
        obj.rawData.key = lawKey;
        laws[i] = obj;
    }
    shuffle(laws);
    
    // create final law cards according to that
    for(let i = 0; i < numLawCards; i++)
    {
        const newCard = new Card(CardType.DECREE, DecreeType.LAW);
        newCard.setLaw( laws.pop() );
        cards.push(newCard);
    }

    // draw randomly from SPECIAL_RESOURCES
    // to fill the goodText and badText of these cards' sides
    const pickerGood = new BalancedFrequencyPickerWithMargin({ 
        options: DYNAMIC_OPTIONS["%resourceImageStrings%"], 
        maxDist: 1
    });
    const pickerBad = pickerGood.clone(true);

    const specialResourcesPerType = { [ResourceVibe.GOOD]: {}, [ResourceVibe.BAD]: {} };
    for(const [key,data] of Object.entries(SPECIAL_RESOURCES))
    {
        const vibe = data.vibe as ResourceVibe;
        specialResourcesPerType[vibe][key] = data;
    }

    const numRegularCards = CONFIG.generation.numAdvancedCardsRegular;
    const sides = [];
    for(let i = 0; i < numRegularCards; i++)
    {
        sides.push( drawBalancedSideDetailsSpecial(pickerGood, pickerBad, specialResourcesPerType) )
    }
    shuffle(sides);

    // pre-create list of max-vote-capacities
    const storageData:Record<string, number> = CONFIG.generation.maxVoteStorageDistribution;
    const maxVoteStorages = [];
    for(const [key,freq] of Object.entries(storageData))
    {
        const num = Math.ceil(numRegularCards * freq);
        for(let i = 0; i < num; i++)
        {
            maxVoteStorages.push(parseInt(key));
        }
    }
    shuffle(maxVoteStorages);

    // then just make the cards again based on what we already determined
    for(let i = 0; i < numRegularCards; i++)
    {
        const newCard = new Card(CardType.DECREE, DecreeType.RESOURCE);
        newCard.setVoteStorage( maxVoteStorages.pop() );
        newCard.setSides( sides.pop() );
        cards.push(newCard);
    }
}