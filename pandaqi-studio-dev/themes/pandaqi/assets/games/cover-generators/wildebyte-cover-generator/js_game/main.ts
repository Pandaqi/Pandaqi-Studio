import BookCoverGenerator from "lib/pq-games/tools/bookCovers/bookCoverGenerator";
import { CONFIG } from "./config";
import CALLBACKS from "./callbacks";

const gen = new BookCoverGenerator().setConfig(CONFIG).setCallbacks(CALLBACKS);
gen.generate();