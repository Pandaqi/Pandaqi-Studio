import CONFIG from "../shared/config";
import MaterialGenerator from "js/pq_games/tools/generation/materialGenerator";
import CardPicker from "./cardPicker";
import VotePicker from "./votePicker";

const generator = new MaterialGenerator(CONFIG);
generator.addPipeline("cards", CardPicker, CONFIG.cards.drawerConfig);
generator.addPipeline("votes", VotePicker, CONFIG.votes.drawerConfig);
generator.start();