import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGeneration from "./generation"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import MaterialVisualizer from "js/pq_games/tools/generation/MaterialVisualizer";
import { CONFIG } from "./config";

// @TODO: Wait how does it start the actual game interface now?? => Shouldn't I split this into `game` and `board` folders?
const renderer = new RendererPixi();
const resLoader = new ResourceLoader({ base: CONFIG.assetsBase, renderer: renderer });
resLoader.planLoadMultiple(CONFIG.assets);
const vis = new MaterialVisualizer({ config: CONFIG, resLoader: resLoader, renderer: renderer });
const gen = new BoardGeneration();
gen.start(vis);