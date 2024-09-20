import BoardVisualizer, { VisualizerRenderer } from "js/pq_games/website/boardVisualizer";
import CONFIG from "./config";
import BoardGeneration from "./boardGeneration";

const boardVisualizer = new BoardVisualizer({ config: CONFIG, scene: BoardGeneration, renderer: VisualizerRenderer.PHASER });