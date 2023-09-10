import Pack from "./pack"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import GridMapper from "js/pq_games/canvas/gridMapper"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder"
import convertCanvasToImageMultiple from "js/pq_games/canvas/helpers/convertCanvasToImageMultiple"
import ProgressBar from "js/pq_games/canvas/progressBar"

import CONFIG from "./config"

export default class Generator {
    constructor()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] || "{}");
        Object.assign(CONFIG, userConfig);

        CONFIG.progressBar = new ProgressBar();
        CONFIG.progressBar.setPhases(["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]);

        console.log(CONFIG);
    }

    async start()
    {
        await this.loadAssets();
        const packs = this.createPacks();
        await this.drawPacks(packs);
        await this.downloadPDF();
        CONFIG.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        CONFIG.progressBar.gotoNextPhase();

        const resLoader = new ResourceLoader();
        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            resLoader.planLoad(key, data);
        }
        await resLoader.loadPlannedResources();

        const pdfBuilderConfig = { orientation: "portrait" };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);

        const dims = CONFIG.cards.dims[CONFIG.cardSize || "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: CONFIG.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);

        CONFIG.cards.size = gridMapper.getMaxElementSize();

        CONFIG.resLoader = resLoader;
        CONFIG.pdfBuilder = pdfBuilder;
        CONFIG.gridMapper = gridMapper;     
    }

    createPacks() : Pack[]
    {
        CONFIG.progressBar.gotoNextPhase();

        const numElementUsed = {}
        const elementCycleSubtype = ["","","",""];
        let elemDict : Record<string,string> = CONFIG.elements;

        for(const [element,subtype] of Object.entries(elemDict))
        {
            numElementUsed[subtype] = 0;
            const idx = CONFIG.gameplay.elementCycle.indexOf(element);
            elementCycleSubtype[idx] = subtype;

        }

        CONFIG.gameplay.elementCycleSubtype = elementCycleSubtype;

        const packs = [];    
        let counter = 0;  
        if(CONFIG.debugSingleCard) { elemDict = { "red": "fire" } }
        const numElements = Object.keys(elemDict).length;
        for(const [element,subtype] of Object.entries(elemDict))
        {
            const progressText = "Creating element " + element + " => " + subtype + " (" + counter + "/" + numElements + ")"
            CONFIG.progressBar.setInfo(progressText);
            const p = new Pack(element, subtype, numElementUsed);
            packs.push(p);
            counter++;
        }

        return packs;
    }

    async drawPacks(packs:Pack[])
    {
        for(const pack of packs)
        {
            await pack.draw();
        }
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

new Generator().start();