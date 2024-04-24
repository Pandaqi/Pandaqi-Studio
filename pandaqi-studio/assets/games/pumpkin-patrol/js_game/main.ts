import ProgressBar from "js/pq_games/website/progressBar";
import CONFIG from "../js_shared/config";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder, { PageFormat, PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import GridMapper from "js/pq_games/layout/gridMapper";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import { CardData, SETS, Type } from "../js_shared/dict";
import createRandomSet from "../js_shared/createRandomSet";
import CardPicker from "./generator";
import Card from "./card";
import Visualizer from "./visualizer";

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

        console.log(CONFIG);

        const peopleDict = SETS["people_" + CONFIG.setPeople] ?? createRandomSet(Type.PERSON);
        const decoDict = SETS["decorations_" + CONFIG.setDecorations] ?? createRandomSet(Type.DECORATION);
        const treatDict = SETS["treats_" + CONFIG.setTreats] ?? createRandomSet(Type.TREAT);

        console.log(decoDict);

        let dict = Object.assign({}, peopleDict);
        dict = Object.assign(dict, decoDict);
        dict = Object.assign(dict, treatDict);

        CONFIG.allCards = dict;
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

        let cardSetsToLoad : Set<string> = new Set();
        const dict : Record<string,CardData> = CONFIG.allCards; // just to make type checker happy
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

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT, debugWithoutFile: CONFIG.debugWithoutFile, format: CONFIG.pageSize as PageFormat };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        this.pdfBuilder = pdfBuilder;

        const dims = CONFIG.cards.dims[CONFIG.itemSize ?? "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: CONFIG.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMapper = gridMapper;     

        CONFIG.cards.size = gridMapper.getMaxElementSize();
    }

    createCards() : Card[]
    {
        this.progressBar.gotoNextPhase();

        const cardPicker = new CardPicker();
        cardPicker.generate();
        console.log(cardPicker.get());
        return cardPicker.get();
    }
    
    async drawCards(cards:Card[])
    {
        if(CONFIG.debugOnlyGenerate) { return; }

        // merely caches some default values (such as bg patterns) for much faster generation
        const visualizer = new Visualizer({ resLoader: CONFIG.resLoader, inkFriendly: CONFIG.inkFriendly, size: this.gridMapper.getMaxElementSize() });
        await visualizer.prepare();

        // cards handle drawing themselves
        const promises = [];
        const cardsOfType = {};
        for(const card of cards)
        {
            if(!cardsOfType[card.type]) { cardsOfType[card.type] = []; }
            cardsOfType[card.type].push(card);
            if(CONFIG.debugSingleCard && cardsOfType[card.type].length > 1) { continue; }

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