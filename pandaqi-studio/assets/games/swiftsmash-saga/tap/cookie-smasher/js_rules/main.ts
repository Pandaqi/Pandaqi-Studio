import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleGenerator from "js/pq_rulebook/examples/interactiveExampleGenerator";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import RulesSettings, { SettingsType } from "js/pq_rulebook/examples/rulesSettings";
import Card from "../js_game/card";
import CardPicker from "../js_game/cardPicker";
import CONFIG from "../js_shared/config";
import Round from "./round";

const callbackInitStats = () =>
{
    return {
        cardPoisoned: { NONE: 0 },
        cardFreq: { NONE: 0 }, // used to be CONFIG.numSimulationsSets? Why?
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const s = sim.getStats();
    const i = sim.getIterations();

    // now assemble POISON and FREQUENCY stats into an accurate probability (given as PERCENTAGE)
    // "how often, when this card was in the set, was it the poisoned one?"
    const finalStats : Record<string,number> = {};
    let mean = 0;
    for(const [key,data] of Object.entries(s.stats.cardPoisoned as Record<string,number>))
    {
        const howOftenItOccured = i * s.stats.cardFreq[key];
        const howOftenItWasPoisoned = data;
        const val = Math.round((howOftenItWasPoisoned / howOftenItOccured) * 100);
        finalStats[key] = val;
        mean += val;
    }

    const numElements = Object.keys(finalStats).length;
    mean /= numElements;

    let mse = 0;
    let bestElem = null, bestVal = -Infinity;
    let worstElem = null, worstVal = Infinity;
    for(const [key,data] of Object.entries(finalStats))
    {
        mse += Math.pow(data - mean, 2);
        if(data > bestVal) { bestVal = data; bestElem = key; }
        if(data < worstVal) { worstVal = data; worstElem = key; }
    }
    mse /= numElements;

    console.log("MEAN: " + mean);
    console.log("MSE: " + mse);
    console.log("STANDARD DEVIATION: " + Math.sqrt(mse));
    console.log("BEST: " + bestElem + " with " + bestVal);
    console.log("WORST: " + worstElem + " with " + worstVal);

    console.log(finalStats);
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    // > get all generated cards
    const cardPicker = sim.getPicker("card");
    CONFIG.cardSet = settings.get("set") as string;
    cardPicker.generate();

    // > cards on the table
    const allCards : Card[] = shuffle(cardPicker.get());
    const numCards = rangeInteger(4,6);
    sim.print("These cards were played. (Imagine they're in a circle. The first card is from the king.)");
    const round = new Round().addCards(allCards.splice(0, numCards));
    sim.listImages(round, "draw");

    const cardsTrue = round.getTrueCards();
    if(cardsTrue.length <= 0) { sim.print("No card is true. Smash your own card!"); return; }

    // > which cards are true
    const duplicateNumbers = round.hasDuplicateNumbers();
    let str = "The following cards are TRUE.";
    if(duplicateNumbers) { str += " (If numbers are duplicate, only the first is evaluated.)"; }
    sim.print(str);
    const roundTrue = new Round().addCards(cardsTrue);
    sim.listImages(roundTrue, "draw");

    if(cardsTrue.length == 1) { sim.print("Smash that card to win the round!"); return; }

    // > which of those has the highest number
    const cardsHighest = round.getHighest(cardsTrue);
    const roundHighest = new Round().addCards(cardsHighest);
    sim.print("Multiple are true, so search for the highest number:");
    sim.listImages(roundHighest, "draw");
    sim.print("Smash that card to win the round!");

    // > update the simulation
    for(const card of round.cards)
    {
        sim.stats.cardFreq[card.type] = (sim.stats.cardFreq[card.type] ?? 0) + 1;
    }

    const result = round.getPoisonedFood();
    const dictKey = (!result || result.length <= 0) ? "NONE" : result[0].type;
    sim.stats.cardPoisoned[dictKey] = (sim.stats.cardPoisoned[dictKey] ?? 0) + 1;
}

const SIMULATION_ENABLED = false;
const SIMULATION_ITERATIONS = 100;
const SHOW_FULL_GAME = false;

const settings = new RulesSettings();
settings.add({ id: "set", type: SettingsType.ENUM, values: ["starter", "beginner", "amateur", "advanced", "expert", "random"], label: "Card Set?" });

const gen = new InteractiveExampleGenerator({
    id: "turn",
    buttonText: "Give me an example round!",
    callback: generate,
    config: CONFIG,
    itemSize: CONFIG.rulebook.itemSize,
    pickers: { card: CardPicker },
    settings: settings,
    simulateConfig: {
        enabled: SIMULATION_ENABLED,
        iterations: SIMULATION_ITERATIONS,
        showFullGame: SHOW_FULL_GAME,
        callbackInitStats,
        callbackFinishStats,
    }
})
