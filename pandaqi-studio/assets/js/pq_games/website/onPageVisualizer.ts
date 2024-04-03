import splitImage from "js/pq_games/layout/canvas/splitImage"
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage"
import PdfBuilder from "../pdf/pdfBuilder"
import Settings from "./settings"
// @ts-ignore
import { Game, CANVAS, WEBGL, Scale } from "../phaser/phaser.esm"
import Point from "../tools/geometry/point"
import createCanvas from "../layout/canvas/createCanvas"

interface LinkParams
{
	scene:any,
	key?:string,
	renderer?:string,
	backend?:string // phaser or raw
}

interface CanvasToImageParams
{
	splitDims?: Point|string
}

class OnPageVisualizerClass
{
	phaserGame = null
	canvas: HTMLCanvasElement

	gameConfig : Record<string, any>
	pdfBuilder : PdfBuilder
	generationClass : any
	generationKey = "boardGeneration"
	renderer = "canvas"
	backend = "phaser"
	collection = false

	getcontainer() : HTMLElement
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

	linkTo(params:LinkParams)
	{
		this.setGenerationClass(params.scene);
		Settings.initBoard(true);
		this.generationKey = params.key ?? "boardGeneration";
		this.renderer = params.renderer ?? "canvas";
		this.backend = params.backend ?? "phaser";
	}

	onGenerationStart()
	{
		const btn : HTMLButtonElement = Settings.getGenerateBoardButton();
		if(!btn) { return; }
		btn.disabled = true;
		btn.style.opacity = "0.75";
		btn.innerHTML = '...';
	}

	onConversionDone(_scene = null) 
	{
		// if we're building a collection, we don't immediately destroy/finalize after each image
		if(this.collection) { return; }

		if(this.phaserGame) { this.phaserGame.destroy(true); }
		this.pdfBuilder.onConversionDone();
		
		const cont = this.getcontainer();
		if(cont) { cont.scrollIntoView({behavior: "smooth", block: "start"}); }

		const btn : HTMLButtonElement = Settings.getGenerateBoardButton();
		if(!btn) { return; }
		btn.disabled = false;
		btn.style.opacity = "1.0";
		btn.innerHTML = 'Regenerate';
	}

	start(cfg:Record<any,any>) 
	{
		const container = this.getcontainer();
		if(!container) { return console.error("Can't start Phaser without container."); }

		this.gameConfig = cfg;
		this.createPDFBuilder(cfg); // this sets gameConfig.size to PDF size => find cleaner syntax for that

		container.innerHTML = '';

		if(this.backend == "phaser")
		{
			// @ts-ignore
			const generationClass = this.generationClass ?? window.BoardGeneration;
			const renderer = this.renderer == "webgl" ? WEBGL : CANVAS;

			var phaserConfig = {
				type: renderer,
				width: cfg.size.x,
				height: cfg.size.y,
				scale: {
					mode: Scale.FIT,
				},

				backgroundColor: cfg.bgColor || '#FFFFFF',
				parent: 'phaser-container',
				scene: [generationClass],
			}

			const scrollLeft = window.scrollX ?? document.documentElement.scrollLeft;
			const scrollTop = window.scrollY ?? document.documentElement.scrollTop;

			this.phaserGame = new Game(phaserConfig);
			this.phaserGame.scene.start(this.generationKey, cfg);

			// @ts-ignore
			window.GAME = this.phaserGame; 

			// @NOTE: for some stupid fucking reason Phaser decides to add height=100% to body and html
			// so I need to immediately overwrite it, otherwise we jump to the top of the page
			// giving all the visitors a stroke (and generally a bad experience)
			document.documentElement.style.height = "";
			document.body.style.height = "";
			window.scrollTo(scrollLeft, scrollTop);
		}
		else if(this.backend == "raw")
		{
			const canvas = createCanvas({ size: cfg.size, alpha: false });
			// container.appendChild(canvas); => not necessary
			this.canvas = canvas;
			cfg.canvas = canvas;

			setTimeout(() => {
				this.generationClass.create(cfg);
			}, 33);	
		}

		this.onGenerationStart();
	}

	async convertCanvasToImage(scene:any, params:CanvasToImageParams = {}) 
	{
		if(!this.pdfBuilder) { console.error("Can't convert canvas to image. No PDF builder!"); return; }

		const container = this.getcontainer();
		container.style.overflow = "visible";
		
		let img;
		if(this.backend == "phaser")
		{
			const canv = container.firstChild as HTMLCanvasElement;

			// must wait a bit to ensure Phaser canvas is actually redrawn
			await new Promise((resolve, reject) => setTimeout(resolve, 100));
	
			// convert (this depends on renderer used)
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
		}
		else if(this.backend == "raw")
		{
			img = await convertCanvasToImage(this.canvas);
		}

		// split if necessary, add to pdfBuilder
		const splitConfig = { splitDims: this.pdfBuilder.splitDims }
		const images = await splitImage(img, splitConfig);

		for(let i = 0; i < images.length; i++)
		{
			this.pdfBuilder.addImage(images[i]);
			container.appendChild(images[i]);
		}

		// repeat the draw, but calling a different visualization function ("createSecretBoard")
		// @NOTE: hide the secret board after creating it
		if(this.gameConfig.secretBoard) {
			if(!scene.createdSecretBoard) { await scene.createSecretBoard(); return; } 
			img.style.display = 'none'; 
		} 

		this.onConversionDone(scene);
	}

	createPDFBuilder(cfg = this.gameConfig)
	{
		if(this.pdfBuilder) { this.pdfBuilder.destroy(); }

		this.pdfBuilder = new PdfBuilder(cfg);
		cfg.size = this.pdfBuilder.getFullSize();
		this.pdfBuilder.connectConfig(cfg);
		this.pdfBuilder.connectButton(Settings.getCreatePDFButton());
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

export default new OnPageVisualizerClass();