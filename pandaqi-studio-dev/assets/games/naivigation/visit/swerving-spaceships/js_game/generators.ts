import { CardType, TileType } from "games/naivigation/js_shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/js_shared/generalPickerNaivigation";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { MATERIAL } from "../js_shared/dict";
import Card from "./card";
import Tile from "./tile";

const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData(MATERIAL);
const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData(MATERIAL);
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
    const maxNum = CONFIG.cards.generation.numSteerCards;
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
cardPicker.setCustomCallback(cardCustomCallback);

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
tilePicker.setCustomCallback(mapCallback);

export {
    cardPicker,
    tilePicker
};
