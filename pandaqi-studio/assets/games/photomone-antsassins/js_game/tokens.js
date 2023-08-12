import Token from "./token"
import GridMapper from "js/pq_games/canvas/gridMapper"
import Canvas from "js/pq_games/canvas/main"
import Point from "./shapes/point"

export default class Tokens {
    constructor(config)
    {
        this.setupGridMapper(config);
        if(!config.includeTokens) { return; }
        this.setupTypes(config);
        this.generate(config);
    }

    setupGridMapper(config)
    {
        const gridConfig = { pdfBuilder: config.pdfBuilder, dims: config.tokens.dims, layoutShape: "circle" };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = config.tokens.numPages;
        const tilesPerPage = config.tokens.dims.x * config.tokens.dims.y;
        this.tokensToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().width;
        config.tokens.size = new Point(0.5 * size, 0.5 * size);
    }

    setupTypes(config)
    {
        let types = [];
        let tokensLeft = this.tokensToGenerate;

        const extraAssassinTokens = 2;
        const numAssassins = config.cards.numAssassins + extraAssassinTokens;
        for(let i = 0; i < numAssassins; i++)
        {
            types.push("antsassin");
            tokensLeft--;
        }

        const totalNumTeams = config.numTeamsOnCodeCard + 1; // adds one for the neutral team
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

        config.tokens.types = types;
    }

    generate(config)
    {
        for(let i = 0; i < this.tokensToGenerate; i++)
        {
            const t = new Token(config, i);
            this.gridMapper.addElement(t.getCanvas());
        }
    }
    
    getImages() { return this.images; }
    async convertToImages()
    {
        this.images = await Canvas.convertCanvasesToImage(this.gridMapper.getCanvases());
    }

}