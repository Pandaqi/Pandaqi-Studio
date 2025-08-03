import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import BoardGeneration from "./generation"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CONFIG } from "../shared/config";

// @NOTE: The `BoardGeneration` starts the interface AND contains completely custom code for creating the PDF
// (I initially thought about splitting the code into `board` and `game`, but that isn't really useful. Because the game NEEDS a board too, and the board NEEDS the hint images too)
const callback = async (cfg) =>
{
    const renderer = new RendererPixi();
    const resLoader = new ResourceLoader({ base: CONFIG._resources.base, renderer: renderer });
    resLoader.planLoadMultiple(CONFIG._resources.files);
    const vis = new MaterialVisualizer({ config: CONFIG, resLoader: resLoader, renderer: renderer });
    const gen = new BoardGeneration();
    gen.start(vis);
}

loadSettings(CONFIG, callback);