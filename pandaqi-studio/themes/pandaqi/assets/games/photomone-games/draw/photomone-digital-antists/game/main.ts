import { CONFIG } from "../shared/config";
import Game from "./game";

const callback = async () => 
{ 
    const game = new Game();
    await game.start();
}

loadSettings(CONFIG, callback);