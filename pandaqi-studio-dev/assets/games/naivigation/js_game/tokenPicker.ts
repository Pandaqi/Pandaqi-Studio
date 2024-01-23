import CONFIG from "../js_shared/config";
import { MATERIAL, TokenType } from "../js_shared/dict";
import Token from "./token";

export default class TokenPicker
{
    tokens: Token[]

    constructor() {}
    get() { return this.tokens; }
    generate()
    {
        this.tokens = [];
        this.generateActionTokens();
    }

    // @NOTE: This is somewhat duplicate code (with cardPicker)
    // But that's fine; it forces me to keep material to just those 2 types, which is minimalist and good
    generateFromDictionary(inputType:TokenType, tokenType:TokenType = null)
    {
        if(!tokenType) { tokenType = inputType; }
        if(!inputType) { inputType = tokenType; }

        for(const [key,data] of Object.entries(MATERIAL[inputType]))
        {
            const reqs = data.required ?? [];
            for(const requirement of reqs)
            {
                if(!CONFIG[requirement]) { continue; }
            }

            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Token(tokenType, key);
                this.tokens.push(newCard);
            }
        }
    }

    generateActionTokens()
    {
        if(!CONFIG.includeActionTokens) { return; }

        // @TODO
    }
}