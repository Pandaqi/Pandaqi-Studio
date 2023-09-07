import WordPhotomone from "./wordPhotomone";
import Random from "js/pq_games/tools/random/main";

export default class WordsPhotomone {
    backupWords: string[];
    possibleWords: any[];
    maxWordLength: number;
    config: Record<string,any>;
    useBackup: boolean;
    
    constructor()
    {
        // @NOTE: these are used when PQ_WORDS, for whatever reason, cannot be accessed or doesn't work
        this.backupWords = ["cat", "dog", "cow", "house", "plane", "car", "bike", "face", "treasure", "mouse", "coffee", "queen", "banana", "bird", "ice cream", "table", "apple", "shirt", "castle", "saw", "kid", "zoo", "giant", "card", "tree", "flower", "giraffe", "chicken", "water", "rabbit", "butterfly", "book", "backpack", "bag", "camel", "snake", "lamb", "sheep", "pig", "elephant", "tomato", "prince", "princess", "king", "pillow", "phone", "kangaroo", "shoe"];
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
        this.useBackup = false;
        // @ts-ignore
        // @TODO: eventually, PQ WORDS should just be included as a MODULE, and we're always sure it is loaded
        // (Right now I have to manually load the extra file in the game page)
        if(!window.PQ_WORDS)
        {
            this.useBackup = true;
            this.possibleWords = this.backupWords.slice();
            return;
        }

        let categories = [];

        // nasty bit of code, but can't help it
        // categories can be provided as an object (key: true/false), or an array (include all values)
        if(Array.isArray(userConfig.categories)) {
            for(const key of userConfig.categories) { categories.push(key); }
        } else {
            for(const key in userConfig.categories)
            {
                if(!userConfig.categories[key]) { continue; }
                categories.push(key);
            }    
        }
  
        let useAllCategories = userConfig.useAllCategories || false;
        if(categories.length <= 0)
        {
            categories = undefined;
            useAllCategories = true;
        }

        const types = ["nouns"];
        if(userConfig.includeNamesAndGeography) {
            types.push("geography"); 
            types.push("names");
        }

        const wordComplexity = userConfig.wordComplexity || "core";

        const wordParams = {
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

        // @ts-ignore
        await PQ_WORDS.loadWithParams(wordParams);
    }

    getWords(num: number)
    {
        let arr: any[];

        if(this.useBackup) 
        {
            const tooFewWordsLeft = this.possibleWords.length < num
            if(tooFewWordsLeft) { this.possibleWords = this.backupWords.slice(); }

            Random.shuffle(this.possibleWords);
            arr = this.possibleWords.splice(0, num);
        } else {
            // @ts-ignore
            arr = PQ_WORDS.getRandomMultiple(num, true);
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