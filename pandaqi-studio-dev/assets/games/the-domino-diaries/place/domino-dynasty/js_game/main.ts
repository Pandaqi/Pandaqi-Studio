import CONFIG from "../js_shared/config";
import DominoPicker from "./dominoPicker";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("dominoes", DominoPicker, CONFIG.dominoes.drawerConfig);
generator.start();

