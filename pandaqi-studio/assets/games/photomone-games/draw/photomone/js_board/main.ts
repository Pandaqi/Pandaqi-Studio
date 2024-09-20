import BoardVisualizer from "js/pq_games/website/boardVisualizer";
import PHOTOMONE_BASE_PARAMS from "../../../js_shared/config";
import BoardGeneration from "./boardGeneration";

const vis = new BoardVisualizer({ config: PHOTOMONE_BASE_PARAMS, scene: BoardGeneration, backend: "phaser" });