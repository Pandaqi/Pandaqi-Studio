import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { ACTIEPIETEN, CardType, ColorType } from "../js_shared/dict";
import Card from "./card";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        this.generateBasisspel();
        this.generatePietjePrecies();
        this.generateActiePiet();

        this.assignSpecialIconsToCards();

        console.log(this.cards);
    }

    generateBasisspel()
    {
        if(!CONFIG.sets.base) { return; }

        const colors = Object.values(ColorType);
        const num = CONFIG.generation.base.numCards;
        const numPerColor = Math.ceil(num / colors.length);
        const dist : Record<number, number> = CONFIG.generation.base.numberDistribution;

        // simply create the numbers per color, equally distributed
        for(const color of colors)
        {
            for(const [numOnCard, freqRaw] of Object.entries(dist))
            {
                const freq = Math.ceil(freqRaw * numPerColor);
                for(let i = 0; i < freq; i++)
                {
                    this.cards.push(new Card(CardType.REGULAR, parseInt(numOnCard), color));
                }
            }
        }

        // create big sint and small sint
        this.cards.push(new Card(CardType.SINT, null, null, "small"));
        this.cards.push(new Card(CardType.SINT, null, null, "big"));
    }

    getRandomActionNumber() : number
    {
        return CONFIG.generation.actiepiet.cardNumbers.randomInteger();
    }

    getRandomActionColor() : ColorType
    {
        return fromArray(CONFIG.generation.actiepiet.cardColors);
    }

    generatePietjePrecies()
    {
        if(!CONFIG.sets.pietjePrecies) { return; }

        const num = CONFIG.generation.pietjePrecies.numCards;
        for(let i = 0; i < num; i++)
        {
            this.cards.push(new Card(CardType.ACTION, this.getRandomActionNumber(), this.getRandomActionColor(), "pietje_precies"));
        }
    }

    generateActiePiet()
    {
        if(!CONFIG.sets.actiepiet) { return; }

        const freqDefault = CONFIG.generation.actiepiet.defaultFrequency;
        for(const [key,data] of Object.entries(ACTIEPIETEN))
        {
            const freq = data.freq ?? freqDefault;
            for(let i = 0; i < freq; i++)
            {
                this.cards.push(new Card(CardType.ACTION, this.getRandomActionNumber(), this.getRandomActionColor(), key));
            }
        }
    }

    assignSpecialIconsToCards()
    {
        const numNeeded = this.cards.length;
        const surpriseIcons = [];
        const bidIcons = [];
        for(let i = 0; i < numNeeded; i++)
        {
            surpriseIcons.push( i/numNeeded < CONFIG.generation.icons.surprisePercentage );
            bidIcons.push( i/numNeeded < CONFIG.generation.icons.bidPercentage );
        }
        
        shuffle(bidIcons);
        shuffle(surpriseIcons);
        
        for(const card of this.cards)
        {
            card.hasSurpriseIcon = surpriseIcons.pop();
            card.hasBidIcon = bidIcons.pop();
        }
    }
}