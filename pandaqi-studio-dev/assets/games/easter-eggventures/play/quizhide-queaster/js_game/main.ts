import CONFIG from "../js_shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import TilePicker from "./tilePicker";
import EggPicker from "./eggPicker";
import CardPicker from "./cardPicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("eggs", EggPicker, CONFIG.eggs.drawerConfig);
generator.addPipeline("tiles", TilePicker, CONFIG.tiles.drawerConfig);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.start();