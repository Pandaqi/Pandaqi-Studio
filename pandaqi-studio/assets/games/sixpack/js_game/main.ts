import Pack from "./pack"
import { PACKS } from "./dict"
import GridMapper from "js/pq_games/layout/gridMapper"
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import Canvas from "js/pq_games/canvas/main"
import ProgressBar from "js/pq_games/website/progressBar"
import Random from "js/pq_games/tools/random/main"

import CONFIG from "./config"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"

export default class Generator 
{
    packTypes: string[]
    packs: Pack[]

    constructor()
    {
        const userConfig = JSON.parse(window.localStorage.sixpackConfig || "{}");

        for(const [type,numString] of Object.entries(userConfig.packs))
        {
            let num = parseInt(numString as string);
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

        Object.assign(CONFIG, userConfig);

        const list = [];
        CONFIG.numberList = list;
        for(let i = CONFIG.numbers.min; i <= CONFIG.numbers.max; i++)
        {
            list.push(i);
        }

        for(const type of Object.values(PACKS))
        {
            if(!type.mainNumber) { type.mainNumber = {}; }
            if(!type.edgeNumber) { type.edgeNumber = {}; }
        }

        const progressBar = new ProgressBar();
        CONFIG.progressBar = progressBar;
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
        CONFIG.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        CONFIG.progressBar.gotoNextPhase();

        const resLoader = new ResourceLoader();
        resLoader.planLoad(CONFIG.font.key, { key: CONFIG.font.key, path: CONFIG.font.url });
        resLoader.planLoad("card_backgrounds", { path: "assets/card_backgrounds.webp", frames: { x: 8, y: 2 } });
        resLoader.planLoad("card_types", { path: "assets/card_types.webp", frames: { x: 8, y: 2 } });
        resLoader.planLoad("hand_icon", { path: "assets/hand_icon.webp" });
        await resLoader.loadPlannedResources();

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);

        const dims = CONFIG.cards.dims[CONFIG.cardSize || "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: CONFIG.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);

        const cardSize = gridMapper.getMaxElementSize();
        CONFIG.cards.size = cardSize.clone();

        CONFIG.resLoader = resLoader;
        CONFIG.pdfBuilder = pdfBuilder;
        CONFIG.gridMapper = gridMapper;     
    }

    determinePackTypes()
    {
        const packTypes = [];
        for(const [type,numIncluded] of Object.entries(CONFIG.packs))
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
        CONFIG.progressBar.gotoNextPhase();

        const handsPerNumber = {};
        CONFIG.handsPerNumber = handsPerNumber;
        for(const num of CONFIG.numberList)
        {
            handsPerNumber[num] = 0;
        }

        const packs = [];   
        let counter = 0;
        const numPacks = this.packTypes.length;     
        for(const type of this.packTypes)
        {
            CONFIG.progressBar.setInfo("Creating pack " + counter + "/" + numPacks);
            const p = new Pack(type);
            packs.push(p);
            counter++;
        }
        this.packs = packs;
    }

    async downloadPDF()
    {
        CONFIG.progressBar.gotoNextPhase();

        const images = await convertCanvasToImageMultiple(CONFIG.gridMapper.getCanvases());
        if(CONFIG.debugWithoutPDF)
        {
            for(const img of images) { 
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return;
        }

        CONFIG.pdfBuilder.addImages(images);
        const pdfConfig = { customFileName: CONFIG.fileName }
        CONFIG.pdfBuilder.downloadPDF(pdfConfig);
    }
}