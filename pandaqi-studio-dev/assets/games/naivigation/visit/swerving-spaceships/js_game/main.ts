import CONFIG from "../js_shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import { createCardPicker, createTilePicker } from "./generators";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", createTilePicker(), CONFIG.tiles.drawerConfig);
generator.addPipeline("cards", createCardPicker(), CONFIG.cards.drawerConfig);
generator.start();