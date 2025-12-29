import { CONFIG } from "../shared/config";
import loadPandaqiWords from "../shared/loadPandaqiWords";
import WordCard from "../shared/wordCard";

export const wordPicker = async () : Promise<WordCard[]> =>
{
    if(!CONFIG._settings.generateWords.value) { return []; }

    CONFIG.pandaqiWords = await loadPandaqiWords(CONFIG, true);

    const wordsNeeded = CONFIG._drawing.wordCards.num * CONFIG._drawing.wordCards.numPerCard;
    const allWords = CONFIG.pandaqiWords.getRandomMultiple(wordsNeeded, true);

    const numCards = CONFIG._drawing.wordCards.num;
    const wordsPerCard = CONFIG._drawing.wordCards.numPerCard ?? 4;
    const cards = [];
    for(let i = 0; i < numCards; i++)
    {
        const words = allWords.splice(0,wordsPerCard);
        cards.push(new WordCard(words));
    }
    return cards;
}