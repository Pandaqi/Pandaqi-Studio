import BalancedFrequencyPickerWithMargin from "js/pq_games/tools/generation/balancedFrequencyPickerWithMargin";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { ACTIONS, FOOD, MaterialType, Recipe, VICTIMS } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";

interface RecipeData
{
    total: number,
    multi: number
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
        const recipeData:RecipeData = { total: 0, multi: 0 };
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
        for(const card of arr)
        {
            const recipes = card.getRecipes();
            const actionsAlreadyPicked = [];
            for(const recipe of recipes)
            {
                const recipeValue = this.countRecipeValue(recipe);
                const suitableActions = this.getActionsOfValue(recipeValue, actionsAlreadyPicked);
                const finalAction = getWeighted(suitableActions);
                actionsAlreadyPicked.push(finalAction);
                recipe.reward = finalAction;
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
    }

    createMultiFoodRecipe(pickers:BalancedFrequencyPickerWithMargin[], maxTier:number, recipeData:RecipeData, customProb:number = -1)
    {
        recipeData.total++;

        const recipe = [pickers[maxTier].pickNext()];
        if(!CONFIG.allowMultiFoodRecipes) { return recipe; }

        let prob = CONFIG.generation.multiFoodRecipeProbPerTier[maxTier];
        if(customProb >= 0) { prob = customProb; }

        const roomForMoreMulti = (recipeData.multi / recipeData.total) < CONFIG.generation.multiFoodMaxPercentage;
        const shouldCreateMulti = Math.random() <= prob && roomForMoreMulti;
        if(!shouldCreateMulti) { return recipe; }

        const targetRecipeLength = CONFIG.generation.multiFoodRecipeBounds.randomInteger();
        const maxRecipeValue = CONFIG.generation.maxRecipeValue;
        while(recipe.length < targetRecipeLength)
        {
            const pickerToUse = Math.floor(Math.random() * maxTier);
            recipe.push(pickers[pickerToUse].pickNext());
            const value = this.countRecipeValue({ cost: recipe, reward: null });
            if(value >= maxRecipeValue) { break; }
        }

        if(recipe.length > 1) { recipeData.multi++; }
        return recipe;
    }

    countRecipeValue(recipe:Recipe)
    {
        let num = 0;
        for(const foodType of recipe.cost)
        {
            num += (FOOD[foodType].value ?? 1);
        }
        return num;
    }

    getActionsOfValue(val:number, exclude:string[] = [])
    {
        const maxActionValueError = CONFIG.generation.maxActionValueError;
        const dict = {};
        const dictBackup = {};
        for(const [key,data] of Object.entries(ACTIONS))
        {
            if(exclude.includes(key)) { continue; }
            if(data.value >= val) { dictBackup[key] = data; }
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
                this.cards.push(new Card(MaterialType.VICTIM, key));
            }
        }
    }
}