import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage"
import splitImage from "js/pq_games/layout/canvas/splitImage"
import PdfBuilder from "../pdf/pdfBuilder"
import { SettingsConfig } from "./settings"
import createCanvas from "../layout/canvas/createCanvas"
import ResourceLoader from "../layout/resources/resourceLoader"
// @ts-ignore
import { CANVAS, Game, Scale } from "../phaser/phaser.esm"
import Point from "../tools/geometry/point"
import ProgressBar from "./progressBar"
import { Container, WebGPURenderer } from "../pixi/pixi.mjs"

interface VisualizerParams
{
	scene:any,
	config:Record<string,any>,
	configKey?: string, // overrides the default configKey read from config
	renderer?:VisualizerRenderer
}

interface CanvasToImageParams
{
	splitDims?: Point|string
}

enum VisualizerRenderer
{
	PHASER = "phaser",
	PANDAQI = "pandaqi",
	PIXI = "pixi",
}

export { VisualizerRenderer }
export default class BoardVisualizer
{
	phaserGame = null
	canvas: HTMLCanvasElement

	config: Record<string,any>;
	gameConfig: SettingsConfig
	pdfBuilder: PdfBuilder
	generationClass: any
	renderer:VisualizerRenderer
	rendererInstance:any // only used by PIXI; the actual renderer class that must do stuff
	collection = false

	containerInput:HTMLElement
	containerOutput:HTMLElement

	progBar:ProgressBar
	resLoader: ResourceLoader

	constructor(params:VisualizerParams)
	{
		this.config = params.config ?? {};
		this.generationClass = params.scene;
		this.renderer = params.renderer ?? VisualizerRenderer.PANDAQI;
		
		const configKey = (params.configKey ?? this.config.configKey) ?? "pandaqiGeneralConfig";
		this.gameConfig = JSON.parse(window.localStorage.getItem(configKey) ?? "{}");
		console.log("gameConfig", this.gameConfig);
		this.gameConfig.visualizer = this;

		if(this.gameConfig.useRandomSeed)
		{
			const randomSeedLength = Math.floor(Math.random() * 6) + 3;
			const randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, randomSeedLength);
			this.gameConfig.seed = randomSeed;
		}

		const cont = document.createElement("div");
		cont.id = "phaser-container";

		this.containerInput = document.body.appendChild(cont);

		const contOut = document.createElement("div");
		contOut.id = "board-visualizer-output";
		this.containerOutput = document.body.appendChild(contOut);
		
		// @TODO: find much cleaner approach than this hardcoded shit
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

		this.progBar = new ProgressBar(document.body);
		this.progBar.setPhases(["Generating", "Creating PDF", "Done!"]);
		this.progBar.changeVerticalAlign("start");

		this.resLoader = new ResourceLoader({ base: this.config.assetsBase, renderer: this.renderer });
		this.resLoader.planLoadMultiple(this.config.assets);

