import Renderer from "js/pq_games/layout/renderers/renderer";
import RendererPandaqi from "js/pq_games/layout/renderers/rendererPandaqi";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";
import ProgressBar from "js/pq_games/website/progressBar";

export default class BoardGenerator
{
    filterAssets: Function = (dict:Record<string,any>) => { return dict; }
    setupFunction: Function = (cfg:Record<string,any>) => {}
    evaluatorClass: any
    generatorClass: any
    drawerClass: any

    config:Record<string,any>
    visualizer:BoardVisualizer

    groups: ResourceGroup[]

    resLoader: ResourceLoader
    renderer: Renderer

    containerOutput:HTMLElement;
    progBar: ProgressBar;

    profile: boolean;
    pdfBuilder: PdfBuilder

	constructor(cfg:Record<string,any>, rendererInstance = null) 
    {
        this.config = cfg;
        this.config.assets = this.filterAssets(this.config.assets);
        this.renderer = rendererInstance ?? new RendererPandaqi();
    }

    async letDomUpdate()
	{
		return new Promise((r) => setTimeout(r, 33));
	}

    async start() 
    {
        const startTime = Date.now(); 

        await this.setup();
        await this.loadAssets();

        const board = await this.generate();
        const images = await this.draw(board);
        this.displayOnPage(images);
        await this.downloadPDF(images);

        const endTime = Date.now();
        if(this.profile)
        {
            console.log("Generation Time (ms) = ", Math.floor(endTime - startTime));
        }
    }

    async setup()
    {
        // read from local storage
        const configKey = this.config.configKey ?? "pandaqiGeneralConfig";
		const gameConfig = JSON.parse(window.localStorage.getItem(configKey) ?? "{}");
        Object.assign(this.config, gameConfig);

        // random seeding (if no fixed one set)
        if(this.config.useRandomSeed)
		{
			const randomSeedLength = Math.floor(Math.random() * 6) + 3;
			const randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, randomSeedLength);
			this.config.seed = randomSeed;
		}

        // create PDF builder + use it to set proper size
        this.pdfBuilder = new PdfBuilder(this.config);
		this.config.size = this.pdfBuilder.getFullSize();
        this.config.splitDims = this.pdfBuilder.splitDims; // ??

        // create container for output on page
        const contOut = document.createElement("div");
		contOut.id = "board-visualizer-output";
		this.containerOutput = document.body.appendChild(contOut);
		
		// @TODO: find much cleaner approach than this hardcoded shit => add CSS style block at end of page with class properties, then just add that class to containerOutput?
		this.containerOutput.style.position = "fixed";
		this.containerOutput.style.width = "100%";
		this.containerOutput.style.height = "100%";
		this.containerOutput.style.display = "flex";
		this.containerOutput.style.placeContent = "center";
		this.containerOutput.style.alignItems = "center";
		this.containerOutput.style.boxSizing = "border-box";
		this.containerOutput.style.left = "0";
		this.containerOutput.style.right = "0";
		this.containerOutput.style.padding = "6em 1.5em";

        // create progress bar feedback
		this.progBar = new ProgressBar(document.body);
		this.progBar.setPhases(["Loading Assets", "Generating", "Drawing", "Creating PDF", "Done!"]);
		this.progBar.changeVerticalAlign("start");

        // custom callback to modify setup further
        this.setupFunction(this.config);
    }

    async loadAssets()
    {
        this.progBar.gotoNextPhase();
        await this.letDomUpdate();

        this.resLoader = new ResourceLoader({ base: this.config.assetsBase, renderer: this.renderer });
		this.resLoader.planLoadMultiple(this.config.assets);
        await this.resLoader.loadPlannedResources();
    }

    async generate()
    {
        this.progBar.gotoNextPhase();
        await this.letDomUpdate();

        const boardGen = this.generatorClass ? new this.generatorClass() : null;
        if(!boardGen) { console.error("[BoardGenerator] No generator set. Only drawing!"); return null; }
        
        const evaluator = this.evaluatorClass ? new this.evaluatorClass() : null;

        let board;
        do {
            board = await boardGen.generate();
        } while(evaluator && !evaluator.isValid(board));
        return board;
    }

    async draw(board) : Promise<HTMLImageElement[]>
    {
        const boardDraw = this.drawerClass ? new this.drawerClass() : null;
        if(!boardDraw) { console.error("[BoardGenerator] No drawer set. Only generating!"); return []; }

        this.progBar.gotoNextPhase();
        await this.letDomUpdate();

        this.visualizer = new BoardVisualizer({ config: this.config, renderer: this.renderer, resLoader: this.resLoader });
        this.visualizer.prepareDraw();

        let groups : ResourceGroup[] = await boardDraw.draw(this.visualizer, board);
        if(!Array.isArray(groups)) { groups = [groups]; }

        const images : HTMLImageElement[] = [];
        for(let i = 0; i < groups.length; i++)
        {
            this.progBar.setInfo("Drawing board " + (i + 1) + " / " + groups.length);
            await this.letDomUpdate();
            images.push(...(await this.visualizer.finishDraw(groups[i])));
        }
        
        return images;
    }

    async displayOnPage(images:HTMLImageElement[])
    {
        for(const img of images)
        {
            img.style.maxWidth = "100%";
			img.style.maxHeight = "100%";
			img.style.filter = "drop-shadow(0 0 0.15em #333)";
			this.containerOutput.appendChild(img);
        }

        const isMultiView = images.length > 1;
		if(isMultiView)
		{
			this.containerOutput.style.display = "grid";
			const numColumns = images.length <= 4 ? 2 : 3;
			const str = new Array(numColumns).fill("auto").join(" ");
			this.containerOutput.style.gridTemplateColumns = str;
		}
    }

    async downloadPDF(images:HTMLImageElement[])
    {
        this.progBar.gotoNextPhase();
        await this.letDomUpdate();

        this.pdfBuilder.addImages(images);
        this.pdfBuilder.downloadPDF(this.config);

        this.progBar.gotoNextPhase(); // should be final phase
        this.progBar.setInfo("(Reload page to regenerate with same settings.)");
    }
}