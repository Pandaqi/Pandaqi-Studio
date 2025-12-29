import { shuffle, convertCanvasToImageMultiple } from "lib/pq-games";
import { InteractiveExampleSimulator } from "lib/pq-rulebook";
import Card from "../game/card";
import { BEASTS, MaterialType, Recipe, RecipeReward } from "../shared/dict";
import matchRecipe from "./matchRecipe";

interface TokenData
{
    good: boolean,
    tokens: Card[],
    reward?: RecipeReward
    beastMenu?: boolean
}

const MAX_TOKENS = 10;

export { TokenData }
export default class Hand
{
    tokens: Card[] = []
    skipTurn = false;
    switchMenu = false;
    forceToken:Card = null;
    forbidToken:Card = null;
    forceWrong = false;

    state = false
    stateLock = false
    stateLockInstigator:Hand
    menuLock = false
    menuLockInstigator:Hand

    playDirection = 1

    resetTurnProperties()
    {
        this.skipTurn = false;
        this.switchMenu = false;
        this.forceToken = null;
        this.forbidToken = null;
        this.forceWrong = false;
    }

    addToken(t:Card) 
    { 
        if(this.count() >= MAX_TOKENS) { return; }
        if(!t) { return; }
        this.tokens.push(t); 
        return this;
    }

    addTokens(tokens:Card[])
    {
        for(const token of tokens)
        {
            this.addToken(token);
        }
        return this;
    }

    removeToken(t:Card)
    {
        let idx = this.tokens.indexOf(t);
        if(idx < 0) { return; }
        this.tokens.splice(idx, 1);
        return this;
    }
    removeTokens(tokens:Card[])
    {
        for(const token of tokens)
        {
            this.removeToken(token);
        }
        return this;
    }

    getRandomTokens(num = 1, remove = false)
    {
        const options = shuffle(this.getTokens());
        if(options.length <= 0) { return null; }

        const arr : Card[] = [];
        for(let i = 0; i < num; i++)
        {
            if(options.length <= 0) { break; }
            const tokenChosen = options.pop();
            if(remove) { this.removeToken(tokenChosen); }
            arr.push(tokenChosen);
        }
        return arr;
    }


    count() { return this.tokens.length; }
    getTokens()
    {
        return this.tokens.slice();
    }

    empty()
    {
        this.tokens = [];
    }

    decideValueOfTokens(menuCard:Card, beastCard:Card, beastHand:Hand) : TokenData[]
    {
        const arr : TokenData[] = [];
        const beastMenu = BEASTS[beastCard.key].menu;
        const availableRecipes:Recipe[] = shuffle( [menuCard.recipes, beastMenu].flat() );

        let tokensAllowed = this.tokens.slice();
        if(this.forceToken) { tokensAllowed = [this.forceToken]; }
        if(this.forbidToken) { tokensAllowed.splice(tokensAllowed.indexOf(this.forbidToken), 1); }
        
        // first find everything that matches recipes (single or multi, doesn't matter)
        let tokensUsed = [];
        for(const recipe of availableRecipes)
        {
            let matchingTokens = matchRecipe(tokensAllowed, recipe);
            const isGood = matchingTokens.length > 0;
            if(!isGood) { continue; }
            const isBeast = recipe == beastMenu;
            arr.push({ tokens: matchingTokens, good: isGood, reward: recipe.reward, beastMenu: isBeast });
            tokensUsed.push(...matchingTokens);
        }

        // then check which ones were left out, they are wrong by default
        const wrongTokens = [];
        for(const token of tokensAllowed)
        {
            const tokenAlreadyGood = tokensUsed.includes(token);
            if(tokenAlreadyGood) { continue; }
            const wrongData = { tokens: [token], good: false };
            arr.push(wrongData);
            wrongTokens.push(wrongData);
        }

        if(this.forceWrong) { return wrongTokens; }
        return arr;
    }

    lockState(val:boolean, p:Hand = null)
    {
        this.stateLock = val;
        this.stateLockInstigator = val ? p : null;
    }

    lockMenu(val:boolean, p:Hand = null)
    {
        this.menuLock = val;
        this.menuLockInstigator = val ? p : null;
    }
    
    flipState() 
    { 
        if(this.stateLock) { return; }
        this.state = !this.state; 
    }

    flipPlayDirection()
    {
        this.playDirection = -this.playDirection;
    }

    getTokenStats()
    {
        const stats:Record<string,number> = {};
        for(const token of this.tokens)
        {
            if(!stats[token.key]) { stats[token.key] = 0; }
            stats[token.key]++;
        }
        return stats;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const token of this.tokens)
        {
            canvases.push(await token.draw(sim.getVisualizer()));
        }        
        const images = await convertCanvasToImageMultiple(canvases, true);
        const isBeast = this.tokens[0].type == MaterialType.BEAST;
        const isRecipe = this.tokens[0].type == MaterialType.RECIPE;
        let maxHeight = (isBeast || isRecipe) ? "256px" : "84px";
        for(const img of images)
        {
            img.style.maxHeight = maxHeight
        }
        return images;
    }
}