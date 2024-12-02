import GeneralPickerNaivigation from "games/naivigation/js_shared/generalPickerNaivigation";
import CONFIG from "../js_shared/config";
import { MATERIAL } from "../js_shared/dict";
import Card from "./card";
import Tile from "./tile";
import { TileType } from "games/naivigation/js_shared/dictShared";

const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData(MATERIAL);
const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData(MATERIAL);

cardPicker.generateCallback = () =>
{
    // @TODO: generate passengers
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

    if(tilePicker.config.sets.fuelFalling)
    {
        const bounds = tilePicker.config.tiles.custom.fuelBounds;
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "fuel", { num: i }));
        }
    }
}

export {
    cardPicker,
    tilePicker
};
