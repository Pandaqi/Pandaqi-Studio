import Card from "../js_game/card";
import { FOOD, Recipe } from "../js_shared/dict";

export default (tokens:Card[], recipe:Recipe) =>
{
    for(const option of recipe.cost)
    {
        const optionCopy = option.slice();
        const tokensCopy = tokens.slice();
        let matchingTokens = [];

        // first do exact matches
        for(let i = tokensCopy.length - 1; i >= 0; i--)
        {
            const token = tokensCopy[i];
            let idx = optionCopy.indexOf(token.key);
            if(idx < 0) { continue; }
            optionCopy.splice(idx, 1);
            tokensCopy.splice(i, 1);
            matchingTokens.push(token);
        }

        // then continue to wildcards (higher tier = any of lower tier)
        for(let i = optionCopy.length - 1; i >= 0; i--)
        {
            const optionLeft = optionCopy[i];
            for(let j = 0; j < tokensCopy.length; j++)
            {
                const optionTier = FOOD[optionLeft].tier;
                const tokenLeft = tokensCopy[j];
                const tokenTier = tokenLeft.getTier();
                if(tokenTier <= optionTier) { continue; }
                optionCopy.splice(i, 1);
                tokensCopy.splice(j, 1);
                matchingTokens.push(tokenLeft);
                break;
            }
        }

        // if the remaining food needed is empty, we've matched them all, so we're good
        const notAllIngredientsPresent = optionCopy.length > 0;
        if(notAllIngredientsPresent) { continue; }
        return matchingTokens;
    }
    return [];
}