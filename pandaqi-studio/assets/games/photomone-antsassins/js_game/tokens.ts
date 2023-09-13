import Token from "./token"
import GridMapper from "js/pq_games/canvas/gridMapper"
import Point from "./shapes/point"
import CONFIG from "./config"
import convertCanvasToImageMultiple from "js/pq_games/canvas/helpers/convertCanvasToImageMultiple"

export default class Tokens 
{
    gridMapper: GridMapper
    tokensToGenerate: number
    images: HTMLImageElement[]

    constructor()
    {
        this.setupGridMapper();
        if(!CONFIG.includeTokens) { return; }
        this.setupTypes();
        this.generate();
    }

    setupGridMapper()
    {
        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, dims: CONFIG.tokens.dims, layoutShape: "circle" };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = CONFIG.tokens.numPages;
        const tilesPerPage = CONFIG.tokens.dims.x * CONFIG.tokens.dims.y;
        this.tokensToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().x;
        CONFIG.tokens.size = new Point(0.5 * size, 0.5 * size);
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
        for(let i = 0; i < this.tokensToGenerate; i++)
        {
            const t = new Token(i);
            this.gridMapper.addElement(t.getCanvas());
        }
    }
    
    getImages() { return this.images; }
    async convertToImages()
    {
        this.images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
    }

}