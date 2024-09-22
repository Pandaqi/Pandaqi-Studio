import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";
import CONFIG from "./config";
import BoardGeneration from "./generation";

const renderer = new RendererPixi();
const resLoader = new ResourceLoader({ base: CONFIG.assetsBase, renderer: renderer });
resLoader.planLoadMultiple(CONFIG.assets);
const vis = new BoardVisualizer({ config: CONFIG, resLoader: resLoader, renderer: renderer });
const gen = new BoardGeneration();
gen.start(vis);