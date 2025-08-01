import ProgressBar from "js/pq_games/website/progressBar";
import { CONFIG } from "../shared/config";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import { PageOrientation } from "js/pq_games/pdf/pdfEnums";
import GridMapper from "js/pq_games/layout/gridMapper";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import TilePicker from "./tilePicker";
import Card from "./tile";
import Visualizer from "./visualizer";

export default class Generator
{
    resLoader: ResourceLoader;
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
        console.log(CONFIG);
    }

    async start()
    {
        await this.loadAssets();
        const cards = this.createCards();
        await this.drawCards(cards);
        await this.downloadPDF();
        this.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        this.progressBar.gotoNextPhase();

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        resLoader.planLoadMultiple(CONFIG.assets)
        await resLoader.loadPlannedResources();
        this.resLoader = resLoader;

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT, debugWithoutFile: CONFIG.debugWithoutFile };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        this.pdfBuilder = pdfBuilder;

        const size = CONFIG.tiles.size[CONFIG.itemSize ?? "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, size: size, sizeElement: CONFIG.tiles.sizeElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMapper = gridMapper;     
    }

    createCards() : Card[]
    {
        this.progressBar.gotoNextPhase();

        const tilePicker = new TilePicker();
        tilePicker.generate();
        console.log(tilePicker.get());
        return tilePicker.get();
    }
    
    async drawCards(cards:Card[])
    {
        if(CONFIG.debugOnlyGenerate) { return; }

        const visualizer = new Visualizer(this.resLoader, this.gridMapper.getMaxElementSize(), CONFIG.inkFriendly);

        // cards handle drawing themselves
        const promises = [];
        const cardsOfType = {};
        for(const card of cards)
        {
            const tp = card.getFirstType();
            if(!cardsOfType[tp]) { cardsOfType[tp] = []; }
            cardsOfType[tp].push(card);
            if(CONFIG.debugSingleCard && cardsOfType[tp].length > 1) { continue; }

            promises.push(card.draw(visualizer));
        }

        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases.flat());
    }

    async downloadPDF()
    {
        if(CONFIG.debugOnlyGenerate) { return; }

        this.progressBar.gotoNextPhase();

        const images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
        this.pdfBuilder.addImages(images);
        const pdfConfig = { customFileName: CONFIG.fileName }
        this.pdfBuilder.downloadPDF(pdfConfig);
    }

}

new Generator().start();