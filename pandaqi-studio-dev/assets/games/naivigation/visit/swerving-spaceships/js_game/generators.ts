import TilePickerNaivigation from "games/naivigation/js_shared/tilePickerNaivigation";
import Card from "./card";
import { CardType, TileType } from "games/naivigation/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import Tile from "./tile";
import { HEALTH_CARDS, MAP_TILES, VEHICLE_CARDS } from "../js_shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";
import CardPickerNaivigation from "games/naivigation/js_shared/cardPickerNaivigation";

const cardPicker = new CardPickerNaivigation(CONFIG, Card);
cardPicker.addData(CardType.VEHICLE, VEHICLE_CARDS);
cardPicker.addData(CardType.HEALTH, HEALTH_CARDS);
const customCallback = (key, data) =>
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
cardPicker.setCustomCallback(customCallback);

const tilePicker = new TilePickerNaivigation(CONFIG, Tile);
tilePicker.addData(TileType.MAP, MAP_TILES);
let resourceBalancer = 0;
const mapCallback = (key, data) => 
{
    if(key != "moon") { return; }

    const t = new Tile(TileType.MAP, "moon");
    t.customData.resourceType = resourceBalancer;
    resourceBalancer = (resourceBalancer + 1) % 2;
    return t;
}

tilePicker.setCustomCallback(mapCallback);

export
{
    cardPicker,
    tilePicker
}