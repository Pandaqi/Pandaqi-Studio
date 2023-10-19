import ProgressBar from "js/pq_games/website/progressBar";
import CONFIG from "../js_shared/config";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import GridMapper from "js/pq_games/layout/gridMapper";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import Pack from "./pack";
import { CardData, SETS } from "../js_shared/dict";
import fromArray from "js/pq_games/tools/random/fromArray";
import createRandomSet from "../js_shared/createRandomSet";

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

        // automatically remember the texture needed
        for(const [setName,setData] of Object.entries(SETS))
        {
            for(const [cardName, cardData] of Object.entries(setData))
            {
                cardData.textureKey = setName;
            }
        }

        let dict = SETS[CONFIG.cardSet];
        if(CONFIG.cardSet == "random") { dict = createRandomSet(); }
        CONFIG.possibleCards = dict;

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

        let cardSetsToLoad : Set<string> = new Set();
        const dict : Record<string,CardData> = CONFIG.possibleCards; // just to make type checker happy
        for(const [key,data] of Object.entries(dict))
        {
            cardSetsToLoad.add(data.textureKey);
        }

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            if(("cardSet" in data) && !cardSetsToLoad.has(key)) { continue; }
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
        let numCards = Object.keys(CONFIG.possibleCards).length;
        
        const packs = [];
        for(const [key,data] of Object.entries(CONFIG.possibleCards))
        {
            const progressText = "Creating card " + key + "(" + counter + "/" + numCards + ")"
            this.progressBar.setInfo(progressText);

            const p = new Pack(key);
            p.fill();
            packs.push(p);
            counter++;

            if(CONFIG.debugSinglePack && counter >= 1) { break; }
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