import { PandaqiWords } from "lib/pq-words";

export default async (config, load = true) =>
{
    const types = ["nouns"];
    if(config.includeNamesAndGeography) {
        types.push("geography"); 
        types.push("names");
    }
    
    const wordComplexity = config.wordComplexity ?? "core";
    
    const wordParams = {
        method: "json",
        types: types,
        levels: [wordComplexity],
        useAllSubcat: true,
        useAllCategories: true,
        useAllLevelsBelow: true,
        maxWordLength: config.maxWordLength,
    }

    const pqWords = new PandaqiWords();
    if(load)
    {
        await pqWords.loadWithParams(wordParams);
    }

    return pqWords;
}