import { CONFIG } from "../shared/config";
import CardPicker from "./cardPicker";
import Game from "./game/game";
import TokenPicker from "./tokenPicker";
import Visualizer from "./visualizer";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const callback = async (config) =>
{
    if(CONFIG._settings.loadDigitalGame.value) {
        const game = new Game(CONFIG);
        game.start();
    } else {
        const generator = new MaterialGenerator(CONFIG);
        generator.visualizerClass = Visualizer;
        generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
        generator.addPipeline("tokens", TokenPicker, CONFIG.cards.tokenConfig);
        generator.start();
    }
}

loadSettings(CONFIG, callback);