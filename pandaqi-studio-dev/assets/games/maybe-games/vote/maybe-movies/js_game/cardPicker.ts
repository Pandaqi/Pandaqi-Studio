import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { BLOCKBUSTERS, CardType, DYNAMIC_OPTIONS, ICONS, MAIN_TEXTS, MovieDetails, MovieType, TextDetails } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import fromArray from "js/pq_games/tools/random/fromArray";
import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];

        this.generateBaseCards();
        this.generateBlockbusterCards();

        console.log(this.cards);
    }

    drawRandomTextDetails(mainTexts) : TextDetails
    {
        const mainType = getWeighted(MAIN_TEXTS);
        if(!mainTexts[mainType]) { mainTexts[mainType] = {}; }

        let options = mainTexts[mainType].list ?? [];
        if(options.length <= 0)
        { 
            options = shuffle(MAIN_TEXTS[mainType].list.slice());
            mainTexts[mainType].list = options;
        }

        const option = options.pop();
        return { main: mainType, option: option };
    }

    drawBalancedIcon(stats:Record<string,number>)
    {
        const maxDistBetweenFreqs = CONFIG.generation.costMaxDistBetweenFreqs ?? 4;

        // find least used icon
        let leastUsedIcon = null;
        let leastUsedFreq = Infinity;
        for(const icon of Object.keys(ICONS))
        {
            const freq = stats[icon] ?? 0;
            if(freq >= leastUsedFreq) { continue; }
            leastUsedFreq = freq;
            leastUsedIcon = icon;
        }

        // check how bad the situation is
        // any icons still close to it are still considered as valid options
        const iconOptions = [];
        for(const icon of Object.keys(ICONS))
        {
            const freq = stats[icon] ?? 0;
            const dist = Math.abs(freq - leastUsedFreq);
            if(dist > maxDistBetweenFreqs) { continue; }
            iconOptions.push(icon);
        }

        return fromArray(iconOptions);
    }

    drawBalancedDetails(stats:Record<string, number>) : MovieDetails
    {
        let num = CONFIG.generation.costIconNumBounds.randomInteger();

        const icons = [];
        for(let i = 0; i < num; i++)
        {
            const newIcon = this.drawBalancedIcon(stats);
            icons.push(newIcon);
            this.registerDetailStats(stats, newIcon)
        }

        const profitModifier = CONFIG.generation.profitModifier.random();
        const profitBounds = CONFIG.generation.profitBounds;
        const profit = Math.min(Math.max( Math.round(icons.length * profitModifier), profitBounds.min), profitBounds.max);

        return { costIcons: icons, profit: profit };
    }

    registerDetailStats(stats:Record<string,number>, icon: string)
    {
        if(!stats[icon]) { stats[icon] = 0; }
        stats[icon] += 1;
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        const num = CONFIG.generation.numMovieCards;
        const mainTexts = {};

        // pre-create the array of all movie details (exact icons + profit in one object)
        const details = [];
        const stats = {};
        for(let i = 0; i < num; i++)
        {
            details.push( this.drawBalancedDetails(stats) );
        }
        shuffle(details);

        // create movie cards by combining a cost, a profit, and random content
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(CardType.MOVIE, MovieType.MOVIE);
            newCard.setMovieDetails( details.pop() );
            newCard.setTextDetails( this.drawRandomTextDetails(mainTexts) );
            this.cards.push(newCard);
        }

        console.log("== (DEBUGGING) CARD STATS ==");
        console.log(stats);
    }

    
    fillDynamicEntry(s:string, needles = DYNAMIC_OPTIONS, resourcePicker:BalancedFrequencyPickerWithMargin = null)
    {
        let foundNeedle = true;
        const hasPicker = resourcePicker != null;
        while(foundNeedle)
        {
            foundNeedle = false;
            for(const needle of Object.keys(needles))
            {
                if(!s.includes(needle)) { continue; }
                foundNeedle = true;

                if(hasPicker && needle == "%resource%")
                {
                    s = s.replace(needle, resourcePicker.pickNext());
                    continue;
                }
                
                // @NOTE: this does NOT pop the option off the needles, to save me from cloning/slicing that object all the time for no benefit
                const options = shuffle(needles[needle].slice());
                s = s.replace(needle, fromArray(options));
            }
        }
        return s;
    }

    drawBalancedDetailsBlockbuster(pickerCost, pickerProfit) : MovieDetails
    {
        const costKey = getWeighted(BLOCKBUSTERS.cost);
        const costText = this.fillDynamicEntry(BLOCKBUSTERS.cost[costKey].desc, undefined, pickerCost);

        const profitKey = getWeighted(BLOCKBUSTERS.profit);
        const profitText = this.fillDynamicEntry(BLOCKBUSTERS.profit[profitKey].desc, undefined, pickerProfit);

        return { costText, profitText };
    }

    generateBlockbusterCards()
    {
        if(!CONFIG.sets.blockbusterBudgets) { return; }

        const numCards = CONFIG.generation.numBlockbusterCards;
        const allIconOptions = DYNAMIC_OPTIONS["%resource%"];
        const pickerCost = new BalancedFrequencyPickerWithMargin({ 
            options: allIconOptions,
            maxDist: 1
        });
        const pickerProfit = new BalancedFrequencyPickerWithMargin({ 
            options: allIconOptions,
            maxDist: 1
        });

        const details = [];
        for(let i = 0; i < numCards; i++)
        {
            details.push( this.drawBalancedDetailsBlockbuster(pickerCost, pickerProfit) );
        }
        shuffle(details);

        const mainTexts = {};
        for(let i = 0; i < numCards; i++)
        {
            const newCard = new Card(CardType.MOVIE, MovieType.MOVIE);
            newCard.setMovieDetails( details.pop() );
            newCard.setTextDetails( this.drawRandomTextDetails(mainTexts) );
            this.cards.push(newCard);
        }
    }
}