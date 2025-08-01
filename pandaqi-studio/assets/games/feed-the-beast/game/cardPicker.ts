import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { ACTIONS, FOOD, GeneralData, MaterialType, Recipe, RecipeList, RecipeRewardType, VICTIMS } from "../shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import fromArray from "js/pq_games/tools/random/fromArray";

interface RecipeData
{
    total: number,
    multi: number,
    textRewards: number,
    foodRewards: number
}

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateRecipeCards();
        this.generateVictimCards();

        console.log(this.cards);
    }

    generateRecipeCards()
    {
        if(!CONFIG.sets.recipeCards) { return; }

        // create all the card objects
        const numCards = CONFIG.generation.numRecipeCards;
        const arr : Card[] = [];
        for(let i = 0; i < numCards; i++)
        {
            arr.push(new Card(MaterialType.RECIPE));
        }

        // prepare unique pickers per food type
        const foodsPerTier = [];
        for(const [key,data] of Object.entries(FOOD))
        {
            if(!foodsPerTier[data.tier]) { foodsPerTier[data.tier] = []; }
            foodsPerTier[data.tier].push(key);
        }

        const pickers : BalancedFrequencyPickerWithMargin[] = [];
        for(let foodPerTier of foodsPerTier)
        {
            pickers.push(new BalancedFrequencyPickerWithMargin({
                options: foodPerTier,
                maxDist: 1
            }))
        }

        // give unique cards their higher tier foods
        const recipeData:RecipeData = { total: 0, multi: 0, foodRewards: 0, textRewards: 0 };
        for(let i = 1; i < pickers.length; i++)
        {
            shuffle(arr);

            const numToSelect = Math.round(CONFIG.generation.foodTierDistribution[i] * numCards);
            const selectedCards = arr.slice(0, numToSelect);

            for(const card of selectedCards)
            {
                card.addRecipe(this.createMultiFoodRecipe(pickers, i, recipeData));
            }
        }

        // then fill in the rest with basic foods
        const maxRecipes = CONFIG.generation.maxRecipesPerCard;
        shuffle(arr);
        for(const card of arr)
        {
            while(card.countRecipes() < maxRecipes)
            {
                card.addRecipe(this.createMultiFoodRecipe(pickers, 0, recipeData));
            }
        }
        
        // assign fitting actions to all cards (based on cost)
        let actionFreqs = {};
        const availableActions = structuredClone(ACTIONS);
        for(const card of arr)
        {
            const recipes = card.getRecipes();
            const actionsAlreadyPicked = [];
            for(const recipe of recipes)
            {
                const recipeValue = this.countRecipeValue(recipe);
                const foodToExclude = recipe.cost[0];
                const suitableActions = this.getActionsOfValue(recipeValue, availableActions, [actionsAlreadyPicked, foodToExclude].flat());
                if(Array.isArray(suitableActions)) {
                    recipe.reward = {
                        type: RecipeRewardType.FOOD,
                        food: [suitableActions]
                    }
                    recipeData.foodRewards++;
                } else {

                    // ensure actions appear at least a minimum number of times
                    const actionKeys = Object.keys(suitableActions);
                    let finalAction = null;
                    const actionsBelowMinFreq = [];
                    for(const actionKey of actionKeys)
                    {
                        const freq = actionFreqs[actionKey] ?? 0;
                        const minFreq = availableActions[actionKey].min ?? 1;
                        if(freq >= minFreq) { continue; }
                        actionsBelowMinFreq.push(actionKey);
                    }

                    if(actionsBelowMinFreq.length > 0)
                    {
                        finalAction = fromArray(actionsBelowMinFreq);
                    }

                    // only if that doesn't matter, draw randomly
                    if(!finalAction)
                    {
                        finalAction = getWeighted(suitableActions);
                    }

                    if(!actionFreqs[finalAction]) { actionFreqs[finalAction] = 0; }
                    actionFreqs[finalAction]++;

                    // and remove actions once they've appeared their maximum number of times
                    const maxFreq = availableActions[finalAction].max ?? Infinity;
                    if(actionFreqs[finalAction] >= maxFreq)
                    {
                        delete availableActions[finalAction];
                    }

                    actionsAlreadyPicked.push(finalAction);
                    recipe.reward = {
                        type: RecipeRewardType.TEXT,
                        desc: finalAction
                    };
                    recipeData.textRewards++;
                }
            }
        }

        // finally, add to generated card list
        for(const elem of arr)
        {
            this.cards.push(elem);
        }

        // @DEBUGGING: some statistics and summaries to help myself
        console.log(pickers);
        console.log("PERCENTAGE MULTI RECIPES:" + ((recipeData.multi / recipeData.total) * 100) + "%");
        console.log("TEXT / FOOD REWARDS: " + recipeData.textRewards + " / " + recipeData.foodRewards);
        console.log("FREQS PER ACTION TYPE", actionFreqs);
    }

    createMultiFoodRecipe(pickers:BalancedFrequencyPickerWithMargin[], maxTier:number, recipeData:RecipeData, customProb:number = -1) : RecipeList
    {
        recipeData.total++;

        const recipe = [pickers[maxTier].pickNext()];
        if(!CONFIG.allowMultiFoodRecipes) { return [recipe]; }

        let prob = CONFIG.generation.multiFoodRecipeProbPerTier[maxTier];
        if(customProb >= 0) { prob = customProb; }

        const roomForMoreMulti = (recipeData.multi / recipeData.total) < CONFIG.generation.multiFoodMaxPercentage;
        const shouldCreateMulti = Math.random() <= prob && roomForMoreMulti;
        if(!shouldCreateMulti) { return [recipe]; }

        const targetRecipeLength = (Math.random() <= CONFIG.generation.multiFoodRecipeLengthThreeProb) ? 3 : 2;
        const maxRecipeValue = CONFIG.generation.maxRecipeValue;
        while(recipe.length < targetRecipeLength)
        {
            const pickerToUse = Math.floor(Math.random() * maxTier);
            recipe.push(pickers[pickerToUse].pickNext());
            const value = this.countRecipeValue({ cost: [recipe], reward: null });
            if(value >= maxRecipeValue) { break; }
        }

        if(recipe.length > 1) { recipeData.multi++; }
        return [recipe];
    }

    countRecipeValue(recipe:Recipe)
    {
        let costIcons = recipe.cost;
        let totalNum = 0;
        for(const option of costIcons)
        {
            let num = 0;
            for(const foodType of option)
            {
                num += (FOOD[foodType].value ?? 1);
            } 
            totalNum += num;
        }
        const avgNum = totalNum / costIcons.length;
        return avgNum;
    }

    getActionsOfValue(val:number, availableActions:Record<string, GeneralData>, exclude:string[] = [])
    {
        const giveFoodReward = Math.random() <= CONFIG.generation.foodRewardProb;
        const foodRewardError = CONFIG.generation.foodRewardErrorBounds;
        if(giveFoodReward)
        {
            const validFoods = [];
            for(const [key,data] of Object.entries(FOOD))
            {
                if(exclude.includes(key)) { continue; }
                if(data.value < val + foodRewardError.min) { continue; } // too bad a reward; more a penalty
                if(data.value > (val + foodRewardError.max)) { continue; } // too big of a reward
                validFoods.push(key);
            }

            // we can find nothing if value is too high for any single food token reward
            if(validFoods.length > 0)
            {
                return [fromArray(validFoods)];
            }
        }

        const maxActionValueError = CONFIG.generation.maxActionValueError;
        const dict = {};
        const dictBackup = {};
        for(const [key,data] of Object.entries(availableActions))
        {
            if(exclude.includes(key)) { continue; }
            dictBackup[key] = data;
            if(Math.abs(data.value - val) > maxActionValueError) { continue; }
            dict[key] = data;
        }

        if(Object.keys(dict).length <= 0) { return dictBackup; }
        return dict;
    }

    generateVictimCards()
    {
        if(!CONFIG.sets.saveThePrincess) { return; }

        const defFreq = CONFIG.generation.defaultVictimFrequency;
        for(const [key,data] of Object.entries(VICTIMS))
        {
            const freq = defFreq ?? data.freq;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(MaterialType.VICTIM, key);
                newCard.decideDynamicDetails();
                this.cards.push(newCard);
            }
        }
    }
}