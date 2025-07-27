import loadPrinceDataIntoRules from "games/throneless-games/shared/loadPrinceDataIntoRules";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import CardPicker from "../game/cardPicker";
import CONFIG from "../shared/config";
import { PACKS } from "../shared/dict";
import generateShared from "games/throneless-games/shared/rules/generateShared";
import { callbackFinishStats, callbackInitStats } from "games/throneless-games/shared/rules/callbackStats";

const generateContainer = async (sim:InteractiveExampleSimulator) =>
{
    await generateShared(sim, CONFIG, PACKS);
}

loadPrinceDataIntoRules(PACKS);

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 100;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example round!",
    callback: generateContainer,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { card: CardPicker },
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        showFullGame: SHOW_FULL_GAME,
        callbackInitStats,
        callbackFinishStats,
    }
})