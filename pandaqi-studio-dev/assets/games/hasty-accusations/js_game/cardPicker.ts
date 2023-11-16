import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }

    generate()
    {
        this.cards = [];
        // @TODO
    }

}