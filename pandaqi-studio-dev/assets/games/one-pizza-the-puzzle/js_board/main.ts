import BoardVisualizer from "js/pq_games/website/boardVisualizer";
import CONFIG from "./config";
import BoardGeneration from "./boardGeneration";
import RendererPhaser from "js/pq_games/layout/renderers/rendererPhaser";

const boardVisualizer = new BoardVisualizer({ config: CONFIG, scene: BoardGeneration, renderer: new RendererPhaser() });