import { getSetting } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const animalsBase = getSetting("animalsBase", CONFIG);
    const animalsExpansion = getSetting("animalsExpansion", CONFIG);
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