import { CONFIG } from "../shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import TilePicker from "./tilePicker";
import EggPicker from "./eggPicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("eggs", EggPicker, CONFIG.eggs.drawerConfig);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.start();