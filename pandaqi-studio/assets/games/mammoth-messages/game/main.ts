import { CONFIG } from "../shared/config";
import CardPicker from "./cardPicker";
import DrawingPicker from "./drawingPicker";
import TokenPicker from "./tokenPicker";
import Visualizer from "./visualizer";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const generator = new MaterialGenerator(CONFIG);
generator.setVisualizerClass(Visualizer);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.addPipeline("drawings", DrawingPicker, CONFIG.drawings.drawerConfig);
generator.addPipeline("tokens", TokenPicker, CONFIG.tokens.drawerConfig);
generator.start();

