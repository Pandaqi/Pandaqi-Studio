import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardType, MEDICINE, PATIENTS } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateMedicineCards();
        this.generatePatientCards();
        this.generateSpecialCards();

        console.log(this.cards);
    }

    getMedicineTypesIncluded()
    {
        const arr = [];

        for(const [key,data] of Object.entries(MEDICINE))
        {
            const set = data.set ?? "base";
            if(!CONFIG.sets[set]) { continue; }
            arr.push(key);
        }

        return arr;
    }

    generateMedicineCards()
    {
        if(!CONFIG.sets.base) { return; }

        // create the actual cards 
        const defFreq = CONFIG.generation.defaultMedicineFrequency;
        const tempCards = [];
        const typesIncluded = this.getMedicineTypesIncluded();
        for(const key of typesIncluded)
        {
            const data = MEDICINE[key];
            const freq = data.freq ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.MEDICINE, key);
                tempCards.push(newCard);
                this.cards.push(newCard);
            }
        }

        // assign numbers within range as fairly as possible
        const numbersNeeded = tempCards.length;
        const numberBounds = CONFIG.generation.medicineNumberBounds;
        const numbers = [];
        while(numbers.length < numbersNeeded)
        {
            for(let i = numberBounds.min; i <= numberBounds.max; i++)
            {
                numbers.push(i);
            }
        }
        shuffle(numbers);

        for(const card of tempCards)
        {
            card.setNumber(numbers.pop());
        }
    }

    generatePatientCards()
    {
        if(!CONFIG.sets.base) { return; }

        // pre-create patient names (distributed fairly)
        const numCards = CONFIG.generation.numPatientCards;
        const patientNames = [];
        while(patientNames.length < numCards)
        {
            for(const val of Object.keys(PATIENTS))
            {
                patientNames.push(val);
            }
        }
        shuffle(patientNames);

        // pre-create requirement numbers ( = number of icons on card for treatment)
        const numIcons = [];
        const numNeedsDist:Record<number, number> = CONFIG.generation.patientNumNeedsDistribution;
        for(const [num, perc] of Object.entries(numNeedsDist))
        {
            const total = Math.ceil(perc * numCards);
            for(let i = 0; i < total; i++)
            {
                numIcons.push(parseInt(num));
            }
        }

        // assign medicine requirements fairly as well
        const picker = new BalancedFrequencyPickerWithMargin({
            options: this.getMedicineTypesIncluded(),
            maxDist: 2
        });
        for(let i = 0; i < numCards; i++)
        {
            const newCard = new Card(CardType.PATIENT, patientNames.pop());
            newCard.setRequirements( picker.pickMultiple(numIcons.pop()) );
            this.cards.push(newCard);
        }
    }

    generateSpecialCards()
    {
        // @TODO: return if not this set selected
    }

}