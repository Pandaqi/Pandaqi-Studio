import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { CardType, GiftType, ROUTEKAARTEN } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        this.generateBaseCards();
        this.generateGladdeDaken();
        this.generatePaardenSprongen();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        // create one pawn
        this.cards.push(new Card(CardType.PAWN));

        // create route cards
        const numRouteCards = CONFIG.generation.base.numRouteCards;
        const routeDist:Record<string,number> = CONFIG.generation.base.routeCardDist;
        const cardsRequiringGifts = [];
        const routeTypes = [];
        for(const [key,freqRaw] of Object.entries(routeDist))
        {
            const freq = Math.ceil(freqRaw * numRouteCards);
            for(let i = 0; i < freq; i++)
            {
                routeTypes.push(key);
            }
        }
        shuffle(routeTypes);
        for(let i = 0; i < numRouteCards; i++)
        {
            const key = routeTypes.pop();
            const reqGifts = ROUTEKAARTEN[key].requiresGifts;
            const newCard = new Card(CardType.ROUTE, key);
            this.cards.push(newCard);
            if(reqGifts) { cardsRequiringGifts.push(newCard); }
        }

        // fairly distribute gift requirements over those that need it
        const numGiftCards = cardsRequiringGifts.length;
        let totalGiftsNeeded = 0;
        const finalGiftNumbers = [];
        const giftDist:Record<number,number> = CONFIG.generation.base.routeCardGiftDist;
        for(const [key,freqRaw] of Object.entries(giftDist))
        {
            const freq = Math.ceil(freqRaw * numGiftCards);
            for(let i = 0; i < freq; i++)
            {
                totalGiftsNeeded += parseInt(key);
                finalGiftNumbers.push(parseInt(key));
            }
            
        }
        shuffle(finalGiftNumbers);
        console.log(finalGiftNumbers.slice());

        const finalGifts = [];
        const numGiftTypes = Object.values(GiftType).length;
        const num = Math.ceil(totalGiftsNeeded / numGiftTypes);
        for(const giftType of Object.values(GiftType))
        {
            for(let a = 0; a < num; a++)
            {
                finalGifts.push(giftType);
            }
        }
        shuffle(finalGifts);

        for(const card of cardsRequiringGifts)
        {
            card.gifts = finalGifts.splice(0, finalGiftNumbers.pop());
        }

        // create regular cards (Pakje + Vaar)
        // -> pakjes are equally distributed over types
        // -> vaar follows a distribution (some are way more useful than others)
        const numRegularCards = CONFIG.generation.base.numRegularCards;
        const numPakjeCards = Math.round(CONFIG.generation.base.percentageGiftCards * numRegularCards);
        const numCardsPerPakje = Math.ceil(numPakjeCards / numGiftTypes);
        const numVaarCards = numRegularCards - numPakjeCards;

        const numbers = [];
        const numbersNeeded = Math.max(numPakjeCards, numVaarCards) * 2;
        for(let i = 0; i < numbersNeeded; i++)
        {
            numbers.push(i+1);
        }
        shuffle(numbers);

        const pakjeTypes = [];
        for(const giftType of Object.values(GiftType))
        {
            for(let i = 0; i < numCardsPerPakje; i++)
            {
                pakjeTypes.push(giftType);
            }
        }
        shuffle(pakjeTypes);
        for(let i = 0; i < numPakjeCards; i++)
        {
            const key = pakjeTypes.pop();
            this.cards.push(new Card(CardType.PAKJE, key, this.getFirstNumber(numbers, "odd")));
        }

        const vaarDist:Record<string,number> = CONFIG.generation.base.vaarCardDist;
        const vaarTypes = [];
        for(const [key,freqRaw] of Object.entries(vaarDist))
        {
            const freq = Math.ceil(freqRaw * numVaarCards);
            for(let i = 0; i < freq; i++)
            {
                vaarTypes.push(key);
            }
        }
        shuffle(vaarTypes);

        for(let i = 0; i < numVaarCards; i++)
        {
            this.cards.push(new Card(CardType.VAREN, vaarTypes.pop(), this.getFirstNumber(numbers, "even")));
        }
    }

    getFirstNumber(list:number[], type = "odd")
    {
        for(let i = 0; i < list.length; i++)
        {
            const num = list[i];
            if(type == "odd" && num % 2 != 1) { continue }
            if(type == "even" && num % 2 != 0) { continue }
            list.splice(i, 1);
            return num;
        }
    }

    generateGladdeDaken()
    {
        if(!CONFIG.sets.gladdeDaken) { return; }
        
        const types = [];
        for(const [key,data] of Object.entries(ROUTEKAARTEN))
        {
            const set = data.set ?? "base";
            if(set != "gladdeDaken") { continue; }
            types.push(key);
        }

        const defFreq:number = CONFIG.generation.gladdeDaken.defaultFrequency ?? 1;
        for(const type of types)
        {
            for(let i = 0; i < defFreq; i++)
            {
                this.cards.push(new Card(CardType.ROUTE, type));
            }
        }

    }

    generatePaardenSprongen()
    {
        if(!CONFIG.sets.paardenSprongen) { return; }

        // these cards just have a raw frequency + number=-1 means "no number" (choose yourself)
        const cardFreqs:Record<string,number> = CONFIG.generation.paardenSprongen.cardFrequencies;
        const allCards = [];
        for(const [key,freq] of Object.entries(cardFreqs))
        {
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.VAREN, key, -1);
                this.cards.push(newCard);
                allCards.push(newCard);
            }
        }

        const giftFreq:number = CONFIG.generation.paardenSprongen.pakjeFrequency ?? 1;
        for(const key of Object.values(GiftType))
        {
            for(let i = 0; i < giftFreq; i++)
            {
                const newCard = new Card(CardType.PAKJE, key, -1);
                this.cards.push(newCard);
                allCards.push(newCard);
            }
        }
        shuffle(allCards);

        const minNumber = CONFIG.generation.base.numRegularCards + 1;
        const percentageWithNumber = 1.0 - CONFIG.generation.paardenSprongen.percentageWithoutNumber;
        const subsetWithNumber : Card[] = allCards.slice(0, Math.floor(percentageWithNumber * allCards.length));
        const extraNumbers = subsetWithNumber.length;
        const numbers = [];
        for(let i = 0; i < extraNumbers; i++)
        {
            numbers.push(minNumber + i);
        }
        shuffle(numbers);

        for(const card of subsetWithNumber)
        {
            card.num = numbers.pop();
        }

        
    }

}