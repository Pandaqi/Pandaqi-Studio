import { CardType, TileType } from "games/naivigation/shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/shared/generalPickerNaivigation";
import { CONFIG } from "../shared/config";
import { MATERIAL } from "../shared/dict";
import Card from "./card";
import Tile from "./tile";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { shuffle } from "lib/pq-games";

const cardCustomCallback = (key, data) =>
{
    if(key != "steer") { return; }

    // create all possible ranges (all of them clockwise)
    // but ignore anything above 180 degrees (a complete flip) to filter the options
    const angleCombos = [];
    for(let i = 0; i < 8; i++)
    {
        for(let j = 1; j <= 4; j++)
        {
            angleCombos.push([i, i+j]);
        }
    }

    // then filter to bring it back to a reasonable amount by removing those that go through the origin OR have diagonal angles
    const maxNum = CONFIG.generation.cards.numSteerCards;
    shuffle(angleCombos);
    for(let i = angleCombos.length - 1; i >= 0; i--)
    {
        if(angleCombos.length <= maxNum) { break; }
        const combo = angleCombos[i];
        const passesOrigin = combo[0] > combo[1];
        const weirdDiagonal = (combo[0] % 2) != (combo[1] % 2);
        if(passesOrigin || weirdDiagonal) { angleCombos.splice(i, 1); }
    }

    const cards = [];
    for(const combo of angleCombos)
    {
        const card = new Card(CardType.VEHICLE, key);
        card.customData = { angles: combo };
        cards.push(card);
    }

    return cards;
}

let resourceBalancer = 0;
const mapCallback = (key, data) => 
{
    if(key != "moon") { return; }

    const arr = [];
    const numMoons = MATERIAL[TileType.MAP].moon.freq;
    for(let i = 0; i < numMoons; i++)
    {
        const t = new Tile(TileType.MAP, "moon");
        t.customData.resourceType = resourceBalancer;
        resourceBalancer = (resourceBalancer + 1) % 2;    
        arr.push(t);
    }
    return arr;
}

export const cardPicker = () : MaterialNaivigation[] =>
{
    const picker = new GeneralPickerNaivigation(CONFIG, Card)
        .addMaterialData("card", MATERIAL)
        .setCustomCallback(cardCustomCallback);
    return picker.generate();
}

export const tilePicker = () : MaterialNaivigation[] =>
{
    const picker = new GeneralPickerNaivigation(CONFIG, Tile)
        .addMaterialData("tile", MATERIAL)
        .setCustomCallback(mapCallback);
    return picker.generate();
}
