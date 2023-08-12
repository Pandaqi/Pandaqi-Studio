import Pack from "./pack"
import { PACKS } from "./gameDictionary"
import ResourceLoader from "js/pq_games/canvas/resourceLoader"
import GridMapper from "js/pq_games/canvas/gridMapper"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder"
import Canvas from "js/pq_games/canvas/main"
import ProgressBar from "js/pq_games/canvas/progressBar"
import Random from "js/pq_games/tools/random/main"

const config = {
    debugWithoutPDF: false,
    numbers: { min: 1, max: 6 },
    numberList: [1,2,3,4,5,6],
    fileName: "[Sixpack] Material",
    numHandsPerPack: 2,
    font: {
        key: "LondrinaSolid",
        url: "assets/fonts/LondrinaSolid-Black.woff2",
        size: 0.795,
        smallSize: 0.1
    },
    cards: {
        dims: { 
            small: { x: 5, y: 5 },
            regular: { x: 4, y: 4 },
            big: { x: 3, y: 3 }
        },
        dimsElement: { x: 1, y: 1.55 },
        size: { x: 0, y: 0 },
        bgScale: 0.975,
        mainNumber: {
            bgOffset: 0.032,
            color: "#111111",
            offsetColor: "#88847E",
            strokeColor: "#FEFEFE",
            strokeWidth: 0.01
        },
        edgeNumber: {
            pos: { x: 0.1, y: 0.1 },
            bgOffset: 0.015,
            strokeWidth: 0.005
        },
        hand: {
            composite: "luminosity",
            pos: { x: 0.5, y: 0.135 },
            size: 0.4
        },
        type: {
            composite: "luminosity",
            pos: { x: 0.5, y: 0.835 },
            size: 0.33
        },
        outlineColor: "#111111",
        outlineWidth: 0.05,

    }
}

export default class Generator {
    constructor()
    {
        const userConfig = JSON.parse(window.localStorage.sixpackConfig || "{}");

        for(const [type,numString] of Object.entries(userConfig.packs))
        {
            let num = parseInt(numString);
            if(isNaN(num)) { num = 1; }
            userConfig.packs[type] = num;
        }

        if(userConfig.randomizePacks)
        {
            const obj = {};
            const allTypes = Random.shuffle(Object.keys(PACKS));
            const randNum = Random.rangeInteger(3,6);
            for(let i = 0; i < randNum; i++)
            {
                obj[allTypes.pop()] = 1;
            }
            userConfig.packs = obj;
        }

        Object.assign(config, userConfig);

        const list = [];
        config.numberList = list;
        for(let i = config.numbers.min; i <= config.numbers.max; i++)
        {
            list.push(i);
        }

        for(const type of Object.values(PACKS))
        {
            if(!type.mainNumber) { type.mainNumber = {}; }
            if(!type.edgeNumber) { type.edgeNumber = {}; }
        }

        const progressBar = new ProgressBar();
        config.progressBar = progressBar;
        progressBar.setPhases(["Loading Assets", "Creating Packs", "Preparing PDF", "Done!"]);
    }

    async start()
    {
        console.log("[Sixpack] Generation started.")
        await this.loadAssets();
        this.determinePackTypes();
        this.createPacks();
        await this.downloadPDF();
        console.log("[Sixpack] Done.");
        config.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        config.progressBar.gotoNextPhase();

        const fontFile = new FontFace(config.font.key, "url(" + config.font.url + ")");
        document.fonts.add(fontFile);
        await fontFile.load();

        const resLoader = new ResourceLoader();
        resLoader.planLoad("card_backgrounds", { path: "assets/card_backgrounds.webp", frames: { x: 8, y: 2 } });
        resLoader.planLoad("card_types", { path: "assets/card_types.webp", frames: { x: 8, y: 2 } });
        resLoader.planLoad("hand_icon", { path: "assets/hand_icon.webp" });
        await resLoader.loadPlannedResources();

        const pdfBuilderConfig = { orientation: "portrait" };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);

        const dims = config.cards.dims[config.cardSize || "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: config.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);

        const cardSize = gridMapper.getMaxElementSize();
        config.cards.size = { x: cardSize.width, y: cardSize.height };

        config.resLoader = resLoader;
        config.pdfBuilder = pdfBuilder;
        config.gridMapper = gridMapper;     
    }

    determinePackTypes()
    {
        const packTypes = [];
        for(const [type,numIncluded] of Object.entries(config.packs))
        {
            for(let i = 0; i < numIncluded; i++)
            {
                packTypes.push(type);
            }
        }

        this.packTypes = packTypes;
    }

    createPacks()
    {
        config.progressBar.gotoNextPhase();

        const handsPerNumber = {};
        config.handsPerNumber = handsPerNumber;
        for(const num of config.numberList)
        {
            handsPerNumber[num] = 0;
        }

        const packs = [];   
        let counter = 0;
        const numPacks = this.packTypes.length;     
        for(const type of this.packTypes)
        {
            config.progressBar.setInfo("Creating pack " + counter + "/" + numPacks);
            const p = new Pack(type, config);
            packs.push(p);
            counter++;
        }
        this.packs = packs;
    }

    async downloadPDF()
    {
        config.progressBar.gotoNextPhase();

        const images = await Canvas.convertCanvasesToImage(config.gridMapper.getCanvases());
        if(config.debugWithoutPDF)
        {
            for(const img of images) { 
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return;
        }

        config.pdfBuilder.addImages(images);
        const pdfConfig = { customFileName: config.fileName }
        config.pdfBuilder.downloadPDF(pdfConfig);
    }
}