import { CONFIG } from "../shared/config";
import BoardGeneration from "./boardGeneration";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";

const vis = new BoardGenerator(CONFIG, new RendererPixi());
vis.drawerClass = BoardGeneration;
vis.start();