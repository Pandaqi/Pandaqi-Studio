import { EGGS_SHARED } from "games/easter-eggventures/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import { CardType } from "../js_shared/dict";
import Card from "./card";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        this.generateClueCards();
        this.generateScoreCards();
        console.log(this.cards);
    }

    generateClueCards()
    {        
        if(CONFIG.sets.base)
        {
            const range = CONFIG.generation.clueCardBoundsBase;
            for(let i = range.min; i <= range.max; i++)
            {
                this.cards.push(new Card(CardType.CLUE, { num: i }));
            }
        }

        if(CONFIG.sets.cluesRooms)
        {
            const range = CONFIG.generation.clueCardBoundsExpansion;
            for(let i = range.min; i <= range.max; i++)
            {
                this.cards.push(new Card(CardType.CLUE, { num: i }));
            }
        }

    }

    generateScoreCards()
    {
        if(!CONFIG.sets.base) { return; }

        const numScoreCards = CONFIG.generation.numScoreCards;
        for(let i = 0; i < numScoreCards; i++)
        {
            const scoringRules = this.generateRandomScoringRules();
            this.cards.push(new Card(CardType.SCORE, { scoringValues: scoringRules }));
        }
    }

    generateRandomScoringRules()
    {
        const numEggs = CONFIG.generation.maxNumEggs;
        const eggTypes = Object.keys(EGGS_SHARED).slice(0, numEggs);
        const values:Record<string,number> = {};
        for(const type of eggTypes) { values[type] = 0; }

        const invalidRuleset = (values:Record<string,number>) =>
        {
            const stats = { positive: 0, negative: 0, zero: 0 };
            for(const [key,freq] of Object.entries(values))
            {
                if(freq > 0) { stats.positive++; }
                else if(freq < 0) { stats.negative++; }
                else { stats.zero++; }
            }

            const noPositives = stats.positive <= 0;
            const noNegatives = stats.negative <= 0;
            const tooManyZeroes = stats.zero >= (0.25 * eggTypes.length);
            return noPositives || noNegatives || tooManyZeroes;
        }

        const minNumIterations = numEggs + CONFIG.generation.scoringRuleIterationRandomness.randomInteger();
        let counter = 0;
        const typesCopy = eggTypes.slice();
        const maxValuePerEgg = CONFIG.generation.maxValuePerEgg;
        const avgScore = CONFIG.generation.scoringCardAverageScore;
        while(counter < minNumIterations || invalidRuleset(values))
        {
            if(typesCopy.length <= 2) { break; }

            const tempTypes = shuffle(typesCopy.slice());
            const onlyAdd = counter < avgScore;

            // each iteration, we bump one value higher and one value lower
            // (so each score card is always balanced to be 0, if you add all together)
            const rand1 = tempTypes.pop();
            const rand2 = tempTypes.pop();
            values[rand1] += 1;
            if(!onlyAdd) { values[rand2] -= 1; }

            // remove values that are already extreme from being changed further
            if(Math.abs(values[rand1]) >= maxValuePerEgg) { typesCopy.splice(typesCopy.indexOf(rand1), 1); }
            if(Math.abs(values[rand2]) >= maxValuePerEgg) { typesCopy.splice(typesCopy.indexOf(rand2), 1); }

            counter++;
        }

        return values;
    }
}