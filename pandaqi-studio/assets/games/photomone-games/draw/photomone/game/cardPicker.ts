import WordsPhotomone from "games/photomone-games/shared/wordsPhotomone";
import Card from "./card";
import { CONFIG } from "./config";

export const cardPicker = async () : Promise<Card[]> =>
{
    const numPages = 3;
    const cardsPerPage = 12;
    const totalNumCards = cardsPerPage * numPages;
    const wordsPerCard = CONFIG.wordsPerCard ?? 4;
    const numWordsNeeded = wordsPerCard * totalNumCards;

    const WORDS = new WordsPhotomone();
    await WORDS.prepare(CONFIG);

    const wordList = WORDS.getWords(numWordsNeeded);
    const cards = [];
    for(let i = 0; i < totalNumCards; i++)
    {
        cards.push(new Card(wordList.slice(0, wordsPerCard)));
    }
    return cards;
}