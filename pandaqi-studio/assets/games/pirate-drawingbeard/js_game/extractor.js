import HintVisualizer from "./hintVisualizer"
import Hints from "./hints"
import Map from "./map"

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
		var canvas = document.getElementById('phaser-container').firstChild;

		var counter = 0;
		let timeout = 50;
    	let interval;

    	let stillBusy = false;
    	let isDone = false;

    	let cacheSingleImage = function()
    	{
    		if(stillBusy) { return; }

    		// first we save the image we generated previously
			var img = new Image();
			img.src = canvas.toDataURL();
			stillBusy = true;

			var key = list[counter].key;
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

    		var data = list[counter];
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

		var imgs = [
			{ "key": "fullMap", "function": GAME.scene.keys.generation.visualize.bind(GAME.scene.keys.generation) }, 
			{ "key": "solutionMap", "function": GAME.scene.keys.generation.visualizeTreasure.bind(GAME.scene.keys.generation) }
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
		var zip = new JSZip();
		var images = HintVisualizer.images;
		
		for(let i = 0; i < images.length; i++)
		{
			var img = images[i];
			var imgData = img.src;
			imgData = imgData.substr(22);
			imgData = atob(imgData);
			zip.file(img.getAttribute('outputName'), imgData, {binary: true});
		}

		zip.generateAsync({type:"blob"}).then(function(content) {
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

		var imgs = [
			{ "key": "hintCards", "function": GAME.scene.keys.generation.visualizeHintCards.bind(GAME.scene.keys.generation) }
		];

		this.extractImagesFromPhaser(imgs, this.pdfImages, this.onPDFDone.bind(this));
	},

	onPDFDone()
	{
		this.turnIntoPDF(this.pdfImages);
	},

	turnIntoPDF(list)
	{
		var pdfConfig = {
			orientation: "l", // landscape
			unit: 'mm',
			format: [this.pdfSize.width, this.pdfSize.height]
		}
		var doc = new window.jspdf.jsPDF(pdfConfig);
		var width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();
	    for(var i = 0; i < list.length; i++) {
	    	if(i > 0) { doc.addPage(); }
	    	doc.addImage(list[i], 'png', 0, 0, width, height, undefined, 'FAST');
	    }

	    doc.save('[Premade Game] Pirate Drawingbeard');

	    if(this.externalCallback != null)
	    {
	    	this.externalCallback();
	    }
	},

};