import CONFIG from "../shared/config";
import CardPicker from "./cardPicker";
import Visualizer from "./visualizer";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const generator = new MaterialGenerator(CONFIG);
generator.visualizerClass = Visualizer;
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.start();