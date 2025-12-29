import { PandaqiWords } from "lib/pq-words";
import { CONFIG } from "../shared/config";
import { MaterialType } from "../shared/dict";
import { Card } from "./card";

export const getRandomTypeData = (dict) =>
{
	let totalProb = 0;
	for(const key in dict)
	{
		totalProb += dict[key].prob || 1;
	}

	let rand = Math.random();
	let sum = 0;
	let icons = Object.keys(dict);
	let counter = -1;
	while(sum < rand)
	{
		counter += 1;

		const fraction = dict[icons[counter]].prob / totalProb;
		sum += fraction;
	}

	return dict[icons[counter]];
}

export const getFullWordList = async () =>
{
    let categories = CONFIG._settings.wordPreferences.categories.value;
    let useAllCategories = CONFIG._settings.wordPreferences.useAllCategories.value;
    if(categories.length <= 0)
    {
        categories = undefined;
        useAllCategories = true;
    }

    const types = ["nouns"];
    if(CONFIG._settings.wordPreferences.includeGeography.value) { types.push("geography"); }
    if(CONFIG._settings.wordPreferences.includeNames.value) { types.push("names"); }

    const wordParams = {
        method: "json",
        types: types,
        levels: [CONFIG._settings.wordPreferences.wordComplexity.value],
        categories: categories,
        useAllSubcat: true,
        useAllCategories: useAllCategories,
        useAllLevelsBelow: true
    }

    const pandaqiWords = new PandaqiWords();
    await pandaqiWords.loadWithParams(wordParams);
    
    const wordsPerCard = 4;
    const cardsPerPage = 12;
    const numPages = 4;
    const numWordsNeeded = wordsPerCard * cardsPerPage * numPages; 
    return pandaqiWords.getRandomMultiple(numWordsNeeded, true);
}

export const cardPicker = async () : Promise<Card[]> =>
{
    const cards = [];

    if(CONFIG._settings.material.wordCards)
    {
        const wordList = await getFullWordList();

        const wordsPerCard = 4;
        while(wordList.length > 0)
        {
            let tempWordsPerCard = wordsPerCard;
            if(CONFIG._settings.varyWordCount.value) 
            { 
                tempWordsPerCard = Math.floor(Math.random() * (wordsPerCard-1)) + 1; 
            }
            tempWordsPerCard = Math.min(tempWordsPerCard, wordList.length);

		    const words = wordList.splice(0, tempWordsPerCard);

            const newCard = new Card(MaterialType.WORD);
            newCard.words = words;
            cards.push(newCard);
        }
    }

    if(CONFIG._settings.material.specialCards)
    {
        for(let i = 0; i < 12; i++)
        {
            cards.push(new Card(MaterialType.SPECIAL));
        }
    }

    if(CONFIG._settings.material.morphCards)
    {
        for(let i = 0; i <= 10; i++)
        {
            cards.push(new Card(MaterialType.MORPH, i));
        }
    }

    if(CONFIG._settings.material.voteCards)
    {
        const numTeamColors = CONFIG._drawing.teamColors.length;
        for(let c = 0; c < numTeamColors; c++)
        {
            for(let i = 1; i <= 9; i++)
            {
                const card = new Card(MaterialType.VOTE, i);
                card.teamIndex = c;
                cards.push(card);
            }
        }
    }

    return cards;
}