import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardGadgetData, CardResourceData, CardType, DYNAMIC_OPTIONS, GADGET_NAMES, IdentityCardData, IdentityCardType, MASTER_CARDS, MissionType, PUBLIC_IDENTITIES, RANDOM_TEXTS, RESOURCES, SECRET_IDENTITIES, SHOP_REWARDS, ShopType, ShopVibe } from "../js_shared/dict";
import Card from "./card";
import Bounds from "js/pq_games/tools/numbers/bounds";
import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import fromArray from "js/pq_games/tools/random/fromArray";
import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";

interface IdentityDictSorted
{
    good: Record<string,IdentityCardData>,
    bad: Record<string,IdentityCardData>
}

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];

        this.generateBaseCards();
        this.generateIdentityCards();
        this.generateShopCards();

        console.log(this.cards);
    }

    drawRandomResources(combos, combosBackup)
    {
        const d:CardResourceData = { good: [], bad: [] };
        const maxBadDiff = CONFIG.generation.maxDeviationBadIcons;

        const numIconsGood = CONFIG.generation.numResourcesPerSide.randomInteger();

        const minBad = Math.max(1, numIconsGood-maxBadDiff);
        //const maxBad = Math.min(CONFIG.generation.maxResourcesRedSide, numIconsGood);
        const maxBad = Math.max(1, numIconsGood-1); // more forward momentum, less bad stuff, feels nicer
        const numIconsBad = new Bounds(minBad, maxBad).randomInteger();

        let optionsGood = combos[numIconsGood];
        if(optionsGood.length <= 0) 
        { 
            optionsGood = shuffle(combosBackup[numIconsGood].slice()); 
            combos[numIconsGood] = optionsGood;
        }
        const iconsGood = optionsGood.pop();

        let optionsBad = combos[numIconsBad];
        if(optionsBad.length <= 0)
        { 
            optionsBad = shuffle(combosBackup[numIconsBad].slice()); 
            combos[numIconsBad] = optionsBad;
        }
        const iconsBad = optionsBad.pop();

        let iconGoodAlreadyCrossedOut = false;
        for(const icon of iconsGood)
        {
            const crossOut = iconsGood.length > 1 && Math.random() <= CONFIG.generation.goodIconFlipProb && !iconGoodAlreadyCrossedOut;
            d.good.push( { type: icon, cross: crossOut } );
            if(crossOut) { iconGoodAlreadyCrossedOut = true; }
        }

        let iconBadNotCrossedOutYet = true;
        for(const icon of iconsBad)
        {
            const crossOut = iconsBad.length <= 1 || Math.random() > CONFIG.generation.badIconFlipProb || iconBadNotCrossedOutYet;
            d.bad.push( { type: icon, cross: crossOut } );
            if(crossOut) { iconBadNotCrossedOutYet = false; }
        }

        return d;
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        // generate all combos until upper limit
        const maxNumIcons = CONFIG.generation.numResourcesPerSide.max;
        const resourceOptions = Object.keys(RESOURCES);
        const combos = [[]];
        for(let i = 1; i <= maxNumIcons; i++)
        {
            combos.push( shuffle(getAllPossibleCombinations(resourceOptions, i)) );
        }
        const combosBackup = structuredClone(combos);

        // create mission cards by drawing random pairs of combos from that
        const num = CONFIG.generation.numMissionCards;
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(CardType.MISSION, MissionType.MISSION);
            newCard.setResources( this.drawRandomResources(combos, combosBackup) );
            newCard.setRandomText( fromArray(RANDOM_TEXTS) );
            this.cards.push(newCard);
        }

        // create master cards same way, but now also add a random rule
        const numMaster = CONFIG.generation.numMasterCards;
        const allRulesOptions = Object.keys(MASTER_CARDS);
        let masterRules = [];
        while(masterRules.length < numMaster)
        {
            masterRules = masterRules.concat(allRulesOptions.slice());
        }

        for(let i = 0; i < numMaster; i++)
        {
            const newCard = new Card(CardType.MISSION, MissionType.MASTER);
            newCard.setResources( this.drawRandomResources(combos, combosBackup) );
            newCard.setRule(masterRules.pop());
            newCard.setMasterIcon( CONFIG.generation.masterCardIconsRange.randomInteger() );
            this.cards.push(newCard);
        }

        // DEBUGGING (to check if distribution is somewhat fair)
        const stats = {};
        for(const res of Object.keys(RESOURCES))
        {
            stats[res] = { freq: 0, normal: 0, cross: 0 };
        }

        const registerResource = (stats, iconData) => 
        {
            const tp = iconData.type;
            stats[tp].freq++;
            if(iconData.cross) { stats[tp].cross++; }
            else { stats[tp].normal++; }
        }

        for(const card of this.cards)
        {
            if(!card.hasResources()) { continue; }
           
            const r = card.resources;
            for(const iconData of r.good)
            {
                registerResource(stats, iconData);
            }
            
            for(const iconData of r.bad)
            {
                registerResource(stats, iconData);
            }
        }

        console.log("== RESOURCE DISTRIBUTION STATS ==");
        console.log(stats);
    }

    fillDynamicEntry(s:string, needles:Record<string, any[]>)
    {
        let foundNeedle = true;
        while(foundNeedle)
        {
            foundNeedle = false;
            for(const needle of Object.keys(needles))
            {
                if(!s.includes(needle)) { continue; }
                foundNeedle = true;
                const options = shuffle(needles[needle]);
                s = s.replace(needle, options.pop());
            }
        }
        return s;
    }

    drawRandomIdentityPowers(dict:IdentityDictSorted)
    {
        const d = { good: "", bad: "" };
        const optionGood = getWeighted(dict.good);
        const optionBad = getWeighted(dict.bad);

        // this SHOULD also make all arrays unique (".slice")
        // so we can actually .pop() options and prevent duplicates within the same card
        const replacementOptions = structuredClone(DYNAMIC_OPTIONS); 

        d.good = this.fillDynamicEntry(dict.good[optionGood].desc, replacementOptions);
        d.bad = this.fillDynamicEntry(dict.bad[optionBad].desc, replacementOptions);

        return d;
    }

    generateIdentityCards()
    {
        if(!CONFIG.sets.identities) { return; }

        // sort the data into GOOD and BAD
        const dictSecret:IdentityDictSorted = { good: {}, bad: {} };
        for(const [key,data] of Object.entries(SECRET_IDENTITIES))
        {
            dictSecret[data.type][key] = data;
        }

        const dictPublic:IdentityDictSorted = { good: {}, bad: {} };
        for(const [key,data] of Object.entries(PUBLIC_IDENTITIES))
        {
            dictPublic[data.type][key] = data;
        }

        // then create the cards and randomly assign what we have (in a balanced way)
        const num = CONFIG.generation.numIdentityCardsEach;
        for(let i = 0; i < num; i++)
        {
            const secretID = new Card(CardType.IDENTITY, IdentityCardType.PRIVATE);
            secretID.setPowers( this.drawRandomIdentityPowers(dictSecret) );
            this.cards.push(secretID);

            const publicID = new Card(CardType.IDENTITY, IdentityCardType.PUBLIC);
            publicID.setPowers( this.drawRandomIdentityPowers(dictPublic) );
            this.cards.push(publicID);
        }
    }

    generateShopCards()
    {
        if(!CONFIG.sets.gadgets) { return; }

        // sort the data into GREEN and RED
        const numCards = CONFIG.generation.numShopCards;
        const dict = { [ShopVibe.GREEN]: {}, [ShopVibe.RED]: {} };
        for(const [key,data] of Object.entries(SHOP_REWARDS))
        {
            dict[data.vibe][key] = data; 
        }

        // pre-create list of all green-red shop combinations
        // we balance the resources used for paying, but otherwise allow pretty much complete randomness
        const sides:CardGadgetData[] = [];
        const resourceOptions = Object.keys(RESOURCES);
        const picker = new BalancedFrequencyPickerWithMargin({
            options: resourceOptions,
            maxDist: CONFIG.generation.shopCardsMaxFrequencyDist ?? 3
        });

        let gadgetNames = [];
        for(let i = 0; i < numCards; i++)
        {
            const numGreen = CONFIG.generation.shopCardsCostBounds.randomInteger();
            const numRed = CONFIG.generation.shopCardsCostBounds.randomInteger();

            if(gadgetNames.length <= 2)
            {
                gadgetNames = GADGET_NAMES.slice();
                shuffle(gadgetNames);
            }

            const greenKey = getWeighted(dict[ShopVibe.GREEN]);
            const greenData = {
                cost: picker.pickMultiple(numGreen),
                reward: dict[ShopVibe.GREEN][greenKey].desc,
                label: gadgetNames.pop()
            }

            const redKey = getWeighted(dict[ShopVibe.RED]);
            const redData = {
                cost: picker.pickMultiple(numRed),
                reward: dict[ShopVibe.RED][redKey].desc,
                label: gadgetNames.pop()
            }

            sides.push({ green: greenData, red: redData });
        }
        shuffle(sides);

        // then create the cards, assigning what we already generated
        for(let i = 0; i < numCards; i++)
        {
            const newCard = new Card(CardType.SHOP, ShopType.SHOP);
            newCard.setGadgets( sides.pop() );
            this.cards.push(newCard);
        }
    }
}