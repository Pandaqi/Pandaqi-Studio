import CONFIG from "../shared/config";
import CardPicker from "./cardPicker";
import Game from "./game/game";
import TokenPicker from "./tokenPicker";
import Visualizer from "./visualizer";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

// @NOTE: this happens again inside MaterialGenerator, but that should never cause issues
const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] ?? "{}");
Object.assign(CONFIG, userConfig);

// either load game or generate material
if(userConfig.digitalGame) {
    const game = new Game(CONFIG);
    game.start();
} else {
    const generator = new MaterialGenerator(CONFIG);
    generator.visualizerClass = Visualizer;
    generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
    generator.addPipeline("tokens", TokenPicker, CONFIG.cards.tokenConfig);
    generator.start();
}

