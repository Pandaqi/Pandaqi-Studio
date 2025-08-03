import fromArray from "js/pq_games/tools/random/fromArray";
import { CONFIG } from "../shared/config";
import Card from "./card";
import Pack from "./pack";
import { TypeStats } from "../shared/dict";

export const cardPicker = () : Card[] =>
{
    if(CONFIG._debug.randomizeTypes)
    {
        const customElements = {
            red: fromArray(["fire", "electric", "star", "dragon"]),
            blue: fromArray(["water", "ice", "poison", "weather"]),
            green: fromArray(["earth", "grass", "rock", "bug"]),
            purple: fromArray(["air", "magic", "ghost", "dark"])
        }
        CONFIG.elements = customElements;
    }

    // keep track of stats to balance picking along the way
    let elemDict : Record<string,string> = CONFIG.elements;

    const numElementUsed:TypeStats = {}        
    for(const [element,subtype] of Object.entries(elemDict))
    {
        numElementUsed[subtype] = { regular: 0, action: 0, total: 0 };
    }

    // to get a quick reference about what type counters what other type
    // and a reverse dictionary to quickly look up main type from sub type
    const elementCycleSubtype = ["","","",""];
    const elemDictReverse:Record<string,string> = {};
    CONFIG.gameplay.elementCycleSubtype = elementCycleSubtype;
    CONFIG.elementsReverse = elemDictReverse;
    for(const [element, subtype] of Object.entries(elemDict))
    {
        const idx = CONFIG.gameplay.elementCycle.indexOf(element);
        elementCycleSubtype[idx] = subtype;
        elemDictReverse[subtype] = element;
    }

    // @NOTE: we go through the pack class because this is a refactor of old code that used it and I don't want to mess with it and maybe make a mistake
    const cards : Card[] = [];
    for(const [element,subtype] of Object.entries(elemDict))
    {
        cards.push(...new Pack(element, subtype).createCards(numElementUsed));
    }

    return cards;
}
