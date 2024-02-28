import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../js_game/generators";
import RandomNaivigationSetupGenerator from "games/naivigation/js_shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/js_shared/randomNaivigationTurnGenerator";

console.log(CONFIG);

CONFIG.itemSize = new Point(256, 256);
const visualizerTiles = new MaterialVisualizer(CONFIG);

CONFIG.itemSize = new Point(256, 360)
const visualizerCards = new MaterialVisualizer(CONFIG);

// given the current grid and available tiles, find a valid one for this cell
// @TODO
const validPlacementCallback = (cell, grid, tiles) => 
{
    let tileFinal = null;
    for(const tile of tiles)
    {
        if(tile.isCollectible() == cell.collectible) { tileFinal = tile; break; }
    }
    return { tile: tileFinal }
}

const tiles = tilePicker.generate();
const cards = cardPicker.generate();
console.log(tiles);
console.log(cards);

const setup = new RandomNaivigationSetupGenerator({
    tiles: tiles,
    validPlacementCallback: validPlacementCallback,
    visualizer: visualizerTiles
});

// given the card and current map/round state, what happens?
// @TODO
const movementCallback = (card, setup, turn) =>
{

}

const turn = new RandomNaivigationTurnGenerator({
    setup: setup,
    cards: cards,
    movementCallback: movementCallback,
    visualizer: visualizerCards
})