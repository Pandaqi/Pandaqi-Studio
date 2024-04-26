import { REAL_LETTER_FREQS, LETTERS, CELLS, KEEBBLE_LETTER_VALUES } from "./dict"
import Random from "js/pq_games/tools/random/main"
import Domino from "./domino"
import Visualizer from "./visualizer"
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import GridMapper from "js/pq_games/layout/gridMapper"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"

export default class Generator {
    constructor() {}
    async start()
    {
        // @NOTE: font is needed for letter hints/notes, so don't remove this on a whim
        const resLoader = new ResourceLoader();
        resLoader.planLoad("arbutus", { path: "/keebble-games/assets/fonts/ArbutusSlab-Regular.woff2" })
        await resLoader.loadPlannedResources();

        let userConfig = JSON.parse(window.localStorage.keebbleDominoConfig);
        console.log(userConfig);

        const feedback = document.getElementById("feedback");
        feedback.innerHTML = "Generating ... ";
        await this.createDominoes(userConfig);
        feedback.innerHTML = "Done!";
    }

    async createDominoes(userConfig)
    {
        const baseAssetDir = "assets/";
        const config = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(config);

        const customPageLayoutDims = new Point(3, 8);
        if(userConfig.bigSize) { 
            customPageLayoutDims.x = 2;
            customPageLayoutDims.y = 5;
        }

        const customCardDims = new Point(2, 1); // { x: 1380, y: 690 };
        const gridConfig = { pdfBuilder: pdfBuilder, dims: customPageLayoutDims, dimsElement: customCardDims };
        const gridMapper = new GridMapper(gridConfig);

        const cardSize = gridMapper.getMaxElementSize();

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        resLoader.planLoad("letter", { path: "ambigram_letters.webp", frames: new Point(8,6) });
        resLoader.planLoad("cell", { path: "special_cells.webp", frames: new Point(8,2) });
        resLoader.planLoad("decorations", { path: "domino_decorations.webp", frames: new Point(8,1) });
        await resLoader.loadPlannedResources();

        CONFIG.resLoader = resLoader;
        CONFIG.gridMapper = gridMapper;
        CONFIG.pdfBuilder = pdfBuilder;

        const numPages = (userConfig.bigSize) ? 8 : 4;
        const params = { 
            cfg: userConfig,
            cardSize: cardSize,
            specialCellBounds: { min: 0.145, max: 0.2375 }, // "Scrabble" has roughly 0.26 = 26% of the board a special cell
            useDynamicProbs: false,
            numDominoesPerPage: gridMapper.getElementsPerPage(),
            numPages: numPages,
            emptyDominoProb: 0.085,
            numDominoes: 0
        }

        // special cells are, kind of, empty already
        // so greatly lower their probability if special cells are enabled
        if(params.cfg.expansions.specialCells) { params.emptyDominoProb = 0.01; } 
        params.numDominoes = params.numDominoesPerPage * params.numPages;

        const visualParams = {
            inkFriendly: userConfig.inkFriendly,

            background: { 
                include: false,
                color: "#FFFFFF",
                alpha: 0.5,
                composite: "multiply" // "source-over" for default
            },

            walls: {
                include: userConfig.expansions.wereWalls,
                scale: 0.825, // looks best if the same as positionFactor, and near textPositionFactor (see below)
                max: 2,
                prob: 0.35,
                positionFactor: 0.825,
            },

            letterValues: {
                include: true,
                color: "dynamic",
                fontSize: 0.075*cardSize.y,
                width: 0.2*0.5*cardSize.x,
                textPositionFactor: 0.85,
                printLetterText: userConfig.showLetters
            },

            ramps: {
                include: false
            },
            
            outlineColor: "#000000",
            outlineWidth: 0.05*cardSize.y,

            innerSquare: {
                include: true,
                color: "dynamic",
                width: 0.01*cardSize.y,
                scale: 0.95
            },

            dominoPartSeparator: {
                include: false,
                margin: 0.1*cardSize.y,
                color: "#AAAAAA",
                width: 0.01*cardSize.x
            },

            emptySide: {
                include: false,
                color: "#FF0000",
                width: 0.01*cardSize.x,
                pickProb: 0.25
            }
        }

        Object.assign(params, visualParams);

        // first generate all values
        this.generateRandomDominoContents(params);

        // then simply visualize that
        const visualizer = new Visualizer();
        await visualizer.start(params);
    }

