import { PLANET_PROPERTIES, PlanetProperty } from "../shared/dict";
import Card from "./card";
import { CardType } from "games/naivigation/shared/dictShared";
import { CONFIG } from "../shared/config";
import { shuffle } from "lib/pq-games";

export const planetPropertiesPicker = () : Card[] =>
{
    if(!CONFIG._settings.expansions.trade.value) { return []; }

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

    shuffle(allOptions);

    // simply attach them all to cards
    const numOptionsPerCard = 3;
    const numCardsNeeded = Math.ceil(allOptions.length / numOptionsPerCard);
    const cards = [];
    for(let i = 0; i < numCardsNeeded; i++)
    {
        const props = allOptions.splice(0, Math.min(numOptionsPerCard, allOptions.length));
        const c = new Card(CardType.CUSTOM, "custom");
        c.customData = { planetProperties: props };
        cards.push(c);
    }
    return cards;
}