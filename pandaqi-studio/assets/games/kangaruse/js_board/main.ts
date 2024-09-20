import BoardVisualizer, { VisualizerRenderer } from "js/pq_games/website/boardVisualizer";
import BoardGeneration from "./boardGeneration";
import CONFIG from "./config";

const vis = new BoardVisualizer({ config: CONFIG, scene: BoardGeneration, renderer: VisualizerRenderer.PHASER });

