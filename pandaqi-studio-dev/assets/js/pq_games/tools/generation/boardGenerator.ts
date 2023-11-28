import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import OnPageVisualizer from "js/pq_games/website/onPageVisualizer";

export default class BoardGenerator
{
    filterAssets: Function = (dict:Record<string,any>) => { return dict; }
    setupFunction: Function = (cfg:Record<string,any>) => {}
    evaluatorClass: any
    generatorClass: any
    drawerClass: any
    resLoader:ResourceLoader
    config:Record<string,any>

    canvas: HTMLCanvasElement

	constructor(CONFIG) 
    {
        this.config = CONFIG;
        this.resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        OnPageVisualizer.linkTo({ scene: this, key: "boardGeneration", backend: "raw" });
    }

    async create(userConfig:Record<string,any>) 
    {
        this.setup(userConfig);

        const assetsToLoad = this.filterAssets(this.config.assets);
        this.resLoader.planLoadMultiple(assetsToLoad);        
        await this.resLoader.loadPlannedResources();

        const board = await this.generate();
        await this.draw(board);
        OnPageVisualizer.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(this.config, userConfig);
        this.config.resLoader = this.resLoader; // save resource loader on config for use elsewhere; @TODO: not the cleanest approach
        this.canvas = userConfig.canvas; // OnPageVisualizer creates the canvas and passes this through
        this.setupFunction(this.config);
    }

    async generate()
    {
        const evaluator = new this.evaluatorClass();
        const boardGen = new this.generatorClass();
        let board;
        do {
            board = await boardGen.generate();
        } while(!evaluator.isValid(board));
        return board;
    }

    async draw(board)
    {
        const boardDraw = new this.drawerClass();
        await boardDraw.draw(this.canvas, board);
    }    
}