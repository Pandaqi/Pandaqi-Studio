import MaterialGenerator from "lib/pq-games/tools/generation/materialGenerator";
import CONFIG from "../js_shared/config";
import CardPicker from "./cardPicker";
import TilePicker from "./tilePicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.start();

