import shuffle from "lib/pq-games/tools/random/shuffle";
import { PLANET_PROPERTIES, PlanetProperty } from "../js_shared/dict";
import Card from "./card";
import { CardType } from "games/naivigation/js_shared/dictShared";

export default class PlanetPropertiesPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        const allOptions: PlanetProperty[] = [];

        // generate all possible options
        for(const [key,data] of Object.entries(PLANET_PROPERTIES))
        {
            const values = data.values ?? [];
            const freq = data.freq ?? 1;

            for(let i = 0; i < freq; i++)
            {
                const noDynamicValues = values.length <= 0;
                if(noDynamicValues)
                {
                    const prop : PlanetProperty = { key, desc: data.desc };
                    allOptions.push(prop);
                    continue;
                }
    
                for(const value of values)
                {
                    const desc = data.desc.replace("%val%", value);
                    const prop : PlanetProperty = { key, desc };
                    allOptions.push(prop);
                }
            }
        }

        // don't forget to add the PLANETS
        for(let i = 0; i < 5; i++)
        {
            allOptions.push({ key: "planet", desc: "", num: i });
        }

        shuffle(allOptions); // @TODO: is this needed in any way?

        // simply attach them all to cards
        const numOptionsPerCard = 3;
        const numCardsNeeded = Math.ceil(allOptions.length / numOptionsPerCard);
        this.cards = [];
        for(let i = 0; i < numCardsNeeded; i++)
        {
            const props = allOptions.splice(0, Math.min(numOptionsPerCard, allOptions.length));
            const c = new Card(CardType.CUSTOM, "custom");
            c.customData = { planetProperties: props };
            this.cards.push(c);
        }
    }
}