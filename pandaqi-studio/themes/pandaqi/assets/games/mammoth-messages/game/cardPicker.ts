import { PandaqiWords } from "lib/pq-words";
import { CONFIG } from "../shared/config";
import Card from "./card";
import { DRAWINGS } from "../shared/dict";

export const cardPicker = async () : Promise<Card[]> =>
{
    const cards = [];
    if(!CONFIG._settings.sets.includeCards.value) { return; }

    const pqWords = new PandaqiWords();
    const params = structuredClone(CONFIG.cards.generation.pqWordsParams);
    params.wordExceptions = Object.keys(DRAWINGS);

    if(CONFIG._settings.wordPreferences.includeDifficultWords.value) { params.levels.push("medium"); }
    if(CONFIG._settings.wordPreferences.includeGeography.value) { params.types.push("geography"); }
    if(CONFIG._settings.wordPreferences.includeNames.value) { params.types.push("names"); }

    await pqWords.loadWithParams(params);

    const numWordCards = CONFIG.cards.generation.num;
    const numWordsPerCard = CONFIG.cards.generation.wordsPerCard;
    const wordsNeeded = numWordCards * numWordsPerCard;

    const allWords = pqWords.getRandomMultiple(wordsNeeded, true);
    for(let i = 0; i < numWordCards; i++)
    {
        const wordObjects = allWords.splice(0, numWordsPerCard); 
        const words = []; // we only need the word strings, so simplify by getting only that into a list
        for(const obj of wordObjects) { words.push(obj.getWord()); }
        const newCard = new Card(words);
        cards.push(newCard);
    }

    return cards;
}