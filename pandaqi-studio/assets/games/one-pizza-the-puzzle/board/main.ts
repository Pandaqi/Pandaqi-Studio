import { CONFIG } from "./config";
import BoardGeneration from "./boardGeneration";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator"
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();