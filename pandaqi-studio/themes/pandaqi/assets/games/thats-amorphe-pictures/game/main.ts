import { CONFIG } from "games/thats-amorphe/shared/config";
import { loadGame } from "lib/pq-games";

CONFIG.expansion = "pictures";
loadGame(CONFIG);