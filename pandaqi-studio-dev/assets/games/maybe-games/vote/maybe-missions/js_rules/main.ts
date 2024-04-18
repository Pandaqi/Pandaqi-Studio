import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";

async function generate()
{
    await resLoader.loadPlannedResources();
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoadMultiple(CONFIG.assets);

CONFIG.resLoader = resLoader;
CONFIG.itemSize = new Point(CONFIG.rulebook.tileSize);
const visualizer = new MaterialVisualizer(CONFIG);

const picker = new CardPicker();
picker.generate();
