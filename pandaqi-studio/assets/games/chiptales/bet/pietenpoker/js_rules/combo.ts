import Card from "../js_game/card";
import CONFIG from "../js_shared/config";
import { MISC } from "../js_shared/dict";

export default class Combo
{
    cards:Card[]
    highestCard:number
    numCards:number
    total:number
    comboType:string

    constructor(c:Card[] = [])
    {
        this.cards = c;
        this.cache();
    }

    filter(property:string, value:any)
    {
        this.cards = this.cards.filter((c:Card) => c[property] == value);
        this.cache();
        return this;
    }

    cache()
    {
        this.numCards = this.cards.length;
        this.highestCard = this.numCards <= 0 ? 0 : this.cards.sort((a:Card, b:Card) => b.num - a.num)[0].num;
        this.total = this.cards.reduce((prevVal, newVal) => prevVal + newVal.num, 0);

        const basedOnColor = this.cards.length <= 1 ? false : (this.cards[0].color == this.cards[1].color);
        this.comboType = basedOnColor ? "color" : "number";
    }

    count()
    {
        return this.numCards;
    }

    getHighestNumber()
    {
        return this.highestCard;
    }

    getTotalValue()
    {
        return this.total;
    }

    // used in sorting functions
    // (returns -1 if we're better, 1 if we're not)
    compareTo(c:Combo) : number
    {
        const cardDiff = c.count() - this.count();
        if(cardDiff != 0) { return cardDiff; }

        if(CONFIG.rulebook.rules.numbersAlwaysBeatColors)
        {
            if(this.getComboType() == "number" && c.getComboType() == "color") { return -1; }
            if(this.getComboType() == "color" && c.getComboType() == "number") { return 1; }
        }

        if(this.getComboType() == "color" && c.getComboType() == "color")
        {
            return c.getTotalValue() - this.getTotalValue();
        }

        const numberDiff = c.getHighestNumber() - this.getHighestNumber();
        return numberDiff;
    }

    isEqualTo(c:Combo)
    {
        return this.compareTo(c) == 0;
    }

    getComboType()
    {
        return this.comboType
    }

    // used for nice textual feedback
    toString() : string
    {
        const basedOnColor = this.getComboType() == "color";
        if(basedOnColor)
        {
            return this.count() + " kaarten met type " + MISC[this.cards[0].color].label;
        } 
        return this.count() + " kaarten met getal " + this.cards[0].num;
    }
}