import PandaqiWords from "js/pq_words/main";
import CONFIG from "./config";
import Game from "./game";
import Generator from "./generator";

const start = async () =>
{
    const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] || "{}");
    Object.assign(CONFIG, userConfig);
    
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
        useAllSubcat: true,
        useAllCategories: true,
        useAllLevelsBelow: true,
        maxWordLength: CONFIG.maxWordLength,
    }

    const pqWords = new PandaqiWords();
    CONFIG.pandaqiWords = pqWords;
    if(CONFIG.asGame || CONFIG.generateWords)
    {
        await pqWords.loadWithParams(wordParams);
    }
    
    if(CONFIG.asGame) { 
        new Game().start();
    } else {
        new Generator().start();
    }
}

start();

