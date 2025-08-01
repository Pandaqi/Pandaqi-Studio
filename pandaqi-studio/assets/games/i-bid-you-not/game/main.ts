import { CONFIG } from "../shared/config";
import TilePicker from "./tilePicker";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.start();

