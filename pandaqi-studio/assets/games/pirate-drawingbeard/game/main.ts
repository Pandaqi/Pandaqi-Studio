
import BoardGeneration from "./generation"
import { CONFIG } from "../shared/config";
import { ResourceLoader, MaterialVisualizer, loadSettings, createRenderer } from "lib/pq-games";

// @NOTE: The `BoardGeneration` starts the interface AND contains completely custom code for creating the PDF
// (I initially thought about splitting the code into `board` and `game`, but that isn't really useful. Because the game NEEDS a board too, and the board NEEDS the hint images too)
const callback = async (cfg) =>
{
    const renderer = createRenderer({ force: "canvas" });
    const resLoader = new ResourceLoader({ base: CONFIG._resources.base, renderer: renderer });
    resLoader.planLoadMultiple(CONFIG._resources.files);
    CONFIG._game.renderer = renderer;
    CONFIG._game.resLoader = resLoader;
    const vis = new MaterialVisualizer(CONFIG, CONFIG.size);
    const gen = new BoardGeneration();
    gen.start(vis);
}

loadSettings(CONFIG, callback);