import { CONFIG } from "../shared/config";
import { BID_CARDS, CardType, Suit } from "../shared/dict";
import Card from "./card";

export const cardPicker = () =>
{
    const cards = [];
        
    generateBaseGame(cards);
    generateBiddingCards(cards);
    generateExpansion(cards);

    return cards;
}

const generateBaseGame = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    // generate the number cards
    const numbers = CONFIG.generation.numberBounds.asList();
    const suits = Object.values(Suit);
    for(const suit of suits)
    {
        for(const num of numbers)
        {
            const newCard = new Card(CardType.REGULAR, num);
            newCard.suit = suit as Suit;
            cards.push(newCard);
        }
    }
}

const generateBiddingCards = (cards) =>
{
    if(!CONFIG._settings.sets.biddingCards.value) { return; }

    // generate the bid cards
    for(const [key,data] of Object.entries(BID_CARDS))
    {
        if(data.bonusBid) { continue; }
        cards.push(new Card(CardType.BID, 0, key));
    }

    // add bid tokens
    for(let i = 0; i < CONFIG.generation.maxNumHandCards; i++)
    {
        cards.push(new Card(CardType.TOKEN, (i+1)));
    }
}

const generateExpansion = (cards) =>
{
    if(!CONFIG._settings.sets.expansion.value) { return; }

    // add bonus bids
    for(const [key,data] of Object.entries(BID_CARDS))
    {
        if(!data.bonusBid) { continue; }
        cards.push(new Card(CardType.BID, 0, key));
    }

    // add bid token 10s
    for(let i = 0; i < CONFIG.generation.numBidTokensExpansion; i++)
    {
        cards.push(new Card(CardType.TOKEN, 10));
    }
}