    generateRandomDominoContents(params)
    {
        let numLettersPlaced = 0;
        const letterData = {};
        for(const key in KEEBBLE_LETTER_VALUES)
        {
            letterData[key] = { freq: 0 };
        }

        const allDominoes = [];
        for(let i = 0; i < params.numDominoes; i++)
        {
            allDominoes.push(new Domino());
        }

        // calculate dictionaries to use and their probabilities
        const letterValues = KEEBBLE_LETTER_VALUES;
        for(const symbol of Object.keys(LETTERS))
        {
            const expansion = LETTERS[symbol].expansion;
            if(expansion && !params.cfg.expansions[expansion])
            {
                delete LETTERS[symbol];
                continue;
            }

            const alreadyHasProb = LETTERS[symbol].prob;
            if(alreadyHasProb) { continue; }

            let prob = 0;
            let letters = LETTERS[symbol].letters;
            for(const letter of letters)
            {
                if(!letter) { prob += params.emptySide.pickProb; continue; }
                prob += (1.0 / letterValues[letter]);
            }
            prob /= letters.length;

            LETTERS[symbol].prob = prob;
        }

        // the number of special cells should be strictly controlled
        // so we decide a good number, add those first (completely randomly)
        // once done, we simply fill up all empty spaces with letters
        const min = params.specialCellBounds.min*params.numDominoes;
        const max = params.specialCellBounds.max*params.numDominoes;
        let numSpecialCells = Random.rangeInteger(min, max);
        if(!params.cfg.expansions.specialCells) { numSpecialCells = 0; }

        const dominoContents = [];
        for(let i = 0; i < numSpecialCells; i++)
        {
            const randIndex = Math.floor(Math.random() * allDominoes.length);
            const randDomino = allDominoes[randIndex];
            const randomCellType = this.getRandomCellType();
            const success = randDomino.setEmptySideTo("cell", randomCellType);
            if(success) { continue; }
            dominoContents.push( allDominoes.splice(randIndex, 1)[0] );
        }

        function registerLettersOf(letterName)
        {
            if(letterName == "") { return; }
            const lettersInside = LETTERS[letterName].letters;
            for(const l of lettersInside)
            {
                if(!l) { continue; }
                letterData[l].freq += 1;
                numLettersPlaced += 1;
            }
        }

        // similarly, we want to make sure each symbol appears at least ONCE
        // (otherwise uncommon letters might be left out completely)
        for(const letter of Object.keys(LETTERS))
        {
            const randIndex = Math.floor(Math.random() * allDominoes.length);
            const randDomino = allDominoes[randIndex];
            randDomino.setEmptySideTo("letter", letter);
            registerLettersOf(letter);
        }

        while(allDominoes.length > 0)
        {
            const randIndex = Math.floor(Math.random() * allDominoes.length);
            const randDomino = allDominoes[randIndex];
            const drawParams = {
                letterData: letterData,
                numLettersPlaced: numLettersPlaced,
                useDynamicProbs: params.useDynamicProbs,
                emptyDominoProb: params.emptyDominoProb
            }
            const randomLetter = this.getRandomLetter(drawParams);
            const success = randDomino.setEmptySideTo("letter", randomLetter);
            if(success) { 
                registerLettersOf(randomLetter);
                continue; 
            }
            dominoContents.push( allDominoes.splice(randIndex, 1)[0] );
        }

        params.dominoContents = dominoContents;

        // print some statistics for my debugging
        this.printStatistics(dominoContents);
    }

    printStatistics(list)
    {
        const letterData : Record<string,{freq:number, ratioError?:number}> = {};
        for(const key in KEEBBLE_LETTER_VALUES)
        {
            letterData[key] = { freq: 0 };
        }

        let numLetters = 0;
        for(const elem of list)
        {
            for(let i = 0; i < 2; i++)
            {
                const part = elem.getSide(i);
                if(part.getType() == "letter")
                {
                    if(part.getValue() == "") { continue; }

                    const letters = LETTERS[part.getValue()].letters;
                    for(const letter of letters)
                    {
                        if(!letter) { continue; }
                        numLetters += 1;
                        letterData[letter].freq += 1;
                    }
                }
            }
        }

        for(const [key,elem] of Object.entries(letterData))
        {
            const givenRatio = elem.freq / (numLetters + 0.0)
            const targetRatio = REAL_LETTER_FREQS[key];
            elem.ratioError = (givenRatio/targetRatio);
        }

        console.log("== Letter frequencies ==");
        console.log(letterData);
    }

    getRandomCellType()
    {
        return Random.getWeighted(CELLS);
    }

    getRandomLetter(params)
    {
        let ratioErrors;
        if(params.useDynamicProbs)
        {
            ratioErrors = {};
            for(const [key,data] of Object.entries(params.letterData))
            {
                // @ts-ignore
                const ratio = data.freq / params.numLettersPlaced;
                const targetRatio = REAL_LETTER_FREQS[key];
                ratioErrors[key] = targetRatio/ratio;
                // @ts-ignore
                if(data.freq == 0) { ratioErrors[key] = 0; }
            }    
        }

        const makeEmpty = Math.random() <= params.emptyDominoProb
        if(makeEmpty) { return ""; }

        for(const letter of Object.values(LETTERS))
        {
            let probDynamic = 0;
            let probFactor = letter.probFactor || 1.0;

            if(params.useDynamicProbs)
            {
                let lettersConsidered = 0;
                for(const l of letter.letters)
                {
                    if(!l) { continue; }
                    probDynamic += ratioErrors[l];
                    lettersConsidered += 1;
                }
                probDynamic /= lettersConsidered;
            }
            
            const probCustom = letter.prob*probFactor + probDynamic;
            letter.probCustom = Math.max(probCustom, 0);
        }

        return Random.getWeighted(LETTERS, "probCustom");
    }

}

new Generator().start();