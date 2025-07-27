import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import CONFIG from "../shared/config";
import SliderPicker from "./sliderPicker";
import WordPicker from "./wordPicker";
import loadPandaqiWords from "../shared/loadPandaqiWords";

const asyncWrapper = async () => 
{
    CONFIG.pandaqiWords = await loadPandaqiWords(CONFIG, true);

    const generator = new MaterialGenerator(CONFIG);
    generator.addPipeline("sliders", SliderPicker, CONFIG.sliderCards.drawerConfig);
    generator.addPipeline("words", WordPicker, CONFIG.wordCards.drawerConfig);
    generator.start();
}

asyncWrapper();

