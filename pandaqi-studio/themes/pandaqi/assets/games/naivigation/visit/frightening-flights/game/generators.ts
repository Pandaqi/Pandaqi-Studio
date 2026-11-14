import { CardType, TileType } from "games/naivigation/shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/shared/generalPickerNaivigation";
import { CONFIG } from "../shared/config";
import { registerPicker } from "games/naivigation/shared/pickerRegistry";
import { MATERIAL, PASSENGER_BONUSES, PASSENGER_CURSES } from "../shared/dict";
import Card from "./card";
import Tile from "./tile";
import { shuffle, fromArray, getSetting } from "lib/pq-games";
export const cardPicker = registerPicker("cards", new GeneralPickerNaivigation(CONFIG, Card).addMaterialData("card", MATERIAL));
export const tilePicker = registerPicker("tiles", new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData("tile", MATERIAL).addTerrainData(CONFIG.generation.terrainDist));

cardPicker.generateCallback = () =>
{
    if(getSetting("expansions.passengersPlanes", CONFIG))
    {
        const airports = Object.keys(MATERIAL[TileType.MAP]).filter((key:string) => MATERIAL[TileType.MAP][key].collectible);
        const numPassengers = CONFIG.generation.cards.passengers.numCards;
        const passengersPossible = CONFIG.generation.cards.passengers.options;
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

    if(getSetting("expansions.fuelFalling", CONFIG))
    {
        const num = CONFIG.generation.cards.numFuelCards;
        for(let i = 0; i < num; i++)
        {
            cardPicker.addSingle(new Card(CardType.FUEL, "fuel"));
        }
    }
}


tilePicker.generateCallback = () =>
{
    // Add elevation tiles twice, in case a group plays with 2 planes
    if(getSetting("sets.mapTiles", CONFIG))
    {
        const bounds = CONFIG.generation.tiles.custom.elevationBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "elevation", { num: i }));
	    tilePicker.addSingle(new Tile(TileType.CUSTOM, "elevation", { num: i }));
        }
    }

    if(getSetting("expansions.timezonesTomorrow", CONFIG))
    {
        const bounds = CONFIG.generation.tiles.custom.clockBounds;
        const numPerValue = CONFIG.generation.tiles.custom.clockCardsPerValue;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            for(let a = 0; a < numPerValue; a++)
            {
                tilePicker.addSingle(new Tile(TileType.CUSTOM, "clock", { num: i }));
            }
        }
    }
}