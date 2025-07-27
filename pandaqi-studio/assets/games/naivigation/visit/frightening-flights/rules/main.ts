import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import RandomNaivigationSetupGenerator from "games/naivigation/shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/shared/randomNaivigationTurnGenerator";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../game/generators";
import CONFIG from "../shared/config";

const visualizerTiles = new MaterialVisualizer(CONFIG, new Point(256,256));
const setup = new RandomNaivigationSetupGenerator({
    tilePicker: tilePicker,
    visualizer: visualizerTiles
});

const setupCallback = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    turn.gameData.elevation = 1 + Math.floor(Math.random() * 4)
}


// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];
    const oldPosition = setup.getVehicleData(0).position;

    if(key == "turn")
    {
        const turnDir = Math.random() <= 0.5 ? 1 : -1;
        const str = (turnDir == 1) ? "right" : "left";
        setup.rotatePlayer(0, turnDir);
        fb.push("The Turn card rotated the airplane to the " + str + ". (That's the direction the start player chose in the moment, without discussion.)");
    }

    if(key == "fly")
    {
        setup.movePlayerForward(0, 1, true);
        fb.push("The Fly card moved the airplane 1 step forward (in the direction it faces).");
        
        const curTile = setup.getVehicleData(0).tile;
        const curTileElevation = curTile.customData.elevation;
        const ourElevation = turn.gameData.elevation;
        const wrongElevation = ourElevation <= curTileElevation || (curTile.isCollectible() && ourElevation < curTileElevation);

        if(wrongElevation)
        {
            setup.setPlayerPosition(0, oldPosition);
            fb.push("But our elevation was wrong! So we take 1 damage and stay where we are.");
        }
    }

    if(key == "stunt")
    {
        setup.movePlayerForward(0, 1, true);
        fb.push("The Stunt card moved the airplane 1 step forward (in the direction it faces).");
    }

    if(key == "elevate")
    {
        const cardIndex = turn.getCardIndex(card);
        const elevateDir = ((cardIndex + 1) % 2 == 1) ? +1 : -1;
        const elevateDirString = elevateDir > 0 ? "+" + elevateDir : elevateDir.toString();
        fb.push("The Elevate card was played to slot " + (cardIndex + 1) + ", so the airplane elevation goes " + elevateDirString + ".");
        
        const newElevation = turn.gameData.elevation + elevateDir;
        turn.gameData.elevation = Math.min(Math.max(newElevation, 1), 4);
    }

    const curTile = setup.getVehicleData(0).tile;
    const onCollectible = curTile.isCollectible();
    if(onCollectible)
    {
        const curTileElevation = curTile.customData.elevation;
        const ourElevation = turn.gameData.elevation;

        const correctOrient = ourElevation == curTileElevation;
        if(correctOrient) 
        {
            fb.push("Great! You landed on an airport (with the correct orientation). Collect it.");
            setup.collectCurrentTile();
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