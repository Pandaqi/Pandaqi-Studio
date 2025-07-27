import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import RandomNaivigationSetupGenerator, { TileData } from "games/naivigation/shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/shared/randomNaivigationTurnGenerator";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../game/generators";
import CONFIG from "../shared/config";
import fromArray from "js/pq_games/tools/random/fromArray";
import { NetworkType } from "games/naivigation/shared/dictShared";

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

const visualizerTiles = new MaterialVisualizer(CONFIG, new Point(256,256));
const setup = new RandomNaivigationSetupGenerator({
    tilePicker: tilePicker,
    validPlacementCallback: validPlacementCallback,
    visualizer: visualizerTiles
});

const setupCallback = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    turn.gameData.gear = fromArray([-1,1,2,3]) // these are simply more interesting starting values for the example
}

// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];
    const oldPosition = setup.getVehicleData(0).position;
    const curGear = turn.gameData.gear;

    if(key == "turn")
    {
        setup.rotatePlayer(0, curGear);
        const str = (curGear >= 0) ? "right" : "left";
        fb.push("The Turn card rotated the car " + Math.abs(curGear) + " quarter turns to the " + str + ". (Because your current Gear is " + curGear + ".)");
    }

    if(key == "drive")
    {
        setup.movePlayerForward(0, curGear, false);
        const str = (curGear >= 0) ? "forward" : "backward"; 
        fb.push("The Drive card moved the car " + Math.abs(curGear) + " steps " + str + ". (Because your current Gear is " + curGear + ".)");
        
        const invalidMove = setup.isPlayerOutOfBounds(); // @TODO: check if off-road? This should be another general function, right?
        if(invalidMove)
        {
            setup.setPlayerPosition(0, oldPosition);
            fb.push("But we can't move off the map! So we take 1 damage and stay where we are.");
        }
    }

    if(key == "gear")
    {
        const cardIndex = turn.getCardIndex(card);
        const changeDir = Math.random() <= 0.5 ? +1 : -1;
        const totalChange = changeDir * (cardIndex + 1);
        const totalChangeStr = (totalChange >= 0) ? "+" + totalChange : totalChange.toString();

        fb.push("The Gear card was played to slot " + (cardIndex + 1) + ", so the car's Gear goes " + totalChangeStr + ". (Start player chose this direction of change.)");
        
        const newGear = curGear + totalChange;
        turn.gameData.gear = CONFIG.tiles.custom.gearBounds.clamp(newGear);
    }

    if(key == "cruise_control")
    {
        const pickDrive = Math.random() <= 0.5;
        if(pickDrive) {
            const dir = Math.random() <= 0.5 ? 1 : -1;
            const str = (dir > 1) ? "forward" : "backward";
            setup.movePlayerForward(0, dir, true);
            fb.push("The Cruise card moved the car 1 tile " + str + ". (Start player chose this movement for this card.)");
        } else {
            const dir = Math.random() <= 0.5 ? 1 : -1;
            const str = (dir > 1) ? "right" : "left";
            setup.rotatePlayer(0, dir);
            fb.push("The Cruise card rotated the car to the " + str + ". (Start player chose this movement for this card.)");
        }
    }

    const curTile = setup.getVehicleData(0).tile;
    const onCollectible = curTile.isCollectible();
    const onParkingLot = curTile.key == "parking_lot";
    if(onCollectible)
    {
        fb.push("You ended on a collectible, but that means nothing. In this game, you can only visit shops by visiting an adjacent parking lot.");
    }

    if(onParkingLot)
    {
        const wantedOrientation = curTile.customData.carOrientation;
        const ourOrientation = setup.getVehicleData(0).rot;
        const orientedCorrectly = (wantedOrientation == ourOrientation);
        if(orientedCorrectly)
        {
            fb.push("Great! You visited a parking lot with the correct orientation. You collect any adjacent shops.");
            // @TODO: actually do that collecting + keep the unique shop number in mind for taking damage?
        } else {
            fb.push("You visited the parking lot with the wrong orientation. Nothing happens.");
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