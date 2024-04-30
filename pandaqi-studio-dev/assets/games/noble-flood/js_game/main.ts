import CONFIG from "../js_shared/config";
import CardPicker from "./cardPicker";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.start();

