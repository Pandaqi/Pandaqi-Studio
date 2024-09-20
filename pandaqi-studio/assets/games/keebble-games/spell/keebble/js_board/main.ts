import { BoardGeneration } from "games/keebble-games/js_shared/boardGeneration";
import CONFIG from "games/keebble-games/js_shared/config";
import BoardVisualizer from "js/pq_games/website/boardVisualizer";

const vis = new BoardVisualizer({ config: CONFIG, scene: BoardGeneration, backend: "phaser" });