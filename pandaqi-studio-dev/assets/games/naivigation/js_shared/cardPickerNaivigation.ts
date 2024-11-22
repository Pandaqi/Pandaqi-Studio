import { CardType } from "games/naivigation/js_shared/dictShared";

interface DictData
{
    type: CardType,
    dict: Record<string,any>
}

export default class CardPickerNaivigation
{
    config: any;
    cardClass: any
    data: DictData[]
    customCallback: Function = (key,data) => { return null; } // for custom handling of certain properties
    cards: any[]

    constructor(config, cardClass) 
    {
        this.config = config;
        this.cardClass = cardClass;
        this.data = [];
    }

    get() { return this.cards; }
    generate()
    {
        this.cards = [];

        for(const data of this.data)
        {
            this.generateCards(data);
        }

        return this.cards;
    }

    setCustomCallback(cb) { this.customCallback = cb; }
    addData(cardType:CardType = CardType.VEHICLE, dict:Record<string,any>)
    {
        this.data.push({
            type: cardType,
            dict: dict
        })
    }

    generateCards(inputData:DictData)
    {
        const cardType = inputData.type;
        for(const [key,data] of Object.entries(inputData.dict))
        {
            // filter based on sets
            const setsTarget = data.sets ?? ["vehicleCards"];
            let shouldInclude = false;
            for(const set of setsTarget)
            {
                if(this.config.sets[set]) { shouldInclude = true; break; }
            }
            if(!shouldInclude) { continue; }

            // hook for custom handling of certain cards
            let res = this.customCallback(key, data);
            if(res)
            {   
                if(!Array.isArray(res)) { res = [res]; }
                for(const elem of res) { this.cards.push(elem); }
                continue;
            }

            // otherwise, just create cards as stated, at frequency wanted (default 1)
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new this.cardClass(cardType, key);
                this.cards.push(newCard);
            }
        }
    }
}