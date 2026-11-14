import { loadGame } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import "../game/generators"; // registers the material pickers on CONFIG (see pickerRegistry)

loadGame(CONFIG);