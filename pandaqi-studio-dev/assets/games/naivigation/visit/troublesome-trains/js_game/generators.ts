import { CardType, TileType } from "games/naivigation/js_shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/js_shared/generalPickerNaivigation";
import CONFIG from "../js_shared/config";
import { MATERIAL, PASSENGER_BONUSES, PASSENGER_CURSES } from "../js_shared/dict";
import Card from "./card";
import Tile from "./tile";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";

const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData(MATERIAL);
const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData(MATERIAL).addTerrainData(CONFIG.generation.terrainDist);

cardPicker.generateCallback = () =>
{
    if(cardPicker.config.sets.passengersPlanes)
    {
        const airports = ["airport_0", "airport_1", "airport_2", "airport_3", "airport_4"];
        const numPassengers = cardPicker.config.cards.passengers.numCards;
        const passengersPossible = cardPicker.config.cards.passengers.options;
        const randBonusOrder = shuffle(Object.keys(PASSENGER_BONUSES));
        const randCurseOrder = shuffle(Object.keys(PASSENGER_CURSES));
        for(let i = 0; i < numPassengers; i++)
        {
            const customData = {
                airport: fromArray(airports),
                bonus: randBonusOrder.pop(),
                curse: randCurseOrder.pop()
            };
            cardPicker.addSingle(new Card(CardType.PASSENGER, fromArray(passengersPossible), customData));
        }
    }

    if(cardPicker.config.sets.fuelFalling)
    {
        const bounds = cardPicker.config.cards.fuelBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            cardPicker.addSingle(new Card(CardType.FUEL, "fuel"));
        }
    }
}


tilePicker.generateCallback = () =>
{
    if(tilePicker.config.sets.mapTiles)
    {
        const bounds = tilePicker.config.tiles.custom.elevationBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "elevation", { num: i }));
        }
    }

    if(tilePicker.config.sets.timezonesTomorrow)
    {
        const bounds = tilePicker.config.tiles.custom.clockBounds;
        const numPerValue = tilePicker.config.tiles.custom.clockCardsPerValue;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            for(let a = 0; a < numPerValue; a++)
            {
                tilePicker.addSingle(new Tile(TileType.CUSTOM, "clock", { num: i }));
            }
        }
    }
}

export {
    cardPicker,
    tilePicker
};
