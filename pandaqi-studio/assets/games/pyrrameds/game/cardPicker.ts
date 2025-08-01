import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { CardType, MEDICINE, PATIENTS, SPECIAL_ACTIONS } from "../shared/dict";
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
        this.assignNumbers();

        console.log(this.cards);
    }

    assignNumbers()
    {
        // assign numbers within range as fairly as possible
        const numbersNeeded = this.cards.length;
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

        for(const card of this.cards)
        {
            card.setNumber(numbers.pop());
        }
    }

    getPatientTypesFor(targetSets:string[])
    {
        const arr = [];

        for(const [key,data] of Object.entries(PATIENTS))
        {
            const set = data.set ?? "base";
            if(!targetSets.includes(set)) { continue; }
            arr.push(key);
        }

        return arr;
    }

    getMedicineTypesFor(targetSets:string[])
    {
        const arr = [];

        for(const [key,data] of Object.entries(MEDICINE))
        {
            const set = data.set ?? "base";
            if(!targetSets.includes(set)) { continue; }
            arr.push(key);
        }

        return arr;
    }

    generateMedicineCards()
    {
        for(const [set,enabled] of Object.entries(CONFIG.sets))
        {
            if(!enabled) { continue; }

            const defFreq = CONFIG.generation.defaultMedicineFrequency[set] ?? 0;
            const typesIncluded = this.getMedicineTypesFor([set]);

            let numCards = 0;
            for(const key of typesIncluded)
            {
                numCards += MEDICINE[key].freq ?? defFreq;
            }
            
            const numberWildcards = this.generateNumberWildcardsList(set, numCards);
            for(const key of typesIncluded)
            {
                const data = MEDICINE[key];
                const freq = data.freq ?? defFreq;
                for(let i = 0; i < freq; i++)
                {
                    const newCard = new Card(CardType.MEDICINE, key);
                    if(numberWildcards.length > 0) { newCard.setNumberWildcard(numberWildcards.pop()); }
                    this.cards.push(newCard);
                }
            }
        }
    }

    generatePatientCards()
    {
        let totalNumCards = 0;
        const setsIncluded = [];
        for(const [set,enabled] of Object.entries(CONFIG.sets))
        {
            if(!enabled) { continue; }
            totalNumCards += CONFIG.generation.numPatientCards[set] ?? 0;
            setsIncluded.push(set);
        }

        // pre-create patient names (distributed fairly)
        const patientNames = [];
        const patientsIncluded = this.getPatientTypesFor(setsIncluded);
        while(patientNames.length < totalNumCards)
        {
            for(const patientName of patientsIncluded)
            {
                patientNames.push(patientName);
            }
        }
        shuffle(patientNames);

        // pre-create requirement numbers ( = number of icons on card for treatment)
        const numIcons = [];
        const numNeedsDist:Record<number, number> = CONFIG.generation.patientNumNeedsDistribution;
        for(const [num, perc] of Object.entries(numNeedsDist))
        {
            const total = Math.ceil(perc * totalNumCards);
            for(let i = 0; i < total; i++)
            {
                numIcons.push(parseInt(num));
            }
        }

        // finally, assign all of this fairly
        const baseTypes = this.getMedicineTypesFor(["base"]);
        const maxDist = CONFIG.generation.maxDistBetweenRequirementTypes ?? 2;
        const penaltyPerType = CONFIG.generation.penaltyForBaseTypesInExpansion ?? 4;

        // @EXCEPTION: I want to include base-medicine in expansions too, but way fewer than new medicine
        // Thus allow much greater distance to the other types for all base types, so they're picked less often
        const penaltyCustom = {};
        for(const type of baseTypes)
        {
            penaltyCustom[type] = penaltyPerType
        }

        for(const [set,enabled] of Object.entries(CONFIG.sets))
        {
            if(!enabled) { continue; }

            const picker = new BalancedFrequencyPickerWithMargin({
                options: this.getMedicineTypesFor(["base", set]),
                maxDist: maxDist,
                penaltyCustom: (set != "base") ? penaltyCustom : {}
            });

            const numCards = CONFIG.generation.numPatientCards[set] ?? 0;
            const numberWildcards = this.generateNumberWildcardsList(set, numCards);
            for(let i = 0; i < numCards; i++)
            {
                const newCard = new Card(CardType.PATIENT, patientNames.pop());
                newCard.setRequirements( picker.pickMultiple(numIcons.pop()) );
                if(numberWildcards.length > 0) { newCard.setNumberWildcard(numberWildcards.pop()); }
                this.cards.push(newCard);
            }
        }
    }

    generateSpecialCards()
    {
        if(!CONFIG.sets.operations) { return; }

        const defFreq = CONFIG.generation.defaultFrequencySpecialCards ?? 1;
        for(const [key,data] of Object.entries(SPECIAL_ACTIONS))
        {
            const freq = data.freq ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.SPECIAL, key);
                newCard.setSpecial(data.desc);
                this.cards.push(newCard);
            }
        }
    }

    generateNumberWildcardsList(set:string, numCards:number)
    {
        if(set != "intensiveCare") { return []; }
        const numberWildcards = [];
        const numWildcardNumbers = Math.floor(CONFIG.generation.percentageWildcardNumbers * numCards);
        for(let i = 0; i < numCards; i++)
        {
            numberWildcards.push(i < numWildcardNumbers);
        }
        shuffle(numberWildcards);
        return numberWildcards;
    }

}