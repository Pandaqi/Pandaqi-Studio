import { CONFIG } from "../shared/config";
import { CATEGORIES, Category } from "../shared/dict";
import Token from "./token";

export const tokenPicker = () : Token[] => 
{
    const tokens = [];

    if(!CONFIG._settings.includeTokens.value) { return []; }

    const NUM_PER_TYPE = 2;
    for(let i = 0; i < NUM_PER_TYPE; i++)
    {
        for(const category of Object.keys(CATEGORIES))
        {
            const newTokenCategory = new Token(category as Category);
            tokens.push(newTokenCategory);   
        }
    }

    for(let i = 0; i < Object.keys(CATEGORIES).length; i++)
    {
        for(let a = 0; a < NUM_PER_TYPE; a++)
        {
            const newTokenNumber = new Token(null, i+1);
            tokens.push(newTokenNumber);
        }
    }

    return tokens;
}