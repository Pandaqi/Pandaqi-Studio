import BookCoverGenerator from "js/pq_games/tools/generation/bookCovers/bookCoverGenerator";
import CONFIG from "./config";
import CALLBACKS from "./callbacks";

const gen = new BookCoverGenerator().setConfig(CONFIG).setCallbacks(CALLBACKS);
gen.generate();