import Point from "js/pq_games/tools/geometry/point";
import { CONFIG } from "../shared/config";
import CodeCards from "./cards";
import Tiles from "./tiles/tiles";
import Tokens from "./tokens";

const prepareSettings = () =>
{
    // last minute change: the simple version only supports rectangles and a 3+1 = 4 point tile
    if(CONFIG._settings.tileType.value == "simple") 
    { 
        CONFIG._settings.tileShape.value = "rectangle"; 
        CONFIG.tiles.gridResolution = 3;
        CONFIG.tiles.sizePerShape.rectangle = new Point(7, 8);
        CONFIG.tiles.sizePerShapeReduced.rectangle = new Point(10, 12);
        CONFIG.cards.gridPerShapeReduced.rectangle = new Point(8, 8);
    }
}

export const cardPicker = () =>
{
    prepareSettings();
    return new Tiles().tiles;
}

export const tilePicker = () =>
{
    prepareSettings();
    return new CodeCards().cards;
}

export const tokenPicker = () =>
{
    return new Tokens().tokens;
}