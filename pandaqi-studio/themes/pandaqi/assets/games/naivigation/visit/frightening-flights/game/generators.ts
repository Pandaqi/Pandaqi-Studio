import { CardType, TileType } from "games/naivigation/shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/shared/generalPickerNaivigation";
import { CONFIG } from "../shared/config";
import { MATERIAL, PASSENGER_BONUSES, PASSENGER_CURSES } from "../shared/dict";
import Card from "./card";
import Tile from "./tile";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { shuffle, fromArray, getSetting } from "lib/pq-games";

export const cardPicker = () : MaterialNaivigation[] =>
{
    const picker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData("card", MATERIAL);
    const cards = picker.generate();

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
            picker.addSingle(new Card(CardType.PASSENGER, fromArray(passengersPossible), customData));
        }
    }

    if(getSetting("expansions.fuelFalling", CONFIG))
    {
        const num = CONFIG.generation.cards.numFuelCards;
        for(let i = 0; i < num; i++)
        {
            picker.addSingle(new Card(CardType.FUEL, "fuel"));
        }
    }

    return cards;
}

export const tilePicker = () : MaterialNaivigation[] =>
{
    const picker = new GeneralPickerNaivigation(CONFIG, Tile)
        .addMaterialData("tile", MATERIAL)
        .addTerrainData(CONFIG.generation.terrainDist);
    const tiles = picker.generate();

    // Add elevation tiles twice, in case a group plays with 2 planes
    if(getSetting("sets.mapTiles", CONFIG))
    {
        const bounds = CONFIG.generation.tiles.custom.elevationBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            picker.addSingle(new Tile(TileType.CUSTOM, "elevation", { num: i }));
            picker.addSingle(new Tile(TileType.CUSTOM, "elevation", { num: i }));
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
                picker.addSingle(new Tile(TileType.CUSTOM, "clock", { num: i }));
            }
        }
    }

    return tiles;
}
