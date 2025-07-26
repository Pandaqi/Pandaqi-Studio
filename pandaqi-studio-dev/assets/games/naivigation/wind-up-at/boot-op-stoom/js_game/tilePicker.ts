import shuffle from "lib/pq-games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardType, GeneralData, MAP_TILES, PAKJE_CARDS } from "../js_shared/dict";
import Card from "./card";

export default class TilePicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        const sets = ["base", "prachtigePakjes", "pepernootPlekken"];
        for(const set of sets)
        {
            if(!CONFIG.sets[set]) { continue; }
            this.generateCardsForSet(set);
        }
        this.generateRebelsePietjes();

        console.log(this.cards);
    }

    generateCardsForSet(set:string = "base")
    {
        // the map tiles
        const mapTiles = this.filterSet(MAP_TILES, set);
        const cardsThatNeedPakjes = [];
        for(const [key,data] of Object.entries(mapTiles))
        {
            const freq = data.freq ?? 1;
            const needPakjes = data.needPakjes;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.BORD, key, set);
                this.cards.push(newCard);
                if(needPakjes) { cardsThatNeedPakjes.push(newCard); }
            }
        }
        shuffle(cardsThatNeedPakjes);

        // check the pakjes available + distribute them over the tiles fairly
        const availablePakjes = this.getAvailablePakjes(set);
        shuffle(availablePakjes);

        // remove some to get a buffer
        // (we take a percentage of all the pakjes that are actually in the game; as delivering one means removing it)
        const numNeeded = Math.ceil(CONFIG.generation.pakjes.coveragePercentageOnTiles * availablePakjes.length);

        // assign desired pakjes to the tiles (discrete bucket filling to get roughly equal spread for sure)
        const finalPakjes = availablePakjes.slice(0, numNeeded);

        while(finalPakjes.length > 0)
        {
            for(const card of cardsThatNeedPakjes)
            {
                if(finalPakjes.length <= 0) { break; }
                card.addPakje(finalPakjes.pop());
            }
        }
    }

    getAvailablePakjes(set:string)
    {
        const pakjesDict = this.filterSet(PAKJE_CARDS, set);
        const pakjesList : string[] = [];
        const defFreq = CONFIG.generation.pakjes.defaultFrequency ?? 1;
        for(const [key,data] of Object.entries(pakjesDict))
        {
            const isWishable = !data.cantWish;
            if(!isWishable) { continue; }

            let freq = data.freq ?? defFreq;
            if(set != "base") { freq /= 2; } // @NOTE: same nasty exception here as in cardPicker
            for(let i = 0; i < freq; i++)
            {
                pakjesList.push(key);
            }
        }
        return pakjesList;
    }

    filterSet(dict:Record<string,GeneralData>, setTarget:string)
    {
        const dictOut : Record<string,GeneralData> = {};
        for(const [key,data] of Object.entries(dict))
        {
            const setRaw = data.set ?? "base";
            const set = Array.isArray(setRaw) ? setRaw : [setRaw];
            if(!set.includes(setTarget)) { continue; }
            dictOut[key] = data;
        }
        return dictOut;
    }

    generateRebelsePietjes()
    {
        if(!CONFIG.sets.rebelsePietjes) { return; }
        
        const numPietjes = CONFIG.generation.rebelsePietjes.number;
        for(let i = 0; i < numPietjes; i++)
        {
            this.cards.push(new Card(CardType.PAWN, "pietje_" + i, "rebelsePietjes"));
        }
    }
}