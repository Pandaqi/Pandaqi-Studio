import GeneralPickerNaivigation from "games/naivigation/shared/generalPickerNaivigation";
import { CONFIG } from "../shared/config";
import { MATERIAL, TREASURE_BONUSES, TREASURE_CONDITIONS, WEATHER_CARDS } from "../shared/dict";
import Card from "./card";
import Tile from "./tile";
import { CardType, TerrainType, TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { shuffle, fromArray } from "lib/pq-games";

export const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData("card", MATERIAL);
export const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData("tile", MATERIAL).addTerrainData(CONFIG.generation.terrainDist);

// special card types that need some modification
const cardCustomCallback = (key, data) =>
{
    // rotation is half left, half right
    if(key == "rotate")
    {
        const freq = MATERIAL[CardType.VEHICLE][key].freq;
        const halfPoint = Math.round(0.5*freq);
        const cards = [];
        for(let i = 0; i < freq; i++)
        {
            const turnDirection = i < halfPoint ? 1 : -1;
            const customData = { turnDirection: turnDirection, iconFlipX: (turnDirection == -1) };
            const card = new Card(CardType.VEHICLE, key, customData);
            cards.push(card);
        }
        return cards;
    }
    
    // weather cards ARE vehicle cards, but receive completely custom description and data
    if(key == "weather")
    {
        const cards = [];
        for(const [key,data] of Object.entries(WEATHER_CARDS))
        {
            for(let i = 0; i < CONFIG.generation.numCardsPerWeatherType; i++)
            {
                const customData = { weatherKey: key, desc: data.desc };
                cards.push(new Card(CardType.VEHICLE, "weather", customData));
            }
        }
        return cards;
    }

    return null;
}
cardPicker.setCustomCallback(cardCustomCallback);


// special tile types
tilePicker.generateCallback = () =>
{
    // Add these tiles TWICE in case people play with 2 boats
    if(tilePicker.config.sets.mapTiles)
    {
        tilePicker.addSingle(new Tile(TileType.CUSTOM, "compass"));
	tilePicker.addSingle(new Tile(TileType.CUSTOM, "compass"));

        const bounds = tilePicker.config.tiles.custom.windBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "wind", { num: i }));
	    tilePicker.addSingle(new Tile(TileType.CUSTOM, "wind", { num: i }));
        }
    }

    if(tilePicker.config.sets.islandsTreasures)
    {
        const numTreasures = tilePicker.config.tiles.custom.numTreasures;
        const harbors = Object.keys(MATERIAL[TileType.MAP]).filter((key:string) => MATERIAL[TileType.MAP][key].collectible && key != "pirate_haven");
        const randCondOrder = shuffle(Object.keys(TREASURE_CONDITIONS));
        const randBonusOrder = shuffle(Object.keys(TREASURE_BONUSES))
        for(let i = 0; i <= numTreasures; i++)
        {
            const customData = 
            {
                harbor: fromArray(harbors),
                condition: randCondOrder.pop(),
                bonus: randBonusOrder.pop(),
            };
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "treasure", customData));
        }
    }
  
    // general pass applied to all (map) tiles
    const mapTiles = shuffle(tilePicker.get().filter((e:MaterialNaivigation) => e.type == TileType.MAP));
    const waterTiles = shuffle(mapTiles.filter((e:MaterialNaivigation) => e.terrain == TerrainType.SEA));
    
    const numEnemy = Math.round(tilePicker.config.generation.percentageEnemyIcon * mapTiles.length);
    for(let i = 0; i < numEnemy; i++)
    {
        mapTiles[i].customData.enemyIcon = true;
    }

    const numWater = Math.round(tilePicker.config.generation.percentageWaterCurrent * waterTiles.length);
    for(let i = 0; i < numWater; i++)
    {
        const randDir = Math.floor(Math.random() * 4);
        const randStrength = 1; // 1 + Math.floor(Math.random() * 2)
        waterTiles[i].customData.waterCurrent = { dir: randDir, strength: randStrength }
    }
}
