import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import GridMapper from "js/pq_games/layout/gridMapper";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import ProgressBar from "js/pq_games/website/progressBar";

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

    generators: Record<string,any>;
    drawers: Record<string,GridMapper>;

    filterAssets: Function = (dict) => { return dict; }
    progressBarPhases:string[] = ["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]
    visualizerClass: any; // @TODO: create a DEFAULT visualizer class if omitted?

    constructor(CONFIG)
    {
        this.config = CONFIG;
        this.setupConfig(CONFIG);

        this.generators = {};
        this.drawers = {};

        this.progressBar = new ProgressBar();
        this.progressBar.setPhases(this.progressBarPhases);

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT, debugWithoutFile: this.config.debug.omitFile };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        this.pdfBuilder = pdfBuilder; 
    }

    addPipeline(id:string, generatorClass, drawerConfig)
    {
        this.addGenerator(id, generatorClass);
        this.addDrawer(id, drawerConfig);
    }

    addGenerator(id:string, generatorClass)
    {
        this.generators[id] = new generatorClass();
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

        const assetsToLoad = this.filterAssets(this.config.assets);

        const resLoader = new ResourceLoader({ base: this.config.assetsBase });
        if(!this.config.debug.onlyGenerate) { resLoader.planLoadMultiple(assetsToLoad); }
        await resLoader.loadPlannedResources();
        
        this.resLoader = resLoader;  
    }

    async createCards()
    {
        this.progressBar.gotoNextPhase();
        for(const generator of Object.values(this.generators))
        {
            await generator.generate();
        }
    }
    
    async drawCards()
    {
        if(this.config.debug.onlyGenerate) { return; }

        const itemsOfType = {};

        // @NOTE: so far, drawers are always just GridMappers, though that might generalize in the future
        for(const [id,drawer] of Object.entries(this.drawers))
        {
            const items = this.generators[id].get();
            const itemSize = drawer.getMaxElementSize();
            const visualizer = new this.visualizerClass({
                resLoader: this.resLoader, 
                itemSize: itemSize,
                inkFriendly: this.config.inkFriendly
            });
    
            // cards handle drawing themselves
            const promises = [];
            for(const item of items)
            {
                const type = item.type ?? "default";
                if(!itemsOfType[type]) { itemsOfType[type] = []; }
                itemsOfType[type].push(item);
                if(this.config.debug.singleDrawPerType && itemsOfType[type].length > 1) { continue; }
    
                promises.push(item.draw(visualizer));
            }
    
            const canvases = await Promise.all(promises);
            drawer.addElements(canvases.flat());
        }
    }

    async downloadPDF()
    {
        if(this.config.debug.onlyGenerate) { return; }

        this.progressBar.gotoNextPhase();

        for(const drawer of Object.values(this.drawers))
        {
            const images = await convertCanvasToImageMultiple(drawer.getCanvases());
            this.pdfBuilder.addImages(images);
        }

        const pdfConfig = { customFileName: this.config.fileName }
        this.pdfBuilder.downloadPDF(pdfConfig);
    }
}