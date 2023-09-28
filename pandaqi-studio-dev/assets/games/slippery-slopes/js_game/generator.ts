import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import ProgressBar from "js/pq_games/website/progressBar"
import CONFIG from "../js_shared/config";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import WordCards from "./wordCards"
import SliderCards from "./sliderCards"
import loadPandaqiWords from "../js_shared/loadPandaqiWords";

export default class Generator 
{
    setup()
    {
        this.setupConfig();
        this.setupProgressBar();
    }

    setupConfig()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKeyBaseGame] || "{}");
        console.log(userConfig);
        Object.assign(CONFIG, userConfig);
    }

    setupProgressBar()
    {
        const progressBar = new ProgressBar();
        CONFIG.progressBar = progressBar;
        progressBar.setPhases(["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]);
    }

    async start()
    {
        console.log("[Slippery Slopes] Generation started.")

        this.setup();
        await this.loadAssets();
        CONFIG.progressBar.gotoNextPhase();

        const wordCards = new WordCards();
        CONFIG.progressBar.setInfo("Generating word cards.");
        wordCards.generate();

        const sliderCards = new SliderCards();
        CONFIG.progressBar.setInfo("Generating sliders.");
        sliderCards.generate();

        CONFIG.progressBar.setInfo("Drawing everything onto cards.");
        const canvases = await Promise.all([wordCards.draw(), sliderCards.draw()]);
        
        await this.downloadPDF(canvases.flat());
        CONFIG.progressBar.gotoNextPhase();
        console.log("[Slippery Slopes] Done.");
    }

    async loadAssets()
    {
        CONFIG.progressBar.gotoNextPhase();
        
        const resLoader = new ResourceLoader({ base: CONFIG.assetsURL });
        for(const [key,data] of Object.entries(CONFIG.fonts))
        {
            if(data.crasheryCliffs && !CONFIG.expansions.crasheryCliffs) { continue; }
            resLoader.planLoad(key, { key: data.key, path: data.url });
        }

        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            resLoader.planLoad(key, { path: data.path, frames: data.frames });
        }
        await resLoader.loadPlannedResources();

        const shouldLoadWords = CONFIG.generateWords || CONFIG.expansions.crasheryCliffs;
        CONFIG.pandaqiWords = await loadPandaqiWords(CONFIG, shouldLoadWords);

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        CONFIG.resLoader = resLoader;
        CONFIG.pdfBuilder = pdfBuilder; 
    }

    async downloadPDF(canvases:HTMLCanvasElement[])
    {
        CONFIG.progressBar.gotoNextPhase();

        const images = await convertCanvasToImageMultiple(canvases);
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