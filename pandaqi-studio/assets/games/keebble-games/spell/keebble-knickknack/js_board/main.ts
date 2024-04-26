import { BoardGeneration, sceneKey } from "games/keebble-games/js_shared/boardGeneration";
import OnPageVisualizer from "js/pq_games/website/onPageVisualizer"

OnPageVisualizer.linkTo({ scene: BoardGeneration, key: sceneKey, backend: "phaser" });
