import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";
import PHOTOMONE_BASE_PARAMS from "../../../js_shared/config";
import BoardGeneration from "./boardGeneration";

const gen = new BoardGenerator(PHOTOMONE_BASE_PARAMS, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();