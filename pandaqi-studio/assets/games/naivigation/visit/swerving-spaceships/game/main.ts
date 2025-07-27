import CONFIG from "../shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import { cardPicker, tilePicker } from "./generators";
import planetPropertiesPicker from "./planetPropertiesPicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("tiles", tilePicker, CONFIG.tiles.drawerConfig);
generator.addPipeline("cards", cardPicker, CONFIG.cards.drawerConfig);
if(CONFIG.sets.trade) { generator.addPipeline("props", planetPropertiesPicker, CONFIG.cards.drawerConfig); }
generator.start();