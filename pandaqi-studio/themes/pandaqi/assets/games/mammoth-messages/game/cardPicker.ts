import { getSetting } from "lib/pq-games";
import { PandaqiWords } from "lib/pq-words";
import { CONFIG } from "../shared/config";
import Card from "./card";
import { DRAWINGS } from "../shared/dict";

export const cardPicker = async () : Promise<Card[]> =>
{
    const cards = [];
    if(!getSetting("sets.includeCards", CONFIG)) { return; }

    const pqWords = new PandaqiWords();
    // the card drawing config holds its own generation block (the same place tokenPicker reads from)
    const params = structuredClone(CONFIG._drawing.cards.generation.pqWordsParams);
    params.wordExceptions = Object.keys(DRAWINGS);

    if(getSetting("wordPreferences.includeDifficultWords", CONFIG)) { params.levels.push("medium"); }
    if(getSetting("wordPreferences.includeGeography", CONFIG)) { params.types.push("geography"); }
    if(getSetting("wordPreferences.includeNames", CONFIG)) { params.types.push("names"); }

    await pqWords.loadWithParams(params);

    const numWordCards = CONFIG._drawing.cards.generation.num;
    const numWordsPerCard = CONFIG._drawing.cards.generation.wordsPerCard;
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