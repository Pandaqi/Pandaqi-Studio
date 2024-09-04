import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { AnimalType, DAWN_ACTIONS, MOVES, MovesDictionary, ROOSTER_CHANGES } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateBase();
        this.generateZoo();
        this.generateFightTogether();
        this.generateDawnDojo();

        console.log(this.cards);
    }


    filterBySet(dict:MovesDictionary, set:string)
    {
        return Object.keys(dict).filter((key) => (dict[key].set ?? "base") == set);
    }

    generateBalancedAnimals(set:string)
    {
        // get basic data (number of cards and available elements)
        const num = CONFIG.generation.numCardsPerSet[set] ?? CONFIG.generation.numCardsDefault;
        const animals = this.filterBySet(MOVES, set);
        const animalsFinal = [];
        while(animalsFinal.length < num)
        {
            animalsFinal.push(...shuffle(animals));
        }

        // ignore the animals that want no strengths, to not mess up the distributions
        let numThatNeedStrengths = 0;
        for(let i = 0; i < num; i++)
        {
            if(MOVES[animalsFinal[i]].strengthless) { continue; }
            numThatNeedStrengths += 1;
        }

        // calculate distribution of strengths on the fly
        const numStrengthsFinal = [];
        const strengthDist:Record<number,number> = CONFIG.generation.strengthDistPerSet[set] ?? CONFIG.generation.strengthDistDefault;
        let totalStrengthsNeeded = 0;
        for(const [numStrengths,freqRaw] of Object.entries(strengthDist))
        {
            const freq = Math.ceil(freqRaw * numThatNeedStrengths) * parseInt(numStrengths);
            totalStrengthsNeeded += freq;
            for(let i = 0; i < freq; i++)
            {
                numStrengthsFinal.push(numStrengths);
            }
        }
        shuffle(numStrengthsFinal);

        // assign to the animals!
        const specificStrengthsFinal = [];
        while(specificStrengthsFinal.length < totalStrengthsNeeded)
        {
            specificStrengthsFinal.push(...animals); // don't shuffle here, as that might mean people select duplicates when lsicing laer
        }

        const strengthsPerAnimal:Record<string,AnimalType[]> = {};
        const animalsRandomOrder = shuffle(animals.slice());
        for(const animal of animalsRandomOrder)
        {
            if(MOVES[animal].strengthless) { strengthsPerAnimal[animal] = []; continue; }
            strengthsPerAnimal[animal] = specificStrengthsFinal.splice(0, numStrengthsFinal.pop());
        }

        // create the final cards
        for(const animal of animalsFinal)
        {
            const newCard = new Card(animal, strengthsPerAnimal[animal]);
            this.cards.push(newCard);
        }
    }

    generateBase()
    {
        if(!CONFIG.sets.base) { return; }
        this.generateBalancedAnimals("base");
    }

    generateZoo()
    {
        if(!CONFIG.sets.zooOfMoves) { return; }
        this.generateBalancedAnimals("zoo");
    }

    generateFightTogether()
    {
        if(!CONFIG.sets.fightTogether) { return; }
        
        for(let i = 0; i < CONFIG.generation.numCommunicationCards; i++)
        {
            this.cards.push(new Card(AnimalType.PARROT));
        }
    }

    generateDawnDojo()
    {
        if(!CONFIG.sets.dawnDojo) { return; }

        const randOrderActions = shuffle(Object.keys(DAWN_ACTIONS));
        const randOrderChanges = shuffle(Object.keys(ROOSTER_CHANGES));

        while(randOrderActions.length > 0 && randOrderChanges.length > 0)
        {
            const key1 = randOrderActions.pop();
            const key2 = randOrderChanges.pop();
            this.cards.push(new Card(AnimalType.ROOSTER, [], key1, key2));
        }
    }
}