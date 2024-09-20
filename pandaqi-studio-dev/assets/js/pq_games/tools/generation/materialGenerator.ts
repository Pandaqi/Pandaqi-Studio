import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import GridMapper from "js/pq_games/layout/gridMapper";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import ProgressBar from "js/pq_games/website/progressBar";
import MaterialVisualizer from "./materialVisualizer";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import { PageFormat, PageOrientation } from "js/pq_games/pdf/pdfEnums";
import { VisualizerRenderer } from "js/pq_games/website/boardVisualizer";

const DEFAULT_BATCH_SIZE = 10;
const GIVE_FEEDBACK = true;
const sleep = (timeout:number) => new Promise(r => setTimeout(r, timeout))

interface MaterialDrawCall
{
    item: any,
    drawer: GridMapper,
    visualizer: MaterialVisualizer
}

//
// Default debug config settings are
// debug.onlyGenerate => only invokes generator part of pipeline
// debug.omitFile => adds the images to the page, creates no pdf
// debug.singleItemPerType => only draws a single version of each unique type
//
// Besides that
// itemSize => determines general size for drawing, input on general settings
// dims + dimsElement => specific settings for gridMapper, given when adding this particular drawer to the pipeline
//
export default class MaterialGenerator
{
    config: Record<string,any>;
    progressBar: ProgressBar;
    pdfBuilder: PdfBuilder;
    resLoader: ResourceLoader;

    renderer: VisualizerRenderer;
    generators: Record<string,any>;
    drawers: Record<string,GridMapper>;

    filterAssets: Function = (dict) => { return dict; }
    progressBarPhases:string[] = ["Loading Assets", "Creating Cards", "Drawing Cards", "Preparing PDF", "Done!"]
    visualizerClass: any;
    visualizerClassCustom: any;

    constructor(CONFIG)
    {
        this.config = CONFIG;
        this.setupConfig(CONFIG);

        this.generators = {};
        this.drawers = {};

        this.renderer = CONFIG.renderer ?? VisualizerRenderer.PANDAQI;
        this.visualizerClass = MaterialVisualizer;

        this.progressBar = new ProgressBar();
        this.progressBar.setPhases(this.progressBarPhases);

        const pdfBuilderConfig = { orientation: this.config.pageOrientation ?? PageOrientation.PORTRAIT, debugWithoutFile: this.config.debug.omitFile, format: this.config.pageSize as PageFormat };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        this.pdfBuilder = pdfBuilder; 
    }

    setVisualizerClass(vis)
    {
        this.visualizerClass = vis;
    }

    setVisualizerClassCustom(vis)
    {
        this.visualizerClassCustom = vis;
    }

    addPipeline(id:string, generatorClass, drawerConfig)
    {
        this.addGenerator(id, generatorClass);
        this.addDrawer(id, drawerConfig);
    }

    // This allows passing a CLASS or a CLASS instance (a class is a "function" in the eyes of javascript)
    // Not great, but a simple compromise for future flexibility
    addGenerator(id:string, generatorClass)
    {
        this.generators[id] = typeof generatorClass == "function" ? new generatorClass() : generatorClass;
    }

    addDrawer(id:string, drawerConfig:Record<string,any>)
    {
        const dims = drawerConfig.dims[this.config.itemSize ?? "regular"];
        const autoStroke = drawerConfig.autoStroke ?? false;
        const gridConfig = { pdfBuilder: this.pdfBuilder, dims: dims, dimsElement: drawerConfig.dimsElement, autoStroke: autoStroke };
        const gridMapper = new GridMapper(gridConfig);
        this.drawers[id] = gridMapper;
    }

