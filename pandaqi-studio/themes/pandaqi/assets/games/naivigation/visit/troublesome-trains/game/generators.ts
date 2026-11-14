import { TileType } from "games/naivigation/shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/shared/generalPickerNaivigation";
import { CONFIG } from "../shared/config";
import { registerPicker } from "games/naivigation/shared/pickerRegistry";
import { MATERIAL } from "../shared/dict";
import Card from "./card";
import Tile from "./tile";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { shuffle, getSetting } from "lib/pq-games";

export const cardPicker = registerPicker("cards", new GeneralPickerNaivigation(CONFIG, Card).addMaterialData("card", MATERIAL));
export const tilePicker = registerPicker("tiles", new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData("tile", MATERIAL).addTerrainData(CONFIG.generation.terrainDist).addNetworkData(CONFIG.generation.networks.typeDistribution, CONFIG.generation.networks.keyDistribution));

cardPicker.generateCallback = () =>
{
    const trainCards = cardPicker.get().filter((e:MaterialNaivigation) => e.key == "train");
    const numTrainCards = trainCards.length;
    if(numTrainCards > 0)
    {
        // first figure out how _many_ (different icons/colors) we want for each vehicle card
        const dist:Record<number, number> = CONFIG.generation.cards.trainVehicle.distribution;
        const numColors = [];
        let totalNumColors = 0;
        for(const [num,freqRaw] of Object.entries(dist))
        {
            const freq = Math.ceil(freqRaw * numTrainCards);
            totalNumColors += freq*parseInt(num);
            for(let i = 0; i < freq; i++)
            {
                numColors.push(parseInt(num));
            }
        }
        shuffle(numColors);

        // keep a helper dictionary with how often each type has been picked already
        const freqDist = {};
        const allOptions = CONFIG.generation.cards.trainVehicle.options;
        for(const option of allOptions)
        {
            freqDist[option] = 0;
        }

        // then just draw from that, picking the LEAST USED option that we HADN'T PICKED YET
        for(const card of trainCards)
        {
            const num = numColors.pop();
            const pickedOptions = [];
            const allOptions = Object.keys(freqDist);
            for(let i = 0; i < num; i++)
            {
                const leastUsed = shuffle(allOptions) // get all options in random order (to prevent sorting always yielding the same thing)
                    .sort((a:string, b:string) => freqDist[a] - freqDist[b])[0]; // sort ascending, pick first
                allOptions.splice(allOptions.indexOf(leastUsed), 1);
                pickedOptions.push(leastUsed);
                freqDist[leastUsed]++;
            }

            card.customData.trainKeys = pickedOptions;
        }
    }
}


tilePicker.generateCallback = () =>
{
    if(getSetting("sets.mapTiles", CONFIG))
    {
        // the switch tiles
        for(let i = 0; i < CONFIG.generation.tiles.custom.numSwitchTemplates; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "switch", { num: i }));
        }
    }

    if(getSetting("expansions.directionDelay", CONFIG))
    {
        // the train tile for each possible vehicle
        for(const [key,data] of Object.entries(MATERIAL[TileType.VEHICLE]))
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "train", { vehicleKey: key }));
        }
    }
}