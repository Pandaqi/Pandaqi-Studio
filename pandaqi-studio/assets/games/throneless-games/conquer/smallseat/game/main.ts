import { CONFIG } from "../shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import CardPicker from "./cardPicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.start();