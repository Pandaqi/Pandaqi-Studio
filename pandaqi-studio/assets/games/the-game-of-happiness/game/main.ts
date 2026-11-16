import { defaultGameCallback, getSetting, loadSettings } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import Game from "./game/game";

const callback = async (config) =>
{
    if(getSetting("loadDigitalGame", CONFIG)) {
        const game = new Game(CONFIG);
        game.start();
        return;
    }

    // generate the physical material with the settings panel that is already on the page; calling
    // loadGame() here would mount a second settings panel instead of generating anything
    await defaultGameCallback(config);
}

loadSettings(CONFIG, callback);
