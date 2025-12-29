
import { GridMapper } from "lib/pq-games"
import { CONFIG } from "../shared/config"
import Token from "./token"

export default class Tokens 
{
    gridMapper: GridMapper
    tokensToGenerate: number
    images: HTMLImageElement[]
    tokens: Token[]

    constructor()
    {
        this.setup();
        if(!CONFIG._settings.material.includeTokens.value) { return; }
        this.setupTypes();
        this.generate();
    }

    setup()
    {
        const numPages = CONFIG.tokens.numPages;
        const tilesPerPage = CONFIG.tokens.size.x * CONFIG.tokens.size.y;
        this.tokensToGenerate = numPages * tilesPerPage;
    }

    setupTypes()
    {
        let types = [];
        let tokensLeft = this.tokensToGenerate;

        const extraAssassinTokens = 2;
        const numAssassins = CONFIG.cards.numAssassins + extraAssassinTokens;
        for(let i = 0; i < numAssassins; i++)
        {
            types.push("antsassin");
            tokensLeft--;
        }

        const totalNumTeams = CONFIG._settings.material.numTeamsOnCodeCard.value + 1; // adds one for the neutral team
        const tokensPerTeam = Math.floor(tokensLeft / totalNumTeams);
        for(let i = 0; i < totalNumTeams; i++)
        {
            let teamKey = "team" + i;
            const isNeutral = i == (totalNumTeams - 1);
            if(isNeutral) { teamKey = "neutral"; }

            for(let j = 0; j < tokensPerTeam; j++)
            {
                types.push(teamKey);
                tokensLeft--;
            }
        }

        // just fill up whatever is left with neutral types
        // (easier than cutting it off and getting varying token printouts)
        for(let i = 0; i < tokensLeft; i++)
        {
            types.push("neutral");
        }

        CONFIG.tokens.types = types;
    }

    generate()
    {
        const arr : Token[] = [];
        for(let i = 0; i < this.tokensToGenerate; i++)
        {
            arr.push(new Token(i));
        }
        this.tokens = arr;
    }

}