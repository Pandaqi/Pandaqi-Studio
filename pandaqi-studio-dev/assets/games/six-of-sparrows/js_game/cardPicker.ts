import CONFIG from "../js_shared/config";
import { BID_CARDS, CardType, Suit } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        this.generateBaseGame();
        this.generateBiddingCards();
        this.generateExpansion();

        console.log(this.cards);
    }

    generateBaseGame()
    {
        if(!CONFIG.sets.base) { return; }

        // generate the number cards
        const numbers = CONFIG.generation.numberBounds.asList();
        const suits = Object.values(Suit);
        for(const suit of suits)
        {
            for(const num of numbers)
            {
                const newCard = new Card(CardType.REGULAR, num);
                newCard.suit = suit as Suit;
                this.cards.push(newCard);
            }
        }
    }

    generateBiddingCards()
    {
        if(!CONFIG.sets.biddingCards) { return; }

        // generate the bid cards
        for(const [key,data] of Object.entries(BID_CARDS))
        {
            if(data.bonusBid) { continue; }
            this.cards.push(new Card(CardType.BID, 0, key));
        }

        // add bid tokens
        for(let i = 0; i < CONFIG.generation.maxNumHandCards; i++)
        {
            this.cards.push(new Card(CardType.TOKEN, (i+1)));
        }
    }

    generateExpansion()
    {
        if(!CONFIG.sets.expansion) { return; }

        // add bonus bids
        for(const [key,data] of Object.entries(BID_CARDS))
        {
            if(!data.bonusBid) { continue; }
            this.cards.push(new Card(CardType.BID, 0, key));
        }

        // add bid token 10s
        for(let i = 0; i < CONFIG.generation.numBidTokensExpansion; i++)
        {
            this.cards.push(new Card(CardType.TOKEN, 10));
        }

    }
}