import { CardType } from "games/naivigation/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import { VEHICLE_CARDS } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }
    async generate()
    {
        this.cards = [];
        this.generateVehicleCards();
    }

    generateVehicleCards()
    {
        if(!CONFIG.includeVehicleCards) { return; }
        
        // @TODO: Randomly generate the steering cards to show all angles
        for(const [key,data] of Object.entries(VEHICLE_CARDS))
        {
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.VEHICLE, key);
                this.cards.push(newCard);
            }
        }
    }
}