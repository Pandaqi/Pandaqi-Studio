import GridMapper from "js/pq_games/layout/gridMapper";
import { CONFIG } from "../shared/config";
import PandaqiWords from "js/pq_words/main";
import WordData from "js/pq_words/wordData";
import Point from "js/pq_games/tools/geometry/point";
import WordCard from "../shared/wordCard";

export default class WordPicker
{
    words: WordData[];
    gridMapper: GridMapper;
    pqWords: PandaqiWords;
    itemSize: Point;
    wordCards: WordCard[];

    get() { return this.wordCards.slice(); }
    generate()
    {
        this.wordCards = [];
        this.pickWords();
        console.log(this.wordCards);
    }
    
    pickWords()
    {        
        if(!CONFIG.generateWords) { return; }

        const wordsNeeded = CONFIG.wordCards.num * CONFIG.wordCards.numPerCard;
        this.words = CONFIG.pandaqiWords.getRandomMultiple(wordsNeeded, true);

        const numCards = CONFIG.wordCards.num;
        const wordsPerCard = CONFIG.wordCards.numPerCard ?? 4;
        for(let i = 0; i < numCards; i++)
        {
            const words = this.words.splice(0,wordsPerCard);
            this.wordCards.push(new WordCard(words));
        }
    }
}