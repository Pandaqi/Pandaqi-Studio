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
        wind: Math.floor(Math.random() * 4),
        compass: new Point().fromAngle(Math.floor(Math.random() * 4) * 0.5 * Math.PI),
    }
    Object.assign(setup.playerToken.customData, initialData);
}

// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];
    const oldPosition = setup.playerTokenData.position;

    if(key == "rotate")
    {
        const turnDir = card.customData.turnDirection;
        const str = (turnDir == 1) ? "right" : "left";
        const rotateShip = Math.random() <= 0.5;

        if(rotateShip) {
            setup.rotatePlayer(turnDir);
            fb.push("The Rotate card rotated the Ship to the " + str + ".");
        } else {
            setup.playerToken.customData.compass.rotate(0.5*Math.PI);
            fb.push("The Rotate card rotated the Compass to the " + str + ".");
        }
    }

    if(key == "sail")
    {
        const windValue = 1
        const compassDir = new Point(1,0);
        const movement = compassDir.clone().scale(windValue);

        setup.movePlayer(movement);
        fb.push("The Sail card moved the ship " + windValue + " spaces ( = Wind strength) in the direction (x=" + compassDir.x + ",y=" + compassDir.y + ").");

        // @TODO: check if off-board, if so, add new tile?
    }

    if(key == "wind")
    {
        const windDir = Math.random() <= 0.5 ? 1 : -1;
        const str = (windDir == 1) ? "+1" : "-1";

        const newWind = setup.playerToken.customData.wind + windDir
        setup.playerToken.customData.wind = Math.min(Math.max(newWind, 0), 4);
        fb.push("The Wind card changed wind strength by " + str + ". (That's the direction the start player chose, without discussion.)");
    }

    const curTile = setup.playerTokenData.tile;
    const curPosition = setup.playerTokenData.position;
    const movement = curPosition.clone().sub(oldPosition);
    const cameFromRot = setup.convertVectorToRotation(movement);

    const onCollectible = curTile.isCollectible();
    if(onCollectible)
    {
        const cameFromCorrectSide = setup.getCellAt(curPosition).rot == (cameFromRot + 2) % 4
        if(cameFromCorrectSide) {
            fb.push("Great! You arrived at a harbor. Collect it.");
            setup.getCellAt(setup.playerTokenData.position).facedown = true
        } else {
            fb.push("Oh no! You tried to reach the harbor, but came from the wrong side and hit land instead.");
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