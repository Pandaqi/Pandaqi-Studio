import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { BLOCKBUSTERS, CardType, DYNAMIC_OPTIONS, ICONS, MAIN_TEXTS, MovieDetails, MovieType, TextDetails } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import fromArray from "js/pq_games/tools/random/fromArray";
import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import toTextDrawerImageStrings from "js/pq_games/tools/text/toTextDrawerImageStrings";

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

    drawBalancedDetails(iconPicker: BalancedFrequencyPickerWithMargin, numIcons:number) : MovieDetails
    {
        const icons = [];
        for(let i = 0; i < numIcons; i++)
        {
            icons.push( iconPicker.pickNext() );
        }

        const profitModifier = CONFIG.generation.profitModifier.random();
        const profitBounds = CONFIG.generation.profitBounds;
        const profit = Math.min(Math.max( Math.round(icons.length * profitModifier), profitBounds.min), profitBounds.max);

        return { costIcons: icons, profit: profit };
    }

    getIconOptions(setTarget:string = "base")
    {
        const allOptions = Object.keys(ICONS);
        const arr = [];
        for(const option of allOptions)
        {
            const set = ICONS[option].set;
            if(set != setTarget) { continue; }
            arr.push(option);
        }
        return arr;
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        const num = CONFIG.generation.numMovieCards;
        const mainTexts = {};

        const iconOptions = this.getIconOptions("base");

        // pre-create the array of all movie details (exact icons + profit in one object)
        const numIconsPerCard = [];
        const costDist:Record<number,number> = CONFIG.generation.costIconNumDist;
        for(const [key,freq] of Object.entries(costDist))
        {
            const numInstances = Math.ceil(freq * num);
            for(let i = 0; i < numInstances; i++)
            {
                numIconsPerCard.push(parseInt(key));
            }
        }
        shuffle(numIconsPerCard);

        const iconPicker = new BalancedFrequencyPickerWithMargin({
            options: iconOptions,
            maxDist: CONFIG.generation.costMaxDistBetweenFreqs ?? 4
        })

        const details = [];
        const stats = {};
        for(let i = 0; i < num; i++)
        {
            details.push( this.drawBalancedDetails(iconPicker, numIconsPerCard.pop()) );
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
        console.log(iconPicker.getStats());
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

        const iconOptions = this.getIconOptions("base"); // @TODO: what to do here? do I ever use the other icons I made?
        const iconOptionsDict = {};
        for(const option of iconOptions)
        {
            iconOptionsDict[option] = ICONS[option];
        }
        DYNAMIC_OPTIONS["%resource%"] = toTextDrawerImageStrings(iconOptionsDict, "misc");

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