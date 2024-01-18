import numberRange from "js/pq_games/tools/collections/numberRange";
import CONFIG from "../js_shared/config";
import { COLORS } from "../js_shared/dict";
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

        const colors = Object.keys(COLORS);
        const numbers = numberRange(1,colors.length);
        const numberSkip = CONFIG.tokens.generation.numberSkip;
        for(let i = 0; i < colors.length; i++)
        {
            const color = colors[i];
            let idx = i % numberSkip;
            while(idx < numbers.length)
            {
                const num = numbers[idx];
                idx += numberSkip;
                const newToken = new Token(color, num);
                this.tokens.push(newToken);
            }
        }

        const hardCap = CONFIG.tokens.generation.hardCap;
        while(this.tokens.length > hardCap)
        {
            const idx = Math.floor(Math.random() * this.tokens.length);
            this.tokens.splice(idx, 1);
        }
    }
}