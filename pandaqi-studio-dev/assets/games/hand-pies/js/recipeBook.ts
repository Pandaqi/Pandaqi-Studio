import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Cell from "./cell";
import Type from "./type";
import TypeManager from "./typeManager";
import CONFIG from "./config";
import shuffle from "js/pq_games/tools/random/shuffle";
import getWeighted from "js/pq_games/tools/random/getWeighted";

class Recipe
{
    elements: Type[] = []
    value: number = 0
    forbidden: boolean = false

    fill(num:number, weightedTypes:Record<number,{ type: Type, prob: number}>)
    {
        this.elements = [];
        for(let i = 0; i < num; i++)
        {
            const key = getWeighted(weightedTypes);
            const data = weightedTypes[key];
            this.elements.push(data.type);
        }
    }

    score(sortedTypes:Type[])
    {
        let sum = 0;
        const numTypes = sortedTypes.length;
        for(const elem of this.elements)
        {
            sum += (sortedTypes.indexOf(elem) / numTypes);
        }
        sum *= CONFIG.recipes.maxScoreMostValuableIngredient;
        this.value = Math.round(sum);
    }

    // we simply "cross out" any element present in array1 at array2
    // if we can do this for all elements, and now array2 is empty, they must've been equivalent
    isIdenticalTo(otherRecipe: Recipe) : boolean
    {
        const ourElem = this.elements.slice();
        const theirElem = otherRecipe.elements.slice();

        for(const elem of ourElem)
        {
            const idx = theirElem.indexOf(elem);
            if(idx == -1) { return false; }
            theirElem.splice(idx, 1);
        }

        if(theirElem.length > 0) { return false; }
        return true;
    }

    getScore() { return this.value; }
    setScore(n:number) { this.value = n; }
}

export default class RecipeBook
{
    reservedCells:Cell[]
    recipes: Recipe[]

    constructor() { }
    setReservedCells(cells:Cell[])
    {
        this.reservedCells = cells;
    }

    createRecipes(typeManager:TypeManager)
    {
        const numRecipes = rangeInteger(CONFIG.recipes.bounds.min, CONFIG.recipes.bounds.max);
        const types = typeManager.getTypesPossible();
        const recipeLengths = [];
        const lengthBounds = CONFIG.recipes.recipeLength;
        let curLength = rangeInteger(0, lengthBounds.max-lengthBounds.min);
        for(let i = 0; i < numRecipes; i++)
        {
            recipeLengths.push(curLength + lengthBounds.min);
            curLength = (curLength + 1) % (lengthBounds.max - lengthBounds.min);
        }
        shuffle(recipeLengths);

        // sort the types based on how often they occur (DESC)
        // this means elements at the start have a LOW value (low score, though more likely to be picked)
        // while elements at the back have a HIGH value (high score)
        // power also plays a role: squares that are already high powered are LESS favorable for recipes (for balance)
        types.sort((a:Type, b:Type) => {
            return typeManager.countSubtype(b.subType)*b.getPower() - typeManager.countSubtype(a.subType)*a.getPower();
        });

        // now just save that in a way that allows drawing weighted (later elements = higher probability)
        const typeDict = {}
        let counter = 0;
        for(const type of types)
        {
            typeDict[counter] = { type: type, prob: (counter + 1) }
            counter++;
        }

        this.recipes = [];
        while(this.recipes.length < numRecipes)
        {
            const r = new Recipe();
            const recLen = recipeLengths[this.recipes.length];
            r.fill(recLen, typeDict);
            if(this.recipeIsDuplicate(r)) { continue; }
            r.score(types);
            this.recipes.push(r);
            if(this.recipes.length > 1 && Math.random() <= CONFIG.recipes.forbiddenRecipeProb)
            {
                r.forbidden = true;
            }
        }

        console.log("== Generated Recipes ==");
        console.log(this.recipes);
    }

    recipeIsDuplicate(r:Recipe) : boolean
    {
        for(const recipe of this.recipes)
        {
            if(r.isIdenticalTo(recipe)) { return true; }
        }
        return false;
    }

    display()
    {
        // @TODO: use the reserved cells to know the area we have
        // @TODO: then just lay out the recipes (vertically, each recipe is horizontal + "= <points>")
        // @TODO: sort types based on name, so the same ones are grouped
        // @TODO: invert score for forbidden recipes (+ some red warning signs or something)
    }
}