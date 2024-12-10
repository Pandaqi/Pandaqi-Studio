import { TileType } from "games/naivigation/js_shared/dictShared";
import GeneralPickerNaivigation from "games/naivigation/js_shared/generalPickerNaivigation";
import CONFIG from "../js_shared/config";
import { MATERIAL } from "../js_shared/dict";
import Card from "./card";
import Tile from "./tile";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import shuffle from "js/pq_games/tools/random/shuffle";

const cardPicker = new GeneralPickerNaivigation(CONFIG, Card).addMaterialData(MATERIAL);
const tilePicker = new GeneralPickerNaivigation(CONFIG, Tile).addMaterialData(MATERIAL).addTerrainData(CONFIG.generation.terrainDist).addNetworkData(CONFIG.generation.networks.typeDistribution, CONFIG.generation.networks.keyDistribution);

cardPicker.generateCallback = () =>
{
    const trainCards = cardPicker.get().filter((e:MaterialNaivigation) => e.key == "train");
    const numTrainCards = trainCards.length;
    if(numTrainCards > 0)
    {
        // first figure out how _many_ (different icons/colors) we want for each vehicle card
        const dist:Record<number, number> = cardPicker.config.cards.trainVehicle.distribution;
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
        const allOptions = cardPicker.config.cards.trainVehicle.options;
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
    if(tilePicker.config.sets.mapTiles)
    {
        // the switch tiles
        for(let i = 0; i < tilePicker.config.custom.numSwitchTemplates; i++)
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "switch", { num: i }));
        }
    }

    if(tilePicker.config.sets.directionDelay)
    {
        // the train tile for each possible vehicle
        for(const [key,data] of Object.entries(MATERIAL[TileType.VEHICLE]))
        {
            tilePicker.addSingle(new Tile(TileType.CUSTOM, "train", { vehicleKey: key }));
        }
    }
}

export {
    cardPicker,
    tilePicker
};
