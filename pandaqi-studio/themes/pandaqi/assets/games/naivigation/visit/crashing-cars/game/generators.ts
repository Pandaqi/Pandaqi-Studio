import { CardType, TileType } from "games/naivigation/shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/shared/generalPickerNaivigation";
import { CONFIG } from "../shared/config";
import { MATERIAL, PASSENGER_BONUSES, PASSENGER_CURSES } from "../shared/dict";
import Card from "./card";
import Tile from "./tile";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { shuffle, fromArray } from "lib/pq-games";

export const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData("card", MATERIAL);
export const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData("tile", MATERIAL).addTerrainData(CONFIG.generation.terrainDist).addNetworkData(CONFIG.generation.networks.typeDistribution, CONFIG.generation.networks.keyDistribution);

cardPicker.generateCallback = () =>
{
    if(cardPicker.config.sets.taxisCargo)
    {
        const shops = Object.keys(MATERIAL[TileType.MAP]).filter((key:string) => MATERIAL[TileType.MAP][key].collectible);
        const numPassengers = cardPicker.config.cards.passengers.numCards;
        const passengersPossible = cardPicker.config.cards.passengers.options;
        const randBonusOrder = shuffle(Object.keys(PASSENGER_BONUSES));
        const randCurseOrder = shuffle(Object.keys(PASSENGER_CURSES));
        for(let i = 0; i < numPassengers; i++)
        {
            const customData = {
                shop: fromArray(shops),
                bonus: randBonusOrder.pop(),
                curse: randCurseOrder.pop()
            };
            cardPicker.addSingle(new Card(CardType.PASSENGER, fromArray(passengersPossible), customData));
        }
    }

    if(cardPicker.config.sets.fuelFear)
    {
        const num = cardPicker.config.cards.numFuelCards;
        for(let i = 0; i < num; i++)
        {
            cardPicker.addSingle(new Card(CardType.FUEL, "fuel"));
        }
    }
}


tilePicker.generateCallback = () =>
{
    // Add these tiles twice in case people play with TWO cars
    if(tilePicker.config.sets.mapTiles)
    {
        const bounds = tilePicker.config.tiles.custom.gearBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "gear", { num: i }));
	        tilePicker.addSingle(new Tile(TileType.CUSTOM, "gear", { num: i }));
        }
    }

    const mapTiles = shuffle(tilePicker.get().filter((e:MaterialNaivigation) => e.type == TileType.MAP));

    // assign unique numbers (but make sure there are some duplicates) to collectible tiles
    const collectibleTiles = shuffle(mapTiles.filter((e:MaterialNaivigation) => e.isCollectible()));
    const numbers = [];
    const maxNum = 1 + Math.floor(collectibleTiles.length / 2);
    for(let i = 1; i <= maxNum; i++)
    {
        numbers.push(i);
        numbers.push(i);
    }
    shuffle(numbers);
    for(const tile of collectibleTiles)
    {
        tile.customData.num = numbers.pop();
    }

    // assign orientations to parking lot tiles
    const parkingTiles = shuffle(mapTiles.filter((e:MaterialNaivigation) => e.key == "parking_lot"));
    for(const tile of parkingTiles)
    {
        tile.customData.carOrientation = Math.floor(Math.random() * 4);
    }

}