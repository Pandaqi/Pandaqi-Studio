import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";

const callbackInitStats = () =>
{
    return {}
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 100;
const SHOW_FULL_GAME = false;

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example turn!",
    callback: generate,
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