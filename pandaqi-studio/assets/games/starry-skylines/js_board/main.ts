import BoardVisualizer from "js/pq_games/website/boardVisualizer";
import CONFIG from "../js_shared/config";
import BoardGeneration from "./boardGeneration";

const vis = new BoardVisualizer({ config: CONFIG, scene: BoardGeneration, backend: "phaser" });