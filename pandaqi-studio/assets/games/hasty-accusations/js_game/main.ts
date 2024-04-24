import ProgressBar from "js/pq_games/website/progressBar";
import CONFIG from "../js_shared/config";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder, { PageFormat, PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import GridMapper from "js/pq_games/layout/gridMapper";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import CardPicker from "./cardPicker";
import Card from "./card";
import Visualizer from "./visualizer";

export default class Generator
{
    progressBar: ProgressBar;
    pdfBuilder: PdfBuilder;
    resLoader: ResourceLoader;
    gridMappers: Record<string,GridMapper>;

    constructor()
    {
        this.setupConfig();

        this.gridMappers = {};
        this.progressBar = new ProgressBar();
        this.progressBar.setPhases(["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]);
    }

    setupConfig()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] ?? "{}");
        Object.assign(CONFIG, userConfig);
        console.log(CONFIG);
    }

    async start()
    {
        await this.loadAssets();
        const [cardsPlay, cardsSuspect] = this.createCards();
        await this.drawCards("cards", cardsPlay);
        await this.drawCards("suspects", cardsSuspect);
        await this.downloadPDF();
        this.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        this.progressBar.gotoNextPhase();

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        const assetsToLoad = {};
        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            // @ts-ignore
            if(data.cardSet && key != CONFIG.cardSet) { continue; }
            // @ts-ignore
            if(data.suspectsOnly && !CONFIG.includeCharacters) { continue; }
            // @ts-ignore
            if(data.cardsOnly && !CONFIG.includeCards) { continue; }
            assetsToLoad[key] = data;
        }

        resLoader.planLoadMultiple(assetsToLoad);
        await resLoader.loadPlannedResources();
        this.resLoader = resLoader;

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT, debugWithoutFile: CONFIG.debugWithoutFile, format: CONFIG.pageSize as PageFormat };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        this.pdfBuilder = pdfBuilder;   
    }

    createCards()
    {
        this.progressBar.gotoNextPhase();

        const cardPicker = new CardPicker();
        cardPicker.generate();
        return [cardPicker.getPlay(), cardPicker.getSuspect()];
    }
    
    async drawCards(type:string, cards:Card[])
    {
        console.log("Drawing cards of type: " + type);
        console.log(cards); 

        if(CONFIG.debugOnlyGenerate) { return; }
        
        const dims = CONFIG[type].dims[CONFIG.itemSize ?? "regular"];
        const gridConfig = { pdfBuilder: this.pdfBuilder, dims: dims, dimsElement: CONFIG[type].dimsElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMappers[type] = gridMapper;  
        const visualizerPlay = new Visualizer(this.resLoader, gridMapper.getMaxElementSize(), CONFIG.inkFriendly);

        // cards handle drawing themselves
        const promises = [];
        const cardsOfType = {};
        for(const card of cards)
        {
            if(!cardsOfType[card.key]) { cardsOfType[card.key] = []; }
            cardsOfType[card.key].push(card);
            if(CONFIG.debugSingleCard && cardsOfType[card.key].length > 1) { continue; }

            promises.push(card.draw(visualizerPlay));
        }

        const canvases = await Promise.all(promises);
        gridMapper.addElements(canvases.flat());
    }

    async downloadPDF()
    {
        if(CONFIG.debugOnlyGenerate) { return; }

        this.progressBar.gotoNextPhase();

        const images = await convertCanvasToImageMultiple(this.gridMappers.cards.getCanvases());
        this.pdfBuilder.addImages(images);

        const images2 = await convertCanvasToImageMultiple(this.gridMappers.suspects.getCanvases());
        this.pdfBuilder.addImages(images2);

        const pdfConfig = { customFileName: CONFIG.fileName }
        this.pdfBuilder.downloadPDF(pdfConfig);
    }

}

new Generator().start();