    setupConfig(CONFIG)
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] ?? "{}");
        Object.assign(CONFIG, userConfig);
        console.log(CONFIG);
    }

    async start()
    {
        await this.loadAssets();
        await this.createCards();
        await this.drawCards();
        await this.downloadPDF();
        this.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        this.progressBar.gotoNextPhase();
        await this.letDomUpdate();

        const assetsToLoad = this.filterAssets(this.config.assets);
        const resLoader = new ResourceLoader({ base: this.config.assetsBase, renderer: this.renderer });
        
        if(GIVE_FEEDBACK)
        {
            //resLoader.loadInSequence = true;
            resLoader.onResourceLoaded = (txt:string) => { this.progressBar.setInfo(txt); };
        }

        if(!this.config.debug.onlyGenerate) { resLoader.planLoadMultiple(assetsToLoad, this.config); }
        await resLoader.loadPlannedResources();
        
        this.resLoader = resLoader; 
    }

    async createCards()
    {
        this.progressBar.gotoNextPhase();
        await this.letDomUpdate();

        for(const generator of Object.values(this.generators))
        {
            await generator.generate();
        }
    }
    
    async drawCards()
    {
        if(this.config.debug.onlyGenerate) { return; }

        this.progressBar.gotoNextPhase();
        await this.letDomUpdate();

        const itemsOfType = {};

        // collect all items (and the visualizer for them), but don't draw them yet
        // @NOTE: so far, drawers are always just GridMappers, though that might generalize in the future
        const drawCalls:MaterialDrawCall[] = [];
        for(const [id,drawer] of Object.entries(this.drawers))
        {
            const items = this.generators[id].get();
            const itemSize = drawer.getMaxElementSize();
            this.config.resLoader = this.resLoader;
            this.config.itemSize = itemSize;
            this.config.renderer = this.renderer;

            const visualizer = new this.visualizerClass(this.config);
            if(this.visualizerClassCustom) { visualizer.setCustomObject(new this.visualizerClassCustom()); }
            for(const item of items)
            {
                const type = item.type ?? "default";
                if(!itemsOfType[type]) { itemsOfType[type] = []; }
                itemsOfType[type].push(item);
                if(this.config.debug.singleDrawPerType && itemsOfType[type].length > 1) { continue; }
    
                drawCalls.push({ item: item, drawer: drawer, visualizer: visualizer });
            }
        }

        // because we draw them in small batches to prevent overloading the browser
        // (and give intermittent feedback to user)
        let batchSize = this.config.generationBatchSize ?? DEFAULT_BATCH_SIZE;
        if(batchSize <= 0 || this.config.generationNoBatching) { batchSize = drawCalls.length; }
        const numBatches = Math.ceil(drawCalls.length / batchSize);
        for(let i = 0; i < numBatches; i++)
        {
            const infoText = "Drawing batch " + (i+1) + " / " + numBatches;
            console.log(infoText);
            this.progressBar.setInfo(infoText);

            const promises = [];
            const drawCallsInBatch = drawCalls.splice(0, batchSize);
            for(const drawCall of drawCallsInBatch)
            {
                // cards handle drawing themselves
                promises.push(drawCall.item.draw(drawCall.visualizer));
            }

            await this.letDomUpdate();

            const canvases = await Promise.all(promises);
            drawCallsInBatch[0].drawer.addElements(canvases.flat());
        }
    }

    async downloadPDF()
    {
        if(this.config.debug.onlyGenerate) { return; }

        this.progressBar.gotoNextPhase();

        for(const drawer of Object.values(this.drawers))
        {
            if(GIVE_FEEDBACK) {
                
                const canvases = drawer.getCanvases();
                const numPages = canvases.length;
                for(let i = 0; i < numPages; i++)
                {
                    const infoText = "Adding page " + (i+1) + " / " + numPages + " to PDF";
                    console.log(infoText);

                    this.progressBar.setInfo(infoText);
                    await sleep(33);

                    const image = await convertCanvasToImage(canvases[i]);
                    this.pdfBuilder.addImage(image);
                }

            } else {
                const images = await convertCanvasToImageMultiple(drawer.getCanvases());
                this.pdfBuilder.addImages(images);
            }
        }

        this.progressBar.setInfo("Compressing PDF (final step).");
        await sleep(33);

        const pdfConfig = { customFileName: this.config.fileName }
        this.pdfBuilder.downloadPDF(pdfConfig);
    }

    async letDomUpdate()
    {
        if(!GIVE_FEEDBACK) { return Promise.resolve('No delay!'); }
        return sleep(33);
    }
}