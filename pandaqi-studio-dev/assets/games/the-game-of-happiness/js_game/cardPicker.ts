import CONFIG from "../js_shared/config";
import { CARDS, Category, Pack } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]
    packs: string[]

    constructor() {}
    get() { return this.cards; }
    generate()
    {
        this.cards = [];
        
        if(!CONFIG.includeCards) { return; }
        if(!this.packs) { this.readPacksFromConfig(); }

        const cardsPerPack:Record<string,any[]> = {};
        for(const [category,list] of Object.entries(CARDS))
        {
            for(const cardData of list)
            {
                const pack = cardData.pack ?? Pack.BASE;
                if(!(pack in cardsPerPack)) { cardsPerPack[pack] = []; }
                cardsPerPack[pack].push(cardData);
                cardData.category = category as Category;
            }
        }

        for(const [pack, list] of Object.entries(cardsPerPack))
        {
            console.log("#Cards in pack " + pack + ": " + list.length);
            console.log(pack);

            const shouldInclude = this.packs.includes(pack);
            if(!shouldInclude) { continue; }

            for(const cardData of list)
            {
                const newCard = new Card(cardData.category, cardData.desc, pack);
                this.cards.push(newCard);
            }
        }
    }

    readPacksFromConfig()
    {
        const packs : string[] = [];
        for(const [key,included] of Object.entries(CONFIG.packs))
        {
            if(!included) { continue; }
            packs.push(key);
        }
        this.packs = packs;
    }
}