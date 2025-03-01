import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import RandomNaivigationSetupGenerator, { TileData } from "games/naivigation/js_shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/js_shared/randomNaivigationTurnGenerator";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../js_game/generators";
import CONFIG from "../js_shared/config";
import { NETWORKS, NetworkType, TileType } from "games/naivigation/js_shared/dictShared";
import { MATERIAL } from "../js_shared/dict";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";

const validPlacementCallback = (cell:TileData, setup:RandomNaivigationSetupGenerator) => 
{ 
    let tileFinal = null;
    for(const tile of setup.tiles)
    {
        tileFinal = tile;
        if(tile.networkType != NetworkType.ALL) { continue; } // start with all crossroads
        if(tile.isCollectible() == cell.collectible) { break; }
    }
    return { tile: tileFinal }
}

const vehicleStartCallback = (vehicle:MaterialNaivigation, setup:RandomNaivigationSetupGenerator) : TileData =>
{
    const ourWantedStationType = "station_" + vehicle.key.slice(-1);
    let validCell : TileData = null;
    const cellsAlreadyPicked = setup.vehicleTokenData.map((x) => setup.getCellAt(x.position));
    const cellsShuffled = shuffle(setup.cells);
    for(const cell of cellsShuffled)
    {
        if(cellsAlreadyPicked.includes(cell)) { continue; }
        if(!cell.tile.isCollectible()) { continue; }
        const stationType = cell.tile.key;
        if(ourWantedStationType == stationType) { continue; }
        validCell = cell;
        break;
    }
    return validCell;
}

const visualizerTiles = new MaterialVisualizer(CONFIG, new Point(256,256));
const setup = new RandomNaivigationSetupGenerator({
    tilePicker: tilePicker,
    validPlacementCallback: validPlacementCallback,
    vehicleStartCallback: vehicleStartCallback,
    visualizer: visualizerTiles,
    numVehicles: 5, // @NOTE: CRUCIAL! This actually generates the 5 trains, instead of just the 1 basic vehicle as usual
});

const setupCallback = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    turn.gameData.switchTile = 0;
    turn.gameData.trainTiles = [1,1,1,1,1]; // 1 = forward, 0 = do nothing, -1 = backward
}


// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];

    if(key == "switch")
    {
        turn.gameData.switchTile = Math.floor(Math.random() * 4);
        fb.push("The Switch card rotated the Switch tile to a new side pointing up. (This side determines where trains must go when moving over a tile that splits in multiple directions.)");
    }

    // only relevant in EXPANSION now, so basically ignored here
    if(key == "power")
    {
        const randomTrain = Math.floor(Math.random() * 5);
        const tileTypeString = MATERIAL[TileType.VEHICLE]["vehicle_" + randomTrain].label;
        const newValue = Math.random() <= 0.33 ? 1 : (Math.random() <= 0.5 ? -1 : 0);
        turn.gameData.trainTiles[randomTrain] = newValue;
        const outcomeString = ["Backward", "Stand Still", "Forward"][newValue + 1];
        fb.push("The Power card rotated a Train Tile (" + tileTypeString + "). Now that Train is set to " + outcomeString + ".");
    }

    if(key == "map")
    {
        const cell = setup.getCellRandom();
        const randRot = 1 + Math.floor(Math.random() * 3);
        cell.rot = (cell.rot + randRot) % 4;
        fb.push("The Map card rotated a tile on the map. (At position " + cell.position.x + ", " + cell.position.y +  ".)");
    }

    if(key == "train")
    {
        const trainPicked : string = fromArray(card.customData.trainKeys);
        const trainTypeString = MATERIAL[TileType.VEHICLE][trainPicked].label;
        const trainIndex = parseInt(trainPicked.slice(-1)); // @TODO: this is a MESSY/UNSTABLE way to connect KEY (vehicle_0) to train INDEX (0)! (ALSO USED during starting position callback, so also update there if needed)
        let fbString = "The Train card moved one of the trains depicted (" + trainTypeString + ") by 1 step.";

        // const trainTileValue = turn.gameData.trainTiles[trainIndex];
        // const outcomeString = ["moving 1 tile backward", "standing still", "moving 1 tile forward"][tileValue + 1];
 
        const oldCell = setup.getVehicleData(trainIndex);
        const networkSidesData = NETWORKS[oldCell.tile.networkType].sides;
        const directionsAllowed = [];
        for(const [side,isPossible] of Object.entries(networkSidesData))
        {
            if(!isPossible) { continue; }
            directionsAllowed.push(side);
        }

        let randDirection = fromArray(directionsAllowed);
        randDirection = Math.round( (randDirection + oldCell.rot) % 4 );

        const dirString = ["to the right", "down", "to the left", "up"][randDirection];
        fbString += " This means going " + dirString + " (because the symbol on that side matches the Switch Tile).";

        fb.push(fbString);
        setup.movePlayer(trainIndex, setup.getVectorFromRotation(randDirection), false);
        
        const curTile = setup.getVehicleData(trainIndex).tile;
        const onCollectible = curTile.isCollectible();
        if(onCollectible)
        {
            const ourWantedStationType = "station_" + trainIndex;
            const stationType = curTile.key;
            const matchingTypes = (ourWantedStationType == stationType);
            if(matchingTypes) {
                fb.push("Great! That train arrived at the station matching its color! Collect the station; remove the train.");
                setup.collectCurrentTile(trainIndex);
            } else {
                fb.push("That train arrives at a station, but it's the wrong type! Take 1 damage. You may teleport this train to a different (wrong) station.");
            }
        }
    }

    return {
        feedback: fb
    }
}

const visualizerCards = new MaterialVisualizer(CONFIG, new Point(256,360));
const turn = new RandomNaivigationTurnGenerator({
    setup: setup,
    cardPicker: cardPicker,
    setupCallback: setupCallback,
    movementCallback: movementCallback,
    visualizer: visualizerCards
})