import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage"
import splitImage from "js/pq_games/layout/canvas/splitImage"
import ResourceLoader from "../layout/resources/resourceLoader"
import PdfBuilder from "../pdf/pdfBuilder"
import { SettingsConfig } from "./settings"

import Renderer from "../layout/renderers/renderer"
import RendererPandaqi from "../layout/renderers/rendererPandaqi"
import Point from "../tools/geometry/point"
import ProgressBar from "./progressBar"

interface VisualizerParams
{
	scene:any,
	config:Record<string,any>,
	configKey?: string, // overrides the default configKey read from config
	renderer?:Renderer
}

interface CanvasToImageParams
{
	splitDims?: Point|string
}

export default class BoardVisualizer
{
	config: Record<string,any>;
	gameConfig: SettingsConfig
	pdfBuilder: PdfBuilder
	renderClass: any
	renderer:Renderer
	collection = false

	containerInput:HTMLElement
	containerOutput:HTMLElement

	progBar:ProgressBar
	resLoader: ResourceLoader

	constructor(params:VisualizerParams)
	{
		this.config = params.config ?? {};
		this.renderClass = params.scene;
		this.renderer = params.renderer ?? new RendererPandaqi();
		
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
		this.progBar.setPhases(["Loading Assets", "Generating", "Creating PDF", "Done!"]);
		this.progBar.changeVerticalAlign("start");

		this.resLoader = new ResourceLoader({ base: this.config.assetsBase, renderer: this.renderer });
		this.resLoader.planLoadMultiple(this.config.assets);

		this.start();
	}

	async letDomUpdate()
	{
		return new Promise((r) => setTimeout(r, 33));
	}

	async onConversionDone(_scene = null) 
	{
		// if we're building a collection, we don't immediately destroy/finalize after each image
		if(this.collection) { return; }
		// @ts-ignore
		if(window.PHASER_GAME) { window.PHASER_GAME.destroy(true); }

		this.containerInput.style.display = "none";
		document.body.style.height = "auto"; // to undo stupid phaser stuff
		this.progBar.gotoNextPhase();
		console.log("Conversion Done!");

		await this.letDomUpdate();

		this.downloadPDF();
	}

	downloadPDF()
	{
		this.pdfBuilder.downloadPDF(this.gameConfig);
		this.progBar.gotoNextPhase();
		this.progBar.setInfo("(Reload page to regenerate with same settings.)");
	}

	getSize()
	{
		return this.gameConfig.size;
	}

	async start() 
	{
		// load assets
		this.progBar.gotoNextPhase();
		await this.resLoader.loadPlannedResources();

		// @TODO: this sets gameConfig.size to PDF size => find cleaner syntax for that
		this.createPDFBuilder(); 

		this.containerInput.innerHTML = '';
		this.containerInput.style.display = "block";

		// @ts-ignore
		const renderClass = this.renderClass ?? window.BoardGeneration;
		this.gameConfig.renderClass = renderClass;
		this.renderer.prepareDraw(this.gameConfig);
		this.progBar.gotoNextPhase();
		await this.letDomUpdate();
		this.renderer.startDraw(this.gameConfig);
	}

	async convertCanvasToImage(scene:any, params:CanvasToImageParams = {}) 
	{
		if(!this.pdfBuilder) { console.error("Can't convert canvas to image. No PDF builder!"); return; }
		
		// ask the renderer to get us our final canvas
		const canv = await this.renderer.finishDraw({ size: this.gameConfig.size, group: scene.groupFinal });
		const img = await convertCanvasToImage(canv);

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