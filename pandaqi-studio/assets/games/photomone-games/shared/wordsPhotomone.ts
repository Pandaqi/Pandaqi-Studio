import PandaqiWords from "js/pq_words/main";
import WordPhotomone from "./wordPhotomone";
import shuffle from "js/pq_games/tools/random/shuffle";

const BACKUP_WORDS = ["cat", "dog", "cow", "house", "plane", "car", "bike", "face", "treasure", "mouse", "coffee", "queen", "banana", "bird", "ice cream", "table", "apple", "shirt", "castle", "saw", "kid", "zoo", "giant", "card", "tree", "flower", "giraffe", "chicken", "water", "rabbit", "butterfly", "book", "backpack", "bag", "camel", "snake", "lamb", "sheep", "pig", "elephant", "tomato", "prince", "princess", "king", "pillow", "phone", "kangaroo", "shoe"];


export default class WordsPhotomone 
{
    possibleWords: any[];
    maxWordLength: number;
    config: Record<string,any>;
    useBackup: boolean;
    PandaqiWords: PandaqiWords
    
    constructor()
    {
        // @NOTE: these are used when PQ_WORDS, for whatever reason, cannot be accessed or doesn't work
        this.possibleWords = [];
        this.maxWordLength = 8;
    }

    async prepare(userConfig: Record<string, any> = {})
    {
        this.config = userConfig;
        await this.prepareFromConfig(userConfig);
    }

    async prepareFromConfig(userConfig:Record<string,any> = {})
    {
        let categories = userConfig._settings.categories.value;
        let useAllCategories = userConfig.useAllCategories ?? false;
        if(categories.length <= 0)
        {
            categories = undefined;
            useAllCategories = true;
        }

        const types = ["nouns"];
        if(userConfig.includeNamesAndGeography) 
        {
            types.push("geography"); 
            types.push("names");
        }

        const wordComplexity = userConfig._settings.wordComplexity.value ?? "core";

        const wordParams = 
        {
            method: "json",
            types: types,
            levels: [wordComplexity],
            categories: categories,
            useAllSubcat: true,
            useAllCategories: useAllCategories,
            useAllLevelsBelow: true,
            maxWordLength: this.maxWordLength,
        }

        console.log(wordParams);

        this.PandaqiWords = new PandaqiWords();
        await this.PandaqiWords.loadWithParams(wordParams);
    }

    getWords(num: number)
    {
        let arr: any[];

        if(this.useBackup) 
        {
            const tooFewWordsLeft = this.possibleWords.length < num
            if(tooFewWordsLeft) { this.possibleWords = BACKUP_WORDS.slice(); }

            shuffle(this.possibleWords);
            arr = this.possibleWords.splice(0, num);
        } else {
            arr = this.PandaqiWords.getRandomMultiple(num, true);
        }

        const finalList = [];
        for(const value of arr)
        {
            const obj = new WordPhotomone(value, this.config);
            finalList.push(obj);
        }

        return finalList;
    }

    getObjectiveScore(list: string | any[], wordsGuessedRight = 5)
    {
        let sum = 0;
        for(const word of list)
        {
            sum += word.getPoints();
        }

        const averagePointsPerWord = sum / list.length;
        return Math.floor(wordsGuessedRight * averagePointsPerWord);
    }
}