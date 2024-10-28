import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardType, Color, SPECIAL_ACTIONS, Shape } from "../js_shared/dict";
import Card from "./card";
import fromArray from "js/pq_games/tools/random/fromArray";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        this.generateBaseCards();
        this.generateColorCracks();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        const numbers : number[] = CONFIG.generation.numberBounds.asList();
        const numbersSpecial = CONFIG.generation.numberSpecial;
        const numbersFinal = numbers.filter((x) => !numbersSpecial.includes(x));

        // shape + number is UNIQUE (no two cards with same properties)
        const newCards = [];
        for(const shape of Object.values(Shape))
        {
            for(const num of numbersFinal)
            {
                newCards.push( new Card(CardType.REGULAR, shape, num) );
            }
        }

        // colors are assigned randomly (but evenly distributed)
        // rankings are created in a balanced way too, then just assigned randomly
        const numCards = newCards.length;
        const colors = [];
        const rankings = this.getRankings(numCards);
        for(const key of Object.values(Color))
        {
            const freq = Math.ceil(0.25*numCards);
            for(let i = 0; i < freq; i++)
            {
                colors.push(key);
            }
        }
        shuffle(colors);

        for(const card of newCards)
        {
            card.color = colors.pop();
            card.ranking = rankings.pop();
        }

        this.cards.push(...newCards);
    }

    generateColorCracks()
    {
        if(!CONFIG.sets.colorCracks) { return; }

        const numbersSpecial : number[] = CONFIG.generation.numberSpecial;
        const newCards = [];
        const colors = Object.values(Color);

        // only use the special numbers + colors/actions are entirely random because why not
        for(const shape of Object.values(Shape))
        {
            for(const num of numbersSpecial)
            {
                const color = fromArray(colors);
                const action = getWeighted(SPECIAL_ACTIONS);
                const newCard = new Card(CardType.SPECIAL, shape, num, color);
                newCard.setAction(action);
                newCards.push(newCard);
            }
        }

        const numCards = newCards.length;
        const rankings = this.getRankings(numCards);
        for(const card of newCards)
        {
            card.ranking = rankings.pop();
        }

        this.cards.push(...newCards);
    }

    // just a funny trick with swapping elements from previous ranking
    // which is a cheap way to ensure varied rankings without any other restrictions
    getRankings(num: number)
    {
        let prevRanking = shuffle(Object.values(Shape));
        const rankings = [];
        for(let i = 0; i < num; i++)
        {
            const newRanking = prevRanking.slice();
            const idxA = Math.floor(Math.random() * 0.5 * newRanking.length);
            const idxB = Math.floor((0.5 + Math.random() * 0.5) * newRanking.length);
            const tempA = newRanking[idxA];

            newRanking[idxA] = newRanking[idxB];
            newRanking[idxB] = tempA;
            rankings.push(newRanking);
        }

        shuffle(rankings);
        return rankings;
    }
}