import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../js_game/generators";
import RandomNaivigationSetupGenerator, { TileData } from "games/naivigation/js_shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/js_shared/randomNaivigationTurnGenerator";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import Bounds from "js/pq_games/tools/numbers/bounds";

// given the current grid and available tiles, find a valid one for this cell
const validPlacementCallback = (cell:TileData, setup:RandomNaivigationSetupGenerator) => 
{
    let tileFinal = null;
    for(const tile of setup.tiles)
    {
        if(tile.isCollectible() == cell.collectible) { tileFinal = tile; break; }
    }
    return { tile: tileFinal }
}

const visualizerTiles = new MaterialVisualizer(CONFIG, new Point(256,256));
const setup = new RandomNaivigationSetupGenerator({
    tilePicker: tilePicker,
    validPlacementCallback: validPlacementCallback,
    visualizer: visualizerTiles
});

// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];
    const oldPosition = setup.getVehicleData(0).position;

    if(key == "steer")
    {
        const angle = new Bounds(card.customData.angles[0], card.customData.angles[1]).randomInteger();
        const angleQuarters = angle / 2.0;
        setup.rotatePlayer(0, angleQuarters);
        fb.push("The spaceship rotated by one of the valid angles on the Steer card.");
    }

    if(key == "thrust")
    {
        setup.movePlayerForward(0, 1, true);
        fb.push("The Thrust card moved the spaceship 1 step forward (in the direction it faces).");
        const newPosition = setup.getVehicleData(0).position.clone();
        const vectorMoved = newPosition.sub(oldPosition); 
        const isDiagonal = Math.abs(vectorMoved.x) > 0 && Math.abs(vectorMoved.y) > 0;
        if(isDiagonal)
        {
            fb.push("(Remember diagonal movement doesn't exist; if so, you pick horizontal OR vertical.)");
        }
    }

    if(key == "disengage")
    {
        // calculate nearest planet
        let nearestPlanet = null;
        let nearestDist = Infinity;
        for(const cell of setup.cells)
        {
            if(!cell.collectible) { continue; }
            const dist = Math.abs(cell.position.x - oldPosition.x) + Math.abs(cell.position.y - oldPosition.y);
            if(dist >= nearestDist) { continue; }
            nearestPlanet = cell;
            nearestDist = dist;
        }

        console.log(nearestPlanet);

        // pick a random single step towards it
        const movementNeeded = nearestPlanet.position.clone().sub(oldPosition);
        const isDiagonal = Math.abs(movementNeeded.x) > 0 && Math.abs(movementNeeded.y) > 0;
        const vector = new Point();
        if(Math.abs(movementNeeded.x) > Math.abs(movementNeeded.y)) {
            vector.x = Math.sign(movementNeeded.x);
        } else {
            vector.y = Math.sign(movementNeeded.y);
        }

        setup.movePlayer(0, vector, true);   
        fb.push("The Disable card moved the spaceship 1 step closer to the nearest planet.");

        if(isDiagonal)
        {
            fb.push("(Remember diagonal movement doesn't exist; if so, you pick horizontal OR vertical.)");
        }
    }

    const vehicleData = setup.getVehicleData(0)
    const onCollectible = vehicleData.tile.isCollectible();
    if(onCollectible)
    {
        const correctOrient = vehicleData.tile.canCollect(vehicleData);
        if(correctOrient) {
            fb.push("Great! You visited a planet with the right orientation! Collect it.");
            setup.collectCurrentTile();
        } else {
            fb.push("Oh no! You visited a planet, but with the wrong orientation! You bounce back + take 1 damage.");
            setup.setPlayerPosition(0, oldPosition);
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
    movementCallback: movementCallback,
    visualizer: visualizerCards
})