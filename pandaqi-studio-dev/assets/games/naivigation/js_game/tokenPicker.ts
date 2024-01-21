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
        this.generateActionTokens();
    }

    generateActionTokens()
    {
        if(!CONFIG.includeActionTokens) { return; }

        // @TODO
    }
}