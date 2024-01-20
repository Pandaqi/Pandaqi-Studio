import PandaqiWords from "js/pq_words/main";
import CONFIG from "../js_shared/config";
import Card from "./card";
import { DRAWINGS } from "../js_shared/dict";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }
    async generate()
    {
        this.cards = [];
        if(!CONFIG.includeCards) { return; }

        const pqWords = new PandaqiWords();
        const params = structuredClone(CONFIG.cards.generation.pqWordsParams);
        params.wordExclusions = Object.keys(DRAWINGS);

        if(CONFIG.includeDifficultWords) { params.levels.push("medium"); }
        if(CONFIG.includeGeography) { params.types.push("geography"); }
	    if(CONFIG.includeNames) { params.types.push("names"); }

        await pqWords.loadWithParams(params);

        const numWordCards = CONFIG.cards.generation.num;
        const numWordsPerCard = CONFIG.cards.generation.wordsPerCard;
        const wordsNeeded = numWordCards * numWordsPerCard;

        const allWords = pqWords.getRandomMultiple(wordsNeeded, true);
        console.log(allWords.slice());
        for(let i = 0; i < numWordCards; i++)
        {
            const wordObjects = allWords.splice(0, numWordsPerCard); 
            const words = []; // we only need the word strings, so simplify by getting only that into a list
            for(const obj of wordObjects) { words.push(obj.getWord()); }
            const newCard = new Card(words);
            this.cards.push(newCard);
        }
    }
}