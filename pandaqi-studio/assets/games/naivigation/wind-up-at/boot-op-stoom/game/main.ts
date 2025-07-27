import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import CONFIG from "../shared/config";
import CardPicker from "./cardPicker";
import TilePicker from "./tilePicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.start();

