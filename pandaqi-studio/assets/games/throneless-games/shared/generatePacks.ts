import shuffle from "js/pq_games/tools/random/shuffle";
import CardThroneless from "./cardThroneless";
import { CardType, PackData } from "./dictShared";

export default (list:CardThroneless[], config:Record<string,any>, dictPacks:Record<string,PackData>, dictSets:Record<string,string[]>) =>
{
    const numRegular = config.generation.numRegularCardsPerPack;
    const numDark = config.generation.numDarkCardsPerOption;

    // figure out which ones to include
    let packsIncluded = [];
    const set = config._settings.set.value ?? "none";
    if(set in dictSets) { 
        packsIncluded = dictSets[set].slice(); 
    } else if(set == "random") {
        packsIncluded = shuffle(Object.keys(config._settings.packs.value)).slice(0,5);
    } else if(set == "none") { 
        for(const [packName,enabled] of Object.entries(config._settings.packs.value))
        {
            if(!enabled) { continue; }
            packsIncluded.push(packName);
        }
    }
    
    // for those ones, add the right regular/dark/whatever versions in the right quantities
    for(const [pack,packData] of Object.entries(dictPacks))
    {
        if(!packsIncluded.includes(pack)) { continue; }

        const darkData = packData.dark ?? [];

        let numDarkCards = 0;
        for(const darkOption of darkData)
        {
            for(let i = 0; i < numDark; i++)
            {
                const newCard = new CardThroneless(CardType.VOTE, pack, packData, darkOption);
                list.push(newCard);
                numDarkCards++;
            }
        }

        let numRegularLeft = numRegular - numDarkCards;
        for(let i = 0; i < numRegularLeft; i++)
        {
            const newCard = new CardThroneless(CardType.VOTE, pack, packData);
            list.push(newCard);
        }
    }
}