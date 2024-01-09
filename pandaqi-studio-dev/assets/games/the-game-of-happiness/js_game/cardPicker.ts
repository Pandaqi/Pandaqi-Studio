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

        for(const [category,list] of Object.entries(CARDS))
        {
            for(const cardData of list)
            {
                const pack = cardData.pack ?? Pack.BASE;
                const shouldInclude = this.packs.includes(pack);
                if(!shouldInclude) { continue; }

                const newCard = new Card(category as Category, cardData.desc, pack);
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