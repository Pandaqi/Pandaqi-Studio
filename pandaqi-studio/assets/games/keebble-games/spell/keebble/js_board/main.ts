import BoardGeneration from "games/keebble-games/js_shared/boardGeneration";
import CONFIG from "games/keebble-games/js_shared/config";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGenerator from "js/pq_games/tools/generation/boardGenerator";

const gen = new BoardGenerator(CONFIG, new RendererPixi());
gen.drawerClass = BoardGeneration;
gen.start();