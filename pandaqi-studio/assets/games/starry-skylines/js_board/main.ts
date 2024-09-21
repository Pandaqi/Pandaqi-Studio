import CONFIG from "../js_shared/config";
import BoardGeneration from "./boardGeneration";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();