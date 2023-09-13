import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Cell from "./cell";
import Type from "./type";
import TypeManager from "./typeManager";
import CONFIG from "./config";
import shuffle from "js/pq_games/tools/random/shuffle";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import Point from "js/pq_games/tools/geometry/point";
import BoardDisplay from "./boardDisplay";

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
            sum += ((sortedTypes.indexOf(elem)+1) / numTypes);
        }
        sum *= CONFIG.recipes.maxScoreMostValuableIngredient;
        this.value = Math.ceil(sum);
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
    count() { return this.elements.length; }

    display(boardDisplay:BoardDisplay, pos:Point, size:number)
    {

        // sort elements alphabetically so the same types are shown as groups next to each other
        this.elements.sort((a,b) => {
            return a.subType.localeCompare(b.subType);
        })

        let score = this.getScore();
        if(this.forbidden) { score *= -1; }

        const spriteSize = size;
        const padding = CONFIG.recipes.paddingWithinRecipe * boardDisplay.cellSizeUnit;
        const game = boardDisplay.game;
        for(const elem of this.elements)
        {
            const sprite = game.add.sprite(pos.x, pos.y, elem.mainType + "_spritesheet");
            sprite.setFrame(elem.getData().frame);
            sprite.setOrigin(0, 0.5);
            sprite.displayWidth = spriteSize;
            sprite.displayHeight = spriteSize;
            pos.x += spriteSize + padding;
        }

        const textConfig:any = CONFIG.recipes.textConfig;
        const fontSize = size;
        textConfig.fontSize = fontSize + "px";
        textConfig.strokeThickness = fontSize * 0.1;

        const textValue = "= " + score;
        const text = game.add.text(pos.x, pos.y, textValue, textConfig);
        text.setOrigin(0, 0.5);
    }
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

        // now just save that in a way that allows drawing weighted (earlier elements = higher probability)
        const typeDict = {}
        let counter = 0;
        for(const type of types)
        {
            const prob = 1.0 - ((counter+1)/(2*types.length));
            typeDict[counter] = { type: type, prob: prob }
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

    getAvailableDimensions(boardDisplay : BoardDisplay)
    {
        const topLeft = new Point(Infinity, Infinity);
        const bottomRight = new Point(-Infinity, -Infinity);
        for(const cell of this.reservedCells)
        {
            const pos = boardDisplay.convertGridPointToRealPoint(cell.getPosition());
            const pos2 = boardDisplay.convertGridPointToRealPoint(cell.getPosition().add(new Point(1,1)));
            topLeft.x = Math.min(topLeft.x, pos.x);
            topLeft.y = Math.min(topLeft.y, pos.y);
            bottomRight.x = Math.max(bottomRight.x, pos2.x);
            bottomRight.y = Math.max(bottomRight.y, pos2.y);
        }

        return {
            topLeft: topLeft,
            bottomRight: bottomRight,
            center: topLeft.halfwayTo(bottomRight),
            size: bottomRight.clone().sub(topLeft)
        }
    }

    display(boardDisplay : BoardDisplay)
    {
        let longestRecipe = 0;
        for(const recipe of this.recipes)
        {
            longestRecipe = Math.max(longestRecipe, recipe.count());
        }

        longestRecipe += 3 // assume the score text takes up 2 more spaces

        const dims = this.getAvailableDimensions(boardDisplay);
        const margin = CONFIG.recipes.marginAroundRecipeBook*boardDisplay.cellSizeUnit;
        const padding = CONFIG.recipes.paddingBetweenRecipes*boardDisplay.cellSizeUnit;
        const maxRecipeHeight = ((dims.size.y-2*margin) / this.recipes.length) - padding;
        const maxRecipeWidth = ((dims.size.x-2*margin) / longestRecipe) - padding;
        const size = Math.min(maxRecipeWidth, maxRecipeHeight); 
        const offsetY = 0.5 * (this.recipes.length-1) * (size + padding);
        const offsetX = 0.5*(longestRecipe - 1) * (size + padding);

        let anchor = dims.center.clone().sub(new Point(offsetX, offsetY));

        for(const recipe of this.recipes)
        {
            const pos = anchor.clone();
            recipe.display(boardDisplay, pos, size);
            anchor.y += size + padding;
        }


    }
}