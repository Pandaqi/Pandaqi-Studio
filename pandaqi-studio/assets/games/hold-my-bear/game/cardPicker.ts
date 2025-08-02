import { CONFIG } from "../shared/config";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const animalsBase = CONFIG._settings.animalsBase.value;
    const animalsExpansion = CONFIG._settings.animalsExpansion.value;
    const animals = [animalsBase, animalsExpansion].flat();

    const cards = [];
    for(const animal of animals)
    {
        const dist = CONFIG.generation.numberDistribution;
        const cardsAnimal = [];
        for(let i = 0; i < dist.length; i++)
        {
            const howMany = dist[i];
            for(let a = 0; a < howMany; a++)
            {
                const num = (i+1);
                const newCard = new Card(animal, num);
                cardsAnimal.push(newCard);
            }
        }
        cards.push(...cardsAnimal);
    }
    return cards;
}