import GeneralPickerNaivigation from "games/naivigation/js_shared/generalPickerNaivigation";
import CONFIG from "../js_shared/config";
import { MATERIAL } from "../js_shared/dict";
import Card from "./card";
import Tile from "./tile";

const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData(MATERIAL);
const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData(MATERIAL);

export {
    cardPicker,
    tilePicker
};
