import ProgressBar from "js/pq_games/website/progressBar";
import CONFIG from "../js_shared/config";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import GridMapper from "js/pq_games/layout/gridMapper";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import booleanDictToArray from "js/pq_games/tools/collections/booleanDictToArray";
import Pack from "./pack";
import { ANIMALS } from "../js_shared/dict";

export default class Generator
{
    progressBar: ProgressBar;
    pdfBuilder: PdfBuilder;
    gridMapper: GridMapper;

    constructor()
    {
        this.setupConfig();

        this.progressBar = new ProgressBar();
        this.progressBar.setPhases(["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]);
    }

    setupConfig()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] ?? "{}");
        Object.assign(CONFIG, userConfig);

        const animalsBase = booleanDictToArray(CONFIG.animalsBase);
        const animalsExpansion = booleanDictToArray(CONFIG.animalsExpansion);
        CONFIG.animals = [animalsBase, animalsExpansion].flat();
    }

    async start()
    {
        await this.loadAssets();
        const packs = this.createCards();
        await this.drawCards(packs);
        await this.downloadPDF();
        this.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        this.progressBar.gotoNextPhase();

        let loadExpansionAssets = false;
        for(const animal of CONFIG.animals)
        {
            if(ANIMALS[animal].expansion) { loadExpansionAssets = true; break; }
        } 

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            if(("expansion" in data) && !loadExpansionAssets) { continue; }
            if(key == "bear_icons" && !CONFIG.addBearIcons) { continue; }
            resLoader.planLoad(key, data);
        }
        await resLoader.loadPlannedResources();
        CONFIG.resLoader = resLoader;

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT, debugWithoutFile: CONFIG.debugWithoutFile };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        this.pdfBuilder = pdfBuilder;

        const dims = CONFIG.cards.dims[CONFIG.cardSize ?? "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: CONFIG.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMapper = gridMapper;     

        CONFIG.cards.size = gridMapper.getMaxElementSize();
    }

    createCards() : Pack[]
    {
        this.progressBar.gotoNextPhase();

        let counter = 0;
        let numAnimals = CONFIG.animals.length;
        
        const packs = [];
        for(const animal of CONFIG.animals)
        {
            const progressText = "Creating animal " + animal + "(" + counter + "/" + numAnimals + ")"
            this.progressBar.setInfo(progressText);

            const p = new Pack(animal);
            p.fill();
            packs.push(p);
            counter++;
        }

        return packs;
    }
    
    async drawCards(packs:Pack[])
    {
        const promises = [];
        for(const pack of packs)
        {
            promises.push(pack.draw());
        }

        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases.flat());
    }

    async downloadPDF()
    {
        this.progressBar.gotoNextPhase();

        const images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
        this.pdfBuilder.addImages(images);
        const pdfConfig = { customFileName: CONFIG.fileName }
        this.pdfBuilder.downloadPDF(pdfConfig);
    }

}

new Generator().start();