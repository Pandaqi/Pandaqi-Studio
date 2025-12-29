
import { initNumberRange } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { COLORS } from "../shared/dict";
import Token from "./token";

export const tokenPicker = () : Token[] =>
{
    const tokens = [];
    if(!CONFIG._settings.sets.includeTokens.value) { return; }

    const colors = Object.keys(COLORS);
    const numbers = initNumberRange(1,colors.length);
    const numberSkip = CONFIG._drawing.tokens.generation.numberSkip;
    for(let i = 0; i < colors.length; i++)
    {
        const color = colors[i];
        let idx = i % numberSkip;
        while(idx < numbers.length)
        {
            const num = numbers[idx];
            idx += numberSkip;
            const newToken = new Token(color, num);
            tokens.push(newToken);
        }
    }

    const hardCap = CONFIG._drawing.tokens.generation.hardCap;
    while(tokens.length > hardCap)
    {
        const idx = Math.floor(Math.random() * tokens.length);
        tokens.splice(idx, 1);
    }

    return tokens;
}