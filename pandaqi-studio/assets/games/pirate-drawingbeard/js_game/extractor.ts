import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import HintVisualizer from "./hintVisualizer"
import Hints from "./hints"
import Map from "./map"
import JSZip from "./jszip.min.js"

export default {

	isCaching: false,
	images: [],

	isGeneratingPDF: false,
	pdfImages: [],
	scaleFactor: 3.8,
	pdfSize: {},

	externalCallback: null,

	extractImagesFromPhaser(list, cache, callback)
	{
		let canvas = document.getElementById('phaser-container').firstChild as HTMLCanvasElement;

		let counter = 0;
		let timeout = 50;
    	let interval;

    	let stillBusy = false;
    	let isDone = false;

    	let cacheSingleImage = function()
    	{
    		if(stillBusy) { return; }

    		// first we save the image we generated previously
			let img = new Image();
			img.src = canvas.toDataURL();
			stillBusy = true;

			let key = list[counter].key;
			img.addEventListener('load', function() {
				Map.cachedImages[key] = img;
				cache.push(img);
				stillBusy = false;
				if(isDone) { callback(); }
			});

			// then we move onward and ask Phaser to generate the image we want next
    		counter += 1;
    		if(counter >= list.length) 
    		{
    			clearInterval(interval); 
    			isDone = true;
    			return;
    		}

    		let data = list[counter];
    		if(data.function != null) { data.function(); }
    		
    	}

    	interval = setInterval(cacheSingleImage.bind(this), timeout);

    	if(list[0].function != null) { list[0].function(); }
	},

	/* CACHE PHASER Map (for displaying in interface) */
	cacheImages(callback)
	{
		this.isCaching = true;
		this.externalCallback = callback;

		let imgs = [
			// @ts-ignore
			{ "key": "fullMap", "function": window.GAME.scene.keys.generation.visualize.bind(window.GAME.scene.keys.generation) }, 
			// @ts-ignore
			{ "key": "solutionMap", "function": window.GAME.scene.keys.generation.visualizeTreasure.bind(window.GAME.scene.keys.generation) }
		]

		this.extractImagesFromPhaser(imgs, this.images, this.onCacheFinished.bind(this));
	},

	onCacheFinished()
	{
		this.isCaching = false;
		if(this.externalCallback != null) {
			this.externalCallback();
		}
	},

	/* EXTRACT ALL hints AS ZIP (for me, for rulebook editing) */
	downloadHintsZip()
	{
		HintVisualizer.download = true;
		HintVisualizer.visualizeAll(Hints.createFullListForDownload(), this.onZipImagesReady.bind(this));
	},

	onZipImagesReady()
	{
		// @ts-ignore
		let zip = new JSZip();
		let images = HintVisualizer.images;
		
		for(let i = 0; i < images.length; i++)
		{
			let img = images[i];
			let imgData = img.src;
			imgData = imgData.substr(22);
			imgData = atob(imgData);
			zip.file(img.getAttribute('outputName'), imgData, {binary: true});
		}

		zip.generateAsync({type:"blob"}).then(function(content) {
			// @ts-ignore
		    saveAs(content, "Drawingbeard Images.zip");
		    this.onZipDone();
		}.bind(this));
	},

	onZipDone()
	{
		// nothing?
	},

	/* SAVE THE GAME AS PREMADE PDF */
	calculatePDFSize()
	{
		this.pdfSize = { 'width': 297*this.scaleFactor, 'height': 210*this.scaleFactor }
		return this.pdfSize;
	},

	createPremadeGame(callback)
	{
		this.isGeneratingPDF = true;
		this.externalCallback = callback;

		this.pdfImages.push(Map.cachedImages.fullMap);

		let imgs = [
			// @ts-ignore
			{ "key": "hintCards", "function": window.GAME.scene.keys.generation.visualizeHintCards.bind(window.GAME.scene.keys.generation) }
		];

		this.extractImagesFromPhaser(imgs, this.pdfImages, this.onPDFDone.bind(this));
	},

	onPDFDone()
	{
		this.turnIntoPDF(this.pdfImages);
	},

	turnIntoPDF(pdfImages:HTMLImageElement[])
	{
		const pdfBuilder = new PdfBuilder({ orientation: PageOrientation.LANDSCAPE });
		for(const img of pdfImages)
		{
			pdfBuilder.addImage(img);
		}

		const pdfParams = { customFileName: "[Pirate Drawingbeard] Premade Game" };
		pdfBuilder.downloadPDF(pdfParams);

	    if(this.externalCallback != null) { this.externalCallback(); }
	},

};