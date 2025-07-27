import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { ANIMALS, AnimalType, CardType, ZOO_CARDS } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateBaseCards();
        this.generateBusyZoo();
        this.generateWildAnimals();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        this.generateAnimalCards(CONFIG.generation.animalFreqsBase, CONFIG.generation.animalFreqDefaultBase);
        this.generateZooCards(CONFIG.generation.zooCardsNumBase, CONFIG.generation.zooCycleNumFreqsBase);
    }

    generateBusyZoo()
    {
        if(!CONFIG.sets.busyZoo) { return; }
        this.generateZooCards(CONFIG.generation.zooCardsNumBusy, CONFIG.generation.zooCycleNumFreqsBusy, Object.keys(ZOO_CARDS));
    }

    generateWildAnimals()
    {
        if(!CONFIG.sets.wildAnimals) { return; }
        this.generateAnimalCards(CONFIG.generation.animalFreqsWild, CONFIG.generation.animalFreqDefaultWild, true)
    }

    generateAnimalCards(dist:Record<AnimalType, number>, defFreq:number, specialPowers:boolean = false)
    {
        // the animal cards
        for(const [key,data] of Object.entries(ANIMALS))
        {
            const freq = dist[key] ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.ANIMAL, key);
                newCard.specialPowers = specialPowers;
                this.cards.push(newCard);
            }
        }
    }

    generateZooCards(numZooCards:number, dist:Record<number, number>, types:string[] = [])
    {
        // the zoo cards
        // first count the cycle size for all cards
        const nums = [];
        let totalNum = 0;
        for(const [num,freqRaw] of Object.entries(dist))
        {
            const freq = Math.ceil(freqRaw * numZooCards);
            for(let i = 0; i < freq; i++)
            {
                nums.push(parseInt(num));
                totalNum += parseInt(num);
            }
        }
        shuffle(nums);

        // so we know how many animals we need in total
        // put them in an _ordered_ list so we can draw random chunks while making sure we have no duplicate animals
        const allAnimals = Object.keys(ANIMALS);
        shuffle(allAnimals);
        const numPerAnimal = Math.ceil(totalNum / allAnimals.length);
        const allAnimalsOrdered = [];
        for(let i = 0; i < numPerAnimal; i++)
        {
            allAnimalsOrdered.push(...allAnimals);
        }

        const cardTypes = [];
        if(types.length > 0)
        {
            while(cardTypes.length < numZooCards)
            {
                cardTypes.push(...types);
            }
            shuffle(cardTypes);
        }


        // also prepare the peopleIcons
        const numPeopleIcons = Math.round(CONFIG.generation.peopleIconPercentage * numZooCards);
        const peopleIcons = [];
        for(let i = 0; i < numZooCards; i++)
        {
            peopleIcons.push(i < numPeopleIcons);
        }
        shuffle(peopleIcons);

        // and the zoo card scores
        const scoreValues = [];
        const freqs : Record<number, number> = CONFIG.generation.zooCardScoreFreqs;
        for(const [num, freqRaw] of Object.entries(freqs))
        {
            const freq = Math.ceil(freqRaw * numZooCards);
            for(let i = 0; i < freq; i++)
            {
                scoreValues.push(parseInt(num));
            }
        }
        shuffle(scoreValues);

        // finally just create those cards
        for(let i = 0; i < numZooCards; i++)
        {
            const cycleSize = nums.pop();
            const type = cardTypes.pop() ?? "regular";
            const newCard = new Card(CardType.ZOO, type);
            newCard.setCycle(allAnimalsOrdered.splice(0, cycleSize));
            this.cards.push(newCard);

            let peopleIcon = peopleIcons.pop();
            const data = ZOO_CARDS[type] ?? {};
            if(data.forbidPeople) { peopleIcon = false; }
            if(data.requirePeople) { peopleIcon = true; }

            newCard.peopleIcon = peopleIcon;
            newCard.scoreValue = scoreValues.pop();
        }
    }
}