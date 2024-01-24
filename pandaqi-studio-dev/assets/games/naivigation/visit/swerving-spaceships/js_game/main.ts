import CONFIG from "../js_shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import CardPicker from "./cardPicker";
import TilePicker from "./tilePicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.start();

