import splitImage from "js/pq_games/canvas/helpers/splitImage"
import convertCanvasToImage from "js/pq_games/canvas/helpers/convertCanvasToImage"
import PDF from "../pdf/main"
import PdfBuilder from "../pdf/pdfBuilder"
import Settings from "./settings"
// @ts-ignore
import { Game, CANVAS, WEBGL, Scale } from "../phaser.esm"

interface PhaserLinkParams
{
	scene:any,
	key?:string,
	renderer?:string
}

class PhaserClass
{
	phaserGame = null
	gameConfig : Record<string, any>
	pdfBuilder : PdfBuilder
	generationClass : any
	generationKey = "boardGeneration"
	renderer = "canvas"

	collection = false

	getPhaserContainer() : HTMLElement
	{
		return document.getElementById('phaser-container');
	}

	getConfig() : Record<string, any>
	{
		return this.gameConfig
	}
	
	setGenerationClass(obj:any)
	{
		this.generationClass = obj;
	}

	linkTo(params:PhaserLinkParams)
	{
		this.setGenerationClass(params.scene);
		Settings.initBoard(true);
		this.generationKey = params.key ?? "boardGeneration";
		this.renderer = params.renderer ?? "canvas";
	}

	onGenerationStart()
	{
		const btn : HTMLButtonElement = Settings.getGenerateBoardButton();
		if(!btn) { return; }
		btn.disabled = true;
		btn.style.opacity = "0.75";
		btn.innerHTML = '...';
	}

	onConversionDone(_scene = null) {
		// if we're building a collection, we don't immediately destroy/finalize after each image
		if(this.collection) { return; }

		this.phaserGame.destroy(true);
		this.pdfBuilder.onConversionDone();
		
		const cont = this.getPhaserContainer();
		if(cont) { cont.scrollIntoView({behavior: "smooth", block: "start"}); }

		const btn : HTMLButtonElement = Settings.getGenerateBoardButton();
		if(!btn) { return; }
		btn.disabled = false;
		btn.style.opacity = "1.0";
		btn.innerHTML = 'Regenerate';
	}

	start(cfg:Record<any,any>) {
		const phaserContainer = this.getPhaserContainer();
		if(!phaserContainer) { return console.error("Can't start Phaser without container."); }

		this.gameConfig = cfg;
		this.createPDFBuilder();

		// @ts-ignore
		const generationClass = this.generationClass || window.BoardGeneration;
		const renderer = this.renderer == "webgl" ? WEBGL : CANVAS;

		phaserContainer.innerHTML = '';
		var phaserConfig = {
			type: renderer,
			width: cfg.size.width,
			height: cfg.size.height,
			scale: {
				mode: Scale.FIT,
			},

			backgroundColor: cfg.bgColor || '#FFFFFF',
			parent: 'phaser-container',
			scene: [generationClass],
		}

		const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
		const scrollTop = window.scrollY || document.documentElement.scrollTop;

		this.phaserGame = new Game(phaserConfig);
		this.phaserGame.scene.start(this.generationKey, cfg);

		// @ts-ignore
		window.GAME = this.phaserGame; 

		this.onGenerationStart();

		// @NOTE: for some stupid fucking reason Phaser decides to add height=100% to body and html
		// so I need to immediately overwrite it, otherwise we jump to the top of the page
		// giving all the visitors a stroke (and generally a bad experience)
		document.documentElement.style.height = "";
		document.body.style.height = "";
		window.scrollTo(scrollLeft, scrollTop);
	}

	async convertCanvasToImage(scene:any) {
		if(!this.pdfBuilder) { console.error("Can't convert canvas to image. No PDF builder!"); return; }

		const phaserContainer = this.getPhaserContainer();
		phaserContainer.style.overflow = "visible";
		
		const canv = phaserContainer.firstChild as HTMLCanvasElement;

		// must wait a bit to ensure Phaser canvas is actually redrawn
		await new Promise((resolve, reject) => setTimeout(resolve, 100));

		// convert (this depends on renderer used)
		let img;
		if(this.renderer == "webgl")
		{
			img = await new Promise((resolve, reject) => {
				scene.renderer.snapshot(image =>
				{
					resolve(image);
				});
			})
		} else if(this.renderer == "canvas") {
			img = await convertCanvasToImage(canv) as HTMLImageElement;
		}

		// split if necessary, add to pdfBuilder
		const splitConfig = { split: this.gameConfig.splitBoard, cols: 2, rows: 2 }; // @TODO: should actually listen to input on cols/rows!
		const images = await splitImage(img, splitConfig);

		for(let i = 0; i < images.length; i++)
		{
			this.pdfBuilder.addImage(images[i]);
			phaserContainer.appendChild(images[i]);
		}

		// repeat the draw, but calling a different visualization function ("createSecretBoard")
		// @NOTE: hide the secret board after creating it
		if(this.gameConfig.secretBoard) {
			if(!scene.createdSecretBoard) { scene.createSecretBoard(); return; } 
			img.style.display = 'none'; 
		} 

		this.onConversionDone(scene);
	}

	createPDFBuilder()
	{
		if(this.pdfBuilder) { this.pdfBuilder.destroy(); }

		this.pdfBuilder = new PdfBuilder(this.gameConfig);
		this.gameConfig.size = this.pdfBuilder.getPageSize();
		this.pdfBuilder.connectConfig(this.gameConfig);
		this.pdfBuilder.connectButton(PDF.getCreatePDFButton());
		this.pdfBuilder.onGenerationStart();
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

export default new PhaserClass();