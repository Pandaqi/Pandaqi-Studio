import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import RandomNaivigationSetupGenerator from "games/naivigation/js_shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/js_shared/randomNaivigationTurnGenerator";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../js_game/generators";
import CONFIG from "../js_shared/config";

const visualizerTiles = new MaterialVisualizer(CONFIG, new Point(256,256));
const setup = new RandomNaivigationSetupGenerator({
    tilePicker: tilePicker,
    visualizer: visualizerTiles
});

const setupCallback = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const initialData = 
    {
        elevation: 1 + Math.floor(Math.random() * 4),
    }
    Object.assign(setup.playerToken.customData, initialData);
}


// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];
    const oldPosition = setup.playerTokenData.position;

    if(key == "turn")
    {
        const turnDir = Math.random() <= 0.5 ? 1 : -1;
        const str = (turnDir == 1) ? "right" : "left";
        setup.rotatePlayer(turnDir);
        fb.push("The Turn card rotated the airplane to the " + str + ". (That's the direction the start player chose in the moment, without discussion.)");
    }

    if(key == "fly")
    {
        setup.movePlayerForward(1, true);
        fb.push("The Fly card moved the airplane 1 step forward (in the direction it faces).");
        
        const curTile = setup.playerTokenData.tile;
        const curTileElevation = curTile.customData.elevation;
        const ourElevation = setup.playerToken.customData.elevation;
        const wrongElevation = ourElevation <= curTileElevation || (curTile.isCollectible() && ourElevation < curTileElevation);

        if(wrongElevation)
        {
            setup.movePlayerBackward(1, true);
            fb.push("But our elevation was wrong! So we take 1 damage and stay where we are.");
        }
    }

    if(key == "stunt")
    {
        setup.movePlayerForward(1, true);
        fb.push("The Stunt card moved the airplane 1 step forward (in the direction it faces).");
    }

    if(key == "elevate")
    {
        const cardIndex = turn.getCardIndex(card);
        const elevateDir = ((cardIndex + 1) % 2 == 1) ? +1 : -1;
        fb.push("The Elevate card was played to slot " + (cardIndex + 1) + ", so the airplane elevation goes " + elevateDir + ".");
        
        const newElevation = setup.playerToken.customData.elevation + elevateDir;
        setup.playerToken.customData.elevation = Math.min(Math.max(newElevation, 1), 4);
    }

    const curTile = setup.playerTokenData.tile;
    const onCollectible = curTile.isCollectible();
    if(onCollectible)
    {
        const curTileElevation = curTile.customData.elevation;
        const ourElevation = setup.playerToken.customData.elevation;

        const correctOrient = ourElevation == curTileElevation;
        if(correctOrient) 
        {
            fb.push("Great! You landed on an airport (with the correct orientation). Collect it.");
            setup.getCellAt(setup.playerTokenData.position).facedown = true
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