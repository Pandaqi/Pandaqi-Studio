import { CONFIG } from "../shared/config";
import { SUSPECTS, Type } from "../shared/dict";
import Card from "./card";

export const suspectPicker = () : Card[] =>
{
    const cards = [];
    if(!CONFIG._settings.includeCharacters.value) { return; }

    // then simply create all suspects as often as required
    // (the "loupe" card is also just a suspect!)
    const suspects = Object.keys(SUSPECTS);
    const freq = CONFIG.generation.defFrequencyForSuspect;
    for(const susp of suspects)
    {
        const freqTemp = SUSPECTS[susp].freq ?? freq;
        for(let i = 0; i < freqTemp; i++)
        {
            const card = new Card(Type.CHARACTER, susp);
            cards.push(card);
        }
    }
    return cards;
}