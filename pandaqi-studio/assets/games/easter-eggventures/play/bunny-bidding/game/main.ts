import { CONFIG } from "../shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import TilePicker from "./tilePicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.start();