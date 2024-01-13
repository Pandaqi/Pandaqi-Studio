import CONFIG from "../js_shared/config";
import { CATEGORIES, Category } from "../js_shared/dict";
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
        const NUM_PER_TYPE = 2;
        for(let i = 0; i < NUM_PER_TYPE; i++)
        {
            for(const category of Object.keys(CATEGORIES))
            {
                const newTokenCategory = new Token(category as Category);
                this.tokens.push(newTokenCategory);   
            }
        }

        for(let i = 0; i < Object.keys(CATEGORIES).length; i++)
        {
            for(let a = 0; a < NUM_PER_TYPE; a++)
            {
                const newTokenNumber = new Token(null, i+1);
                this.tokens.push(newTokenNumber);
            }
        }
    }
}