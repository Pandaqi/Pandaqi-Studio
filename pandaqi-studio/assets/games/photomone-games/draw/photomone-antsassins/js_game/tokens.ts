import Token from "./token"
import GridMapper, { GridMapperLayout } from "js/pq_games/layout/gridMapper"
import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"

export default class Tokens 
{
    gridMapper: GridMapper
    tokensToGenerate: number
    images: HTMLImageElement[]
    tokens: Token[]

    constructor()
    {
        this.setupGridMapper();
        if(!CONFIG.includeTokens) { return; }
        this.setupTypes();
        this.generate();
    }

    setupGridMapper()
    {
        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, size: CONFIG.tokens.size, layoutShape: GridMapperLayout.CIRCLE };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = CONFIG.tokens.numPages;
        const tilesPerPage = CONFIG.tokens.size.x * CONFIG.tokens.size.y;
        this.tokensToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().x;
        CONFIG.tokens.sizeResult = new Point(0.5 * size, 0.5 * size);
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

        const totalNumTeams = CONFIG.numTeamsOnCodeCard + 1; // adds one for the neutral team
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
            const t = new Token(i);
            arr.push(t);
        }
        this.tokens = arr;
    }

    async draw()
    {
        if(!this.tokens) { return; }

        const promises = [];
        for(const t of this.tokens)
        {
            promises.push(t.draw());
        }
        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases);
        await this.convertToImages();
    }
    
    getImages() { return this.images ?? []; }
    async convertToImages()
    {
        this.images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
    }

}