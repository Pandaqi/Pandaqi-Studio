import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardResourceData, CardType, DYNAMIC_OPTIONS, IdentityCardData, IdentityCardType, MASTER_CARDS, MissionType, PUBLIC_IDENTITIES, RESOURCES, SECRET_IDENTITIES } from "../js_shared/dict";
import Card from "./card";
import Bounds from "js/pq_games/tools/numbers/bounds";
import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import getWeighted from "js/pq_games/tools/random/getWeighted";

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
        //this.generateGadgetCards();

        console.log(this.cards);
    }

    drawRandomResources(combos, combosBackup)
    {
        const d:CardResourceData = { good: [], bad: [] };
        const maxBadDiff = CONFIG.generation.maxDeviationBadIcons;

        const numIconsGood = CONFIG.generation.numResourceIcons.randomInteger();
        const numIconsBad = new Bounds( Math.max(1, numIconsGood-maxBadDiff), numIconsGood).randomInteger();

        const optionsGood = combos[numIconsGood];
        if(optionsGood.length <= 0) { combos[numIconsGood] = shuffle(combosBackup[numIconsGood].slice()); }

        const optionsBad = combos[numIconsBad];
        if(optionsBad.length <= 0) { combos[numIconsBad] = shuffle(combosBackup[numIconsBad].slice()); }

        const iconsGood = optionsGood.pop();
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
        const maxNumIcons = CONFIG.generation.maxNumIconsPerSide;
        const resourceOptions = Object.keys(RESOURCES);
        const combos = [];
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
            this.cards.push(newCard);
        }
    }

    fillDynamicEntry(s:string)
    {
        let foundNeedle = true;
        const needles = DYNAMIC_OPTIONS;
        while(foundNeedle)
        {
            foundNeedle = false;
            for(const needle of Object.keys(needles))
            {
                if(!s.includes(needle)) { continue; }
                foundNeedle = true;
                const options = shuffle(needles[needle].slice());
                s.replace(needle, options.pop());
            }
        }
        return s;
    }

    drawRandomIdentityPowers(dict:IdentityDictSorted)
    {
        const d = { good: "", bad: "" };
        const optionGood = getWeighted(dict.good);
        const optionBad = getWeighted(dict.bad);

        d.good = this.fillDynamicEntry(dict.good[optionGood].desc);
        d.bad = this.fillDynamicEntry(dict.bad[optionBad].desc);

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
}