		this.start();
	}

	onGenerationStart()
	{
		this.progBar.gotoNextPhase();
	}

	async onConversionDone(_scene = null) 
	{
		// if we're building a collection, we don't immediately destroy/finalize after each image
		if(this.collection) { return; }
		if(this.phaserGame) { this.phaserGame.destroy(true); }

		this.containerInput.style.display = "none";
		document.body.style.height = "auto"; // to undo stupid phaser stuff
		this.progBar.gotoNextPhase();
		console.log("Conversion Done!");

		await new Promise((r) => setTimeout(r, 33));

		this.downloadPDF();
	}

	downloadPDF()
	{
		this.pdfBuilder.downloadPDF(this.gameConfig);
		this.progBar.gotoNextPhase();
		this.progBar.setInfo("(Reload page to regenerate with same settings.)");
	}

	async start() 
	{
		// load assets
		await this.resLoader.loadPlannedResources();

		// @TODO: this sets gameConfig.size to PDF size => find cleaner syntax for that
		this.createPDFBuilder(); 

		this.containerInput.innerHTML = '';
		this.containerInput.style.display = "block";

		if(this.renderer == VisualizerRenderer.PHASER)
		{
			// @ts-ignore
			const generationClass = this.generationClass ?? window.BoardGeneration;

			const phaserConfig = {
				type: CANVAS,
				width: this.gameConfig.size.x,
				height: this.gameConfig.size.y,
				scale: {
					mode: Scale.FIT,
				},

				backgroundColor: this.gameConfig.bgColor ?? '#FFFFFF',
				parent: 'phaser-container',
				scene: [generationClass],
			}

			this.phaserGame = new Game(phaserConfig);
			this.phaserGame.scene.start("boardGeneration", this.gameConfig);

			// @ts-ignore
			window.GAME = this.phaserGame; 
		}

		if(this.renderer == VisualizerRenderer.PANDAQI)
		{
			const canvas = createCanvas({ size: this.gameConfig.size, alpha: false });
			// container.appendChild(canvas); => not necessary
			this.canvas = canvas;
			this.gameConfig.canvas = canvas;

			setTimeout(() => {
				this.generationClass.create(this.gameConfig);
			}, 33);	
		}

		if(this.renderer == VisualizerRenderer.PIXI)
		{
			const renderer = new WebGPURenderer();
			await renderer.init({ 
				width: this.gameConfig.size.x, height: this.gameConfig.size.y, 
				backgroundColor: 0xFFFFFF,
				//antialias: true,
				useBackBuffer: true,
			});
			this.rendererInstance = renderer;
			this.canvas = renderer.canvas;
			this.gameConfig.canvas = this.canvas;

			setTimeout(() => {
				this.generationClass.create(this.gameConfig);
			}, 33);	
		}

		this.onGenerationStart();
	}

	async convertCanvasToImage(scene:any, params:CanvasToImageParams = {}) 
	{
		if(!this.pdfBuilder) { console.error("Can't convert canvas to image. No PDF builder!"); return; }
		
		let img;

		// the scene is the phaser scene object
		if(this.renderer == VisualizerRenderer.PHASER)
		{
			const canv = this.containerInput.firstChild as HTMLCanvasElement;
			await new Promise((r) => setTimeout(r, 100)); // must wait a bit to ensure Phaser canvas is actually redrawn
			img = await convertCanvasToImage(canv) as HTMLImageElement;

			/* WEBGL rendering
			img = await new Promise((resolve) => {
					scene.renderer.snapshot(image =>
					{
						resolve(image);
					});
				})
			*/
		}

		// the scene is the BoardGenerator (and its final tree is in `.finalGroup`)
		if(this.renderer == VisualizerRenderer.PANDAQI)
		{
			console.log(scene);
			scene.groupFinal.toCanvas(this.canvas);
			img = await convertCanvasToImage(this.canvas);
		}

		// the scene is the BoardGenerator
		if(this.renderer == VisualizerRenderer.PIXI)
		{
			const appRoot = new Container();
			scene.groupFinal.toPixi(this.rendererInstance, appRoot);
			this.rendererInstance.render(appRoot); // this insta-draws all queued operations
			img = await convertCanvasToImage(this.canvas);
		}

		// split if necessary, add to pdfBuilder
		const splitConfig = { splitDims: this.pdfBuilder.splitDims }
		const images = await splitImage(img, splitConfig);

		for(let i = 0; i < images.length; i++)
		{
			this.pdfBuilder.addImage(images[i]);

			images[i].style.maxWidth = "100%";
			images[i].style.maxHeight = "100%";
			images[i].style.filter = "drop-shadow(0 0 0.15em #333)";
			this.containerOutput.appendChild(images[i]);
		}

		const totalNumImages = this.containerOutput.children.length;
		if(totalNumImages > 1)
		{
			this.containerOutput.style.display = "grid";
			const numColumns = totalNumImages <= 4 ? 2 : 3;
			const str = [].fill("auto", 0, numColumns).join(" ");
			this.containerOutput.style.gridTemplateColumns = str;
		}

		// repeat the draw, but calling a different visualization function ("createSecretBoard")
		// @NOTE: hide the secret board after creating it
		if(this.gameConfig.secretBoard) 
		{
			if(!scene.createdSecretBoard) { scene.createSecretBoard(); return; } 
			img.style.display = 'none'; 
		} 

		this.onConversionDone(scene);
	}

	createPDFBuilder()
	{
		if(this.pdfBuilder) { this.pdfBuilder.destroy(); }
		this.pdfBuilder = new PdfBuilder(this.gameConfig);
		this.gameConfig.size = this.pdfBuilder.getFullSize();
	}

	startCollection()
	{
		this.createPDFBuilder();
		this.collection = true;
	}

	endCollection()
	{
		this.collection = false;
		this.onConversionDone();
	}
}