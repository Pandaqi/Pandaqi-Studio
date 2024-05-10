import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import CONFIG from "../js_shared/config";
import TilePicker from "./tilePicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.start();

