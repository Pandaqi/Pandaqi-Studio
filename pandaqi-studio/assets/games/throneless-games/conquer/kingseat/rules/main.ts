import loadPrinceDataIntoRules from "games/throneless-games/shared/loadPrinceDataIntoRules";
import generateShared from "games/throneless-games/shared/rules/generateShared";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import CONFIG from "../shared/config";
import { PACKS } from "../shared/dict";

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 1000;
const SHOW_FULL_GAME = false;

const callback = async (sim:InteractiveExampleSimulator) => { await generateShared(sim, CONFIG, PACKS) };
CONFIG._rulebook.examples["turn-kingseat"].callback = callback;
CONFIG._rulebook.examples["turn-kingseat"].simulator.enabled = SIMULATION_ENABLED;
CONFIG._rulebook.examples["turn-kingseat"].simulator.iterations = SIMULATION_ITERATIONS;
CONFIG._rulebook.examples["turn-kingseat"].simulator.showFullGame = SHOW_FULL_GAME;

loadRulebook(CONFIG._rulebook);

loadPrinceDataIntoRules(PACKS);

