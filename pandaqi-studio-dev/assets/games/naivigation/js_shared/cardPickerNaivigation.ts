import { CardType } from "games/naivigation/js_shared/dictShared";

export default class CardPickerNaivigation
{
    config: any;
    cardClass: any
    vehicleDict: Record<string,any>
    vehicleCallback: Function = (key,data) => { return null; } // for custom handling of certain properties
    cards: any[]

    constructor(config, cardClass, vehicleDict) 
    {
        this.config = config;
        this.cardClass = cardClass;
        this.vehicleDict = vehicleDict;
    }

    get() { return this.cards; }
    generate()
    {
        this.cards = [];
        this.generateVehicleCards();
        return this.cards;
    }

    generateVehicleCards()
    {
        if(!this.config.includeVehicleCards) { return; }
        
        for(const [key,data] of Object.entries(this.vehicleDict))
        {
            // auto include anything without expansions set;
            // otherwise only include if at least one matches
            const expansions = data.expansion ?? [];
            let shouldInclude = expansions.length <= 0;
            for(const exp of expansions)
            {
                if(this.config.expansions[exp]) { shouldInclude = true; break; }
            }
            if(!shouldInclude) { continue; }

            // hook for custom handling of certain cards
            const res = this.vehicleCallback(key, data);
            if(res)
            {
                for(const elem of res) { this.cards.push(elem); }
                continue;
            }

            // otherwise, just create cards as stated, at frequency wanted (default 1)
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new this.cardClass(CardType.VEHICLE, key);
                this.cards.push(newCard);
            }
        }
    }
}