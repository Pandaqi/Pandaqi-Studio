import CONFIG from "../js_shared/config";
import CardPicker from "./cardPicker";
import TokenPicker from "./tokenPicker";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.addPipeline("tokens", TokenPicker, CONFIG.tokens.drawerConfig);
generator.start();

