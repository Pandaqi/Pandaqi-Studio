import { CONFIG } from "../shared/config";
import { BEASTS, MaterialType } from "../shared/dict";
import Card from "./card";

export const tilePicker = () : Card[] =>
{
    const tiles = [];
    for(const [key,data] of Object.entries(BEASTS))
    {
        const set = data.set ?? "baseBeasts";
        if(!CONFIG._settings.sets[set].value) { continue; }
        tiles.push(new Card(MaterialType.BEAST, key));
    }
    return tiles;
}