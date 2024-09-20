import BoardVisualizer from "js/pq_games/website/boardVisualizer";

export default class BoardGenerator
{
    filterAssets: Function = (dict:Record<string,any>) => { return dict; }
    setupFunction: Function = (cfg:Record<string,any>) => {}
    evaluatorClass: any
    generatorClass: any
    drawerClass: any

    config:Record<string,any>
    visualizer:BoardVisualizer

    canvas: HTMLCanvasElement

	constructor(cfg:Record<string,any>) 
    {
        this.config = cfg;
        const assetsToLoad = this.filterAssets(this.config.assets);
        this.config.assets = assetsToLoad;
        this.visualizer = new BoardVisualizer({ config: this.config, scene: this, backend: "raw" });
    }

    async create(userConfig:Record<string,any>) 
    {
        this.setup(userConfig);

        const board = await this.generate();
        await this.draw(board);
        this.visualizer.convertCanvasToImage(this);
    }

    setup(userConfig:Record<string,any>)
    {
        Object.assign(this.config, userConfig);
        this.config.resLoader = this.visualizer.resLoader; // save resource loader on config for use elsewhere; @TODO: not the cleanest approach
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