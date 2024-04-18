import Bounds from "js/pq_games/tools/numbers/bounds";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardType, DecreeType, ICONS, LawType, SideDetails } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];

        this.generateBaseCards();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

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
        const statsGood = {};
        const statsBad = {};
        for(let i = 0; i < numResourceCards; i++)
        {
            resourceSides.push( this.drawBalancedSideDetails(statsGood, statsBad));
        }

        // pre-create list of laws
        const laws = [];
        const lawTypeDist:Record<string,number> = CONFIG.generation.lawTypeDistribution;
        const numLawCards = freqData[DecreeType.LAW];
        for(const [key,freq] of Object.entries(lawTypeDist))
        {
            const subType = key as LawType;
            const num = Math.ceil(numLawCards * freq);
            for(let i = 0; i < num; i++)
            {
                // @TODO: actually draw that random law + dynamically fill in details
                // We probably need to re-use that "drawBalanced" with stats thingy again to make sure values are filled in fairly
                // So just make this a GLOBAL function/class in PQ-Games
                const randLaw = null;
                laws.push(randLaw);
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
                this.cards.push(newCard);

                if(subType == DecreeType.LAW) { 
                    newCard.setLaw(laws.pop()); 
                } else if(subType == DecreeType.SUPPORT) { 
                    const num1 = supportNumbers.good.pop();
                    const num2 = supportNumbers.bad.pop();
                    newCard.setSides( this.createSidesObject(num1, num2, "support") );
                } else if(subType == DecreeType.RESOURCE) {
                    newCard.setSides( resourceSides.pop() );
                }
            }
        }
    }

    createSidesObject(numGood:number, numBad:number, type:string)
    {
        const s : SideDetails = { good: [], bad: [] };
        for(let i = 0; i < numGood; i++)
        {
            s.good.push(type);
        }

        for(let i = 0; i < numBad; i++)
        {
            s.bad.push(type);
        }
        return s;
    }

    drawBalancedIcon(stats:Record<string,number>)
    {
        const maxDistBetweenFreqs = CONFIG.generation.maxDistBetweenIconFreqs ?? 3;
        const possibleResources = Object.keys(ICONS);

        // find least used icon
        let leastUsedIcon = null;
        let leastUsedFreq = Infinity;
        for(const icon of possibleResources)
        {
            const freq = stats[icon] ?? 0;
            if(freq >= leastUsedFreq) { continue; }
            leastUsedFreq = freq;
            leastUsedIcon = icon;
        }

        // check how bad the situation is
        // any icons still close to it are still considered as valid options
        const iconOptions = [];
        for(const icon of possibleResources)
        {
            const freq = stats[icon] ?? 0;
            const dist = Math.abs(freq - leastUsedFreq);
            if(dist > maxDistBetweenFreqs) { continue; }
            iconOptions.push(icon);
        }

        return fromArray(iconOptions);
    }

    drawBalancedSideDetails(statsGood:Record<string, number>, statsBad:Record<string,number>) : SideDetails
    {
        const numGood = CONFIG.generation.numResourceIconsBounds.randomInteger();
        const numBad = new Bounds(Math.max(1, numGood-2), numGood).randomInteger();

        const goodIcons = [];
        for(let i = 0; i < numGood; i++)
        {
            const newIcon = this.drawBalancedIcon(statsGood);
            goodIcons.push(newIcon);
            this.registerDetailStats(statsGood, newIcon)
        }

        const badIcons = [];
        for(let i = 0; i < numBad; i++)
        {
            const newIcon = this.drawBalancedIcon(statsBad);
            badIcons.push(newIcon);
            this.registerDetailStats(statsBad, newIcon)
        }

        return { good: goodIcons, bad: badIcons };
    }

    registerDetailStats(stats:Record<string,number>, icon: string)
    {
        if(!stats[icon]) { stats[icon] = 0; }
        stats[icon] += 1;
    }

}