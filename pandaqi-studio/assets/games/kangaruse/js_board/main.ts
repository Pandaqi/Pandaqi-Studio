import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";
import BoardGeneration from "./boardGeneration";
import CONFIG from "./config";

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();

