import CONFIG from "../js_shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import { cardPicker, tilePicker } from "./generators";

tilePicker.generate();
console.log(tilePicker.get());

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", tilePicker, CONFIG.tiles.drawerConfig);
generator.addPipeline("cards", cardPicker, CONFIG.cards.drawerConfig);
generator.start();