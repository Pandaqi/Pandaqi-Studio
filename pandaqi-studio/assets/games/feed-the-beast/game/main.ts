import CONFIG from "../shared/config";
import CardPicker from "./cardPicker";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import TilePicker from "./tilePicker";
import TokenPicker from "./tokenPicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("food", TokenPicker, CONFIG.foodTokens.drawerConfig);
generator.addPipeline("beasts", TilePicker, CONFIG.beasts.drawerConfig);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.start();

