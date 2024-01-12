import CONFIG from "../js_shared/config";
import Token from "./token";

export default class TokenPicker
{
    tokens: Token[]

    constructor() {}
    get() { return this.tokens; }
    generate()
    {
        this.tokens = [];
        if(!CONFIG.includeTokens) { return; }
        
        // regular tokens (yes / no)
        const types = CONFIG.generation.tokenTypes;
        const numPerType = CONFIG.generation.numPerType * CONFIG.generation.maxNumPlayers;
        for(const type of types)
        {
            for(let i = 0; i < numPerType; i++)
            {
                const newToken = new Token(type);
                this.tokens.push(newToken);
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
                this.tokens.push(newToken);
            }
        }

    }
}