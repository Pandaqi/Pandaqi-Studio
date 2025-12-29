import { loadGame, loadSettings } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import Game from "./game/game";

const callback = async (config) =>
{
    if(CONFIG._settings.loadDigitalGame.value) {
        const game = new Game(CONFIG);
        game.start();
    } else {
        loadGame(CONFIG);
    }
}

loadSettings(CONFIG, callback);