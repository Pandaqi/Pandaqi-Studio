import generatePacks from "games/throneless-games/shared/generatePacks";
import { CONFIG } from "../shared/config";
import { PACKS, SETS } from "../shared/dict";
import CardThroneless from "games/throneless-games/shared/cardThroneless";
import cacheDefaultData from "games/throneless-games/shared/cacheDefaultData";

export const cardPicker = () : CardThroneless[] => 
{
    const cards = [];
    cacheDefaultData(PACKS);
    generatePacks(cards, CONFIG, PACKS, SETS);
    return cards;
}