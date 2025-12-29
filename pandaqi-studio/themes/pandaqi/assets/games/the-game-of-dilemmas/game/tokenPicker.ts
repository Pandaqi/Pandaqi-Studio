import { CONFIG } from "../shared/config";
import Token from "./token";

export const tokenPicker = () : Token[] =>
{
    if(!CONFIG._settings.includeTokens.value) { return []; }
    
    // regular tokens (yes / no)
    const tokens = [];
    const types = CONFIG.generation.tokenTypes;
    const numPerType = CONFIG.generation.numPerType * CONFIG.generation.maxNumPlayers;
    for(const type of types)
    {
        for(let i = 0; i < numPerType; i++)
        {
            const newToken = new Token(type);
            tokens.push(newToken);
        }
    }

    // variant tokens (superyes / superno)
    const typesVariant = CONFIG.generation.tokenTypesVariant;
    const numPerTypeVariant = CONFIG.generation.numPerTypeVariant * CONFIG.generation.maxNumPlayers;
    for(const type of typesVariant)
    {
        for(let i = 0; i < numPerTypeVariant; i++)
        {
            const newToken = new Token(type);
            tokens.push(newToken);
        }
    }

    return tokens;
}