import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardType, ICONS, MAIN_TEXTS, MovieDetails, MovieType, TextDetails } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import fromArray from "js/pq_games/tools/random/fromArray";

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

    generateBlockbusterCards()
    {
        if(!CONFIG.sets.blockbusterBudgets) { return; }

        // @TODO => fairly draw/dynamically determine these blockbuster rules, then add to cards
        // Can only write this code once I actually know all the options for this and what they need

        const mainTexts = {};
        const num = CONFIG.generation.numBlockbusterCards;
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(CardType.MOVIE, MovieType.MOVIE);
            newCard.setTextDetails( this.drawRandomTextDetails(mainTexts) );
            this.cards.push(newCard);
        }
    }
}