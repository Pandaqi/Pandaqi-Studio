import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { ACTIONS_THRILL, AGE_RANGES, AUTHORS, BOOK_TITLES, COLORS, CardType, SHELF_POWERS } from "../shared/dict";
import Card from "./card";
import fromArray from "js/pq_games/tools/random/fromArray";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import Bounds from "js/pq_games/tools/numbers/bounds";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        const validColors = Object.keys(COLORS);
        const bookTitles = this.getBookTitlesPerLetter();
        if(CONFIG.generateGenreCards)
        {
            for(const [color,genre] of Object.entries(CONFIG.packs))
            {
                if(!validColors.includes(color)) { continue; }
                this.generateCardsFor(bookTitles, color, (genre as string).toLowerCase());
            }        
        }
        
        if(CONFIG.packs.shelves)
        {
            this.generateBookShelves();
        }

        const bookTitlesAgain = this.getBookTitlesPerLetter();
        if(CONFIG.packs.actions)
        {
            this.generateActionCards(bookTitlesAgain);
        }

        const freqs = this.getAuthorFrequencies();
        for(const [author,freq] of Object.entries(freqs))
        {
            AUTHORS[author].freq = freq;
        }

        console.log(this.cards);
    }

    getAuthorFrequencies()
    {
        const freqs:Record<string,number> = {};
        for(const card of this.cards)
        {
            const auth = card.author;
            if(!auth) { continue; }
            if(!AUTHORS[auth]) { continue; }
            if(!freqs[auth]) { freqs[auth] = 0; }
            freqs[auth]++;
        }
        return freqs;
    }

    getBookTitlesPerLetter()
    {
        const dict:Record<string,string[]> = {};
        
        for(const [key,data] of Object.entries(BOOK_TITLES))
        {
            const firstLetter = data.initial ?? key.slice(0,1).toUpperCase();
            if(!dict[firstLetter]) { dict[firstLetter] = []; }
            dict[firstLetter].push(key);
        }

        for(const [key,data] of Object.entries(dict))
        {
            shuffle(data);
        }

        return dict;
    }

    generateCardsFor(bookTitles:Record<string,string[]>, color:string, genre:string)
    {
        // prepare some useful variables
        let cardsToGenerate = CONFIG.cards.generation.numCardsPerColor ?? 10;
        const colorData = COLORS[color];
        const lettersAvailable = colorData.letters.slice();
        const agesAvailable = Object.keys(AGE_RANGES);
        const authorsAvailable = colorData.authorsOptions.slice();

        const bookTitlesCopy = structuredClone(bookTitles);

        // before doing anything, determine our SERIES
        const authorFrequency:Record<string, number> = {};
        for(const author of colorData.authorsFixed)
        {
            if(!authorFrequency[author]) { authorFrequency[author] = 0; }
            authorFrequency[author]++;
        }

        const authorsForSeries = [];
        const minFreqForSeries = CONFIG.cards.generation.minFrequencyForSeries ?? 3;
        for(const [author,freq] of Object.entries(authorFrequency))
        {
            if(freq < minFreqForSeries) { continue; }
            authorsForSeries.push(author);
        }

        for(const author of authorsForSeries)
        {
            const randLetter = fromArray(lettersAvailable);
            const randTitle = bookTitles[randLetter].pop();
            const targetAudience = fromArray(agesAvailable);
            const freq = authorFrequency[author];
            for(let i = 0; i < freq; i++)
            {
                const seriesIndex = (i + 1);
                const newCard = new Card(CardType.BOOK, randTitle, genre, author, targetAudience, seriesIndex);
                this.cards.push(newCard);
            }

            cardsToGenerate -= freq;
            delete authorFrequency[author];
        }

        // then determine everything else (LETTERS, AGE, AUTHOR)
        const allTitles = [];
        for(const letter of lettersAvailable)
        {
            let titleOptions = bookTitles[letter];
            // in the very, very rare case that we use a letter so much we run out of titles, just use a duplicate from the backup
            if(titleOptions.length <= 0) { titleOptions = bookTitlesCopy[letter]; }
            const randTitle = titleOptions.pop();
            allTitles.push(randTitle);
        }

        while(allTitles.length < cardsToGenerate)
        {
            const randLetter = fromArray(lettersAvailable);
            let titleOptions = bookTitles[randLetter];
            if(titleOptions.length <= 0) { titleOptions = bookTitlesCopy[randLetter]; }
            const randTitle = titleOptions.pop();
            allTitles.push(randTitle);
        }
        shuffle(allTitles);

        const allAges = agesAvailable.slice();
        while(allAges.length < cardsToGenerate)
        {
            allAges.push(getWeighted(AGE_RANGES))
        }
        shuffle(allAges);

        const allAuthors = [];
        for(const [author,freq] of Object.entries(authorFrequency))
        {
            for(let i = 0; i < freq; i++)
            {
                allAuthors.push(author);
            }
        }
        shuffle(authorsAvailable);
        while(allAuthors.length < cardsToGenerate)
        {
            allAuthors.push(authorsAvailable.pop());
        }
        shuffle(allAuthors);

        // and just draw from those lists
        for(let i = 0; i < cardsToGenerate; i++)
        {
            const newCard = new Card(CardType.BOOK, allTitles.pop(), genre, allAuthors.pop(), allAges.pop());
            this.cards.push(newCard);
        }
    }

    generateActionCards(bookTitles:Record<string,string[]>)
    {
        const letters : string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        shuffle(letters);

        const defAuthor = CONFIG.cards.generation.defAuthorActionCards ?? "Anonymous";

        for(const [key,data] of Object.entries(ACTIONS_THRILL))
        {
            const freq = data.freq ?? CONFIG.cards.generation.defFrequencyActionCards;
            for(let i = 0; i < freq; i++)
            {
                const letter = letters.pop();
                const randTitle = bookTitles[letter].pop();
                const newCard = new Card(CardType.BOOK, randTitle, "", defAuthor, "", 0, key);
                this.cards.push(newCard);
            }
        }
    }

    generateBookShelves()
    {
        const num = CONFIG.cards.generation.numBookShelfCards ?? 10;

        // prepare exact (balanced) list of actions
        const actions = [];
        for(const [key,data] of Object.entries(SHELF_POWERS))
        {
            const min = data.min ?? 1;
            for(let i = 0; i < min; i++)
            {
                actions.push(key);
            }
        }

        while(actions.length < num)
        {
            actions.push(getWeighted(SHELF_POWERS));
        }
        shuffle(actions);

        // create the actual cards
        for(let i = 0; i < num; i++)
        {
            const actionDesc = SHELF_POWERS[actions.pop()].desc;
            const action = this.convertActionTemplateToShelfAction(actionDesc);
            const newCard = new Card(CardType.SHELF, undefined, undefined, undefined, undefined, undefined, action);
            this.cards.push(newCard);
        }
    }

    convertActionTemplateToShelfAction(desc:string)
    {
        const allColors : string[] = Object.keys(COLORS);
        allColors.splice(allColors.indexOf("default"), 1);

        const allLetters : string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const rangeForbidden = 8; // letters to close to extremes don't really work here/are less interesting, so ignore them

        if(desc.includes("%letter%"))
        {
            
            const index = new Bounds(rangeForbidden, allLetters.length - 1 - rangeForbidden).randomInteger();
            const randLetter = allLetters[index];
            desc = desc.replace("%letter%", randLetter);
        }

        if(desc.includes("%color%"))
        {
            const randColor = fromArray(allColors);
            desc = desc.replace("%color%", randColor);
        }

        if(desc.includes("%letters%"))
        {
            const maxRandomness = 3;
            const index1 = new Bounds(0, allLetters.length - 1 - rangeForbidden - maxRandomness).randomInteger();
            const index2 = index1 + new Bounds(rangeForbidden - maxRandomness, rangeForbidden + maxRandomness).randomInteger();
            const letter1 = allLetters[index1];
            const letter2 = allLetters[index2];
            const str = letter1 + "-" + letter2;
            desc = desc.replace("%letters%", str);
        }

        if(desc.includes("%colors%"))
        {
            const allColorsCopy = shuffle( allColors.slice() );
            const color1 = allColorsCopy.pop();
            const color2 = allColorsCopy.pop();
            const str = color1 + " and " + color2; 
            desc = desc.replace("%colors%", str);
        }

        if(desc.includes("%side%"))
        {
            const str = Math.random() <= 0.5 ? "left" : "right";
            desc = desc.replace("%side%", str);
        }

        if(desc.includes("%num%"))
        {
            const str = new Bounds(2,6).randomInteger().toString();
            desc = desc.replace("%num%", str);
        }

        return desc;
    }
}