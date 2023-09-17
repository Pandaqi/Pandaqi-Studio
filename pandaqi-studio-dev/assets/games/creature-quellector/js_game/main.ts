import Pack from "./pack"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import GridMapper from "js/pq_games/layout/gridMapper"
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import ProgressBar from "js/pq_games/website/progressBar"

import CONFIG from "./config"
import takeBitesOutOfPath from "js/pq_games/tools/geometry/paths/takeBitesOutOfPath"
import Point from "js/pq_games/tools/geometry/point"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Path from "js/pq_games/tools/geometry/paths/path"

type TypeStats = Record<string,TypeStat>

interface TypeStat {
    regular: number,
    action: number,
    total: number
}

export { Generator, TypeStats, TypeStat }
export default class Generator {
    constructor()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] || "{}");
        Object.assign(CONFIG, userConfig);

        CONFIG.progressBar = new ProgressBar();
        CONFIG.progressBar.setPhases(["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]);
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

        // convert image icons into ones with a random cutout
        await this.bakeCutoutInto("icons");
        await this.bakeCutoutInto("icons_actions");

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);

        const dims = CONFIG.cards.dims[CONFIG.cardSize ?? "regular"];

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

        let elemDict : Record<string,string> = CONFIG.elements;

        const numElementUsed:TypeStats = {}        
        for(const [element,subtype] of Object.entries(elemDict))
        {
            numElementUsed[subtype] = { regular: 0, action: 0, total: 0 };
        }

        // to get a quick reference about what type counters what other type
        // and a reverse dictionary to quickly look up main type from sub type
        const elementCycleSubtype = ["","","",""];
        const elemDictReverse:Record<string,string> = {};
        CONFIG.gameplay.elementCycleSubtype = elementCycleSubtype;
        CONFIG.elementsReverse = elemDictReverse;
        for(const [element, subtype] of Object.entries(elemDict))
        {
            const idx = CONFIG.gameplay.elementCycle.indexOf(element);
            elementCycleSubtype[idx] = subtype;
            elemDictReverse[subtype] = element;
        }

        const packs = [];    
        let counter = 0;  
        if(CONFIG.debugSingleCard) { elemDict = { "red": "fire" } }
        const numElements = Object.keys(elemDict).length;
        for(const [element,subtype] of Object.entries(elemDict))
        {
            const progressText = "Creating element " + element + " => " + subtype + " (" + counter + "/" + numElements + ")"
            CONFIG.progressBar.setInfo(progressText);
            const p = new Pack(element, subtype);
            p.createCards(numElementUsed);
            packs.push(p);
            counter++;
        }

        return packs;
    }

    async bakeCutoutInto(key:string)
    {
        const iconRes = CONFIG.resLoader.getResource(key);
        const numFrames = iconRes.countFrames();
        let newCanvases = [];
        for(let i = 0; i < numFrames; i++)
        {
            const img = iconRes.getFrameAsResource(i);
            const op = new LayoutOperation({
                clip: this.getFunkyClipPath(img.size) 
            });
            const canv = img.toCanvas(null, op);
            newCanvases.push(canv);
        }

        const newFrames = await convertCanvasToImageMultiple(newCanvases);
        for(let i = 0; i < numFrames; i++)
        {
            iconRes.swapFrame(i, newFrames[i]);
        }
    }

    getFunkyClipPath(size:Point, bounds = { min: 3, max: 6 }) : Path
    {
        const path = [
            new Point(),
            new Point(size.x, 0),
            new Point(size.x, size.y),
            new Point(0, size.y)
        ]
        const funkyPath = takeBitesOutOfPath({ path: path, biteBounds: bounds });
        return new Path({ points: funkyPath });
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