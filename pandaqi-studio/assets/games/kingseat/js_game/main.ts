import Pack from "./pack"
import { PACKS, PACK_DEFAULT, PACK_COLORS } from "./dict"
import GridMapper from "js/pq_games/layout/gridMapper"
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import Point from "js/pq_games/tools/geometry/point"
import ProgressBar from "js/pq_games/website/progressBar"
import CONFIG from "./config";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"

export default class Generator {
    packs: Pack[]

    constructor()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] || "{}");

        const packs = [];
        for(const [type,include] of Object.entries(userConfig.packs))
        {
            if(!include) { continue; }
            packs.push(type);
        }
        userConfig.packs = packs;

        Object.assign(CONFIG, userConfig);

        const progressBar = new ProgressBar();
        CONFIG.progressBar = progressBar;
        progressBar.setPhases(["Loading Assets", "Creating Packs", "Preparing PDF", "Done!"]);
    }

    async start()
    {
        console.log("[Kingseat] Generation started.")
        await this.loadAssets();
        this.cacheDefaults();
        this.createPacks();
        await this.drawPacks();
        await this.downloadPDF();
        console.log("[Kingseat] Done.");
        CONFIG.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        CONFIG.progressBar.gotoNextPhase();
        
        const resLoader = new ResourceLoader();
        for(const [key,data] of Object.entries(CONFIG.fonts))
        {
            resLoader.planLoad(key, { key: data.key, path: data.url });
        }

        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            resLoader.planLoad(key, { path: data.path, frames: data.frames });
        }
        await resLoader.loadPlannedResources();

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);

        const dims = CONFIG.cards.dims[CONFIG.cardSize ?? "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: CONFIG.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);

        const cardSize = gridMapper.getMaxElementSize();
        CONFIG.cards.size = cardSize.clone();

        CONFIG.resLoader = resLoader;
        CONFIG.pdfBuilder = pdfBuilder;
        CONFIG.gridMapper = gridMapper;     
    }

    cacheDefaults()
    {
        // first, add all default colors directly onto the pack object
        for(const [type, data] of Object.entries(PACKS))
        {
            const colorClass = data.colorClass.toLowerCase();
            const colorData = PACK_COLORS[colorClass];
            if(!colorData) { 
                console.error("Pack " + type + " has no valid colorClass");
                continue; 
            }
            this.cacheDefault(data, colorData);
        }

        // then add any missing defaults
        for(const [type, data] of Object.entries(PACKS))
        {
            this.cacheDefault(data, PACK_DEFAULT);
        }

        console.log("PACKS ARE");
        console.log(PACKS);
    }

    cacheDefault(obj, def)
    {
        for(const [key,data] of Object.entries(def))
        {
            if(typeof data === "object" && !(data instanceof Point))
            {
                if(!obj[key]) { obj[key] = {}; }
                this.cacheDefault(obj[key], data);
                continue;
            }

            const alreadyHasValue = obj[key] != undefined && obj[key] != null;
            if(alreadyHasValue) { continue; }

            obj[key] = data;
        }
    }

    createPacks()
    {
        CONFIG.progressBar.gotoNextPhase();

        const packs = [];    
        let counter = 0;
        const numPacks = CONFIG.packs.length;    
        for(const type of CONFIG.packs)
        {
            CONFIG.progressBar.setInfo("Creating Prince " + counter + "/" + numPacks);
            const p = new Pack(type);
            packs.push(p);
            counter++;
        }
        this.packs = packs;
    }

    async drawPacks()
    {
        const promises = [];
        for(const pack of this.packs)
        {
            promises.push(pack.draw());
        }
        const canvases = await Promise.all(promises);
        for(const canv of canvases.flat())
        {
            CONFIG.gridMapper.addElement(canv);
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
        const pdfCONFIG = { customFileName: CONFIG.fileName }
        CONFIG.pdfBuilder.downloadPDF(pdfCONFIG);
    }
}

new Generator().start();