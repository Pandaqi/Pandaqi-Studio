import loadPrinceDataIntoRules from "games/throneless-games/shared/loadPrinceDataIntoRules";
import generateShared from "games/throneless-games/shared/rules/generateShared";
import { CONFIG } from "../shared/config";
import { PACKS } from "../shared/dict";
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 1000;
const SHOW_FULL_GAME = false;

const callback = async (sim:InteractiveExampleSimulator) => { await generateShared(sim, CONFIG, PACKS) };
const CONFIG_RULEBOOK = 
{
    examples:
    {
        "turn-kaizerseat":
        {
            enabled: SIMULATION_ENABLED,
            iterations: SIMULATION_ITERATIONS,
            showFullGame: SHOW_FULL_GAME,
            callback: callback,
        }
    }
}

loadRulebook(CONFIG_RULEBOOK);
loadPrinceDataIntoRules(PACKS);

