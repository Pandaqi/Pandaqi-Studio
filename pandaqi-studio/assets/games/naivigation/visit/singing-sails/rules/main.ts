import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import RandomNaivigationSetupGenerator from "games/naivigation/shared/randomNaivigationSetupGenerator";
import RandomNaivigationTurnGenerator from "games/naivigation/shared/randomNaivigationTurnGenerator";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker, tilePicker } from "../game/generators";
import { CONFIG } from "../shared/config";

const visualizerTiles = new MaterialVisualizer(CONFIG, new Point(256,256));
const setup = new RandomNaivigationSetupGenerator({
    tilePicker: tilePicker,
    visualizer: visualizerTiles
});

const setupCallback = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    turn.gameData.wind = Math.floor(Math.random() * 4);
    turn.gameData.compass = new Point().fromAngle(Math.floor(Math.random() * 4) * 0.5 * Math.PI);
}

// given the card and current map/round state, what happens?
const movementCallback = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) =>
{
    const key = card.key;
    const fb = [];
    const oldPosition = setup.getVehicleData(0).position;

    if(key == "rotate")
    {
        const turnDir = card.customData.turnDirection;
        const str = (turnDir == 1) ? "right" : "left";
        const rotateShip = Math.random() <= 0.5;

        if(rotateShip) {
            setup.rotatePlayer(0, turnDir);
            fb.push("The Rotate card rotated the Ship to the " + str + ".");
        } else {
            turn.gameData.compass.rotate(0.5*Math.PI);
            fb.push("The Rotate card rotated the Compass to the " + str + ".");
        }
    }

    if(key == "sail")
    {
        const windValue = turn.gameData.wind;
        const compassDir = turn.gameData.compass;
        const movement = compassDir.clone().scale(windValue);

        setup.movePlayer(0, movement);
        fb.push("The Sail card moved the ship " + windValue + " spaces ( = Wind strength) in the direction (x=" + compassDir.x + ",y=" + compassDir.y + ").");

        // @TODO: check if off-board, if so, add new tile?
    }

    if(key == "wind")
    {
        const windDir = Math.random() <= 0.5 ? 1 : -1;
        const str = (windDir == 1) ? "+1" : "-1";

        const newWind = turn.gameData.wind + windDir
        turn.gameData.wind = Math.min(Math.max(newWind, 0), 4);
        fb.push("The Wind card changed wind strength by " + str + ". (That's the direction the start player chose, without discussion.)");
    }

    const curTile = setup.getVehicleData(0).tile;
    const curPosition = setup.getVehicleData(0).position;
    const movement = curPosition.clone().sub(oldPosition);
    const cameFromRot = setup.convertVectorToRotation(movement);

    const onCollectible = curTile.isCollectible();
    if(onCollectible)
    {
        const cameFromCorrectSide = setup.getCellAt(curPosition).rot == (cameFromRot + 2) % 4
        if(cameFromCorrectSide) {
            fb.push("Great! You arrived at a harbor. Collect it.");
            setup.collectCurrentTile();
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