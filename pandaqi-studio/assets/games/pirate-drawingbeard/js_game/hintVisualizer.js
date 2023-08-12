import Config from "./config"
import Map from "./map"
import { TEXTURES } from "./dictionary"

export default {

	size: { "w": 256, "h": 256 },
	targetNumImages: 0,
	images: [],
	finished: false,
	download: false,
	callback: null,
	textures: {},

	prepare()
	{
		// we hijack the fact we already loaded all textures for the phaser game (to use them here)
		for(let i = 0; i < TEXTURES.length; i++)
		{
			var key = TEXTURES[i]; // @IMPROV: fill this array using Phaser, now I need to do it manually and that's stupid
			var img = window.GAME.scene.keys.generation.textures.get(key).getSourceImage();
			this.textures[key] = img;

			var key_inkfriendly = key + "_inkfriendly"
			img = window.GAME.scene.keys.generation.textures.get(key_inkfriendly).getSourceImage();
			this.textures[key_inkfriendly] = img;
		}
	},

	visualizeAll(list, callback)
	{
		this.callback = callback;
		this.finished = false;
		this.targetNumImages = list.length;
		this.images = [];
		
		for(let i = 0; i < list.length; i++)
		{
			this.visualize(list[i]);
		}
	},

	visualize(hint)
	{
		let canvas = this.createCanvas();
		this.paintCanvas(hint, canvas);
		this.convertCanvasIntoImage(hint, canvas);
	},

	createCanvas()
	{
		let canvas = document.createElement("canvas");
		canvas.width = this.size.w;
		canvas.height = this.size.h;
		return canvas;
	},

	// @TODO: currently assumes all source spritesheets are also 8 wide + 256x256 pixels => just roll with that?
	paintCanvas(hint, canvas)
	{
		if(!("layers" in hint)) { return; }

		var layers = structuredClone(hint.layers);

		// hints can stay colored if we're fully digital, even if we're on ink friendly
		var inkFriendly = Config.inkFriendly && (Config.createPremadeGame || Config.useRealMaterial)

		// shuffle layers around if needed
		// (when we find one, with 50% chance, find another shuffle layer and swap)
		for(let i = 0; i < layers.length; i++)
		{
			if(!("shuffle" in layers[i])) { continue; }
			if(Math.random() <= 0.5) { continue; }

			for(let j = 0; j < layers.length; j++) {
				if(i == j) { continue; }
				if(!("shuffle" in layers[j])) { continue; }

				var oldIndex = layers[i].index;
				layers[i].index = layers[j].index;
				layers[j].index = oldIndex;
			}
		}

		// cut off layers if requested
		// (based on one of the values, it removes all layers after that number)
		if("layerCutoff" in hint)
		{
			var offset = 0;
			if("offset" in hint.layerCutoff) { offset = hint.layerCutoff.offset; }
			var cutoffPoint = hint.values[hint.layerCutoff.index] + offset;
			layers.splice(cutoffPoint);
		}

		// add the red "NOT cross" dynamically when needed
		// by default, it's centred and 50% size, but hints can override that with a "notCross" property
		if(hint.negated && !this.download)
		{
			var notKey = "hint_tile_type";
			var notCrossData = { "type": "texture", "key": notKey, "frame": 8, "scale": 0.5 };
			if("notCrossData" in hint) {
				for(key in hint.notCrossData) {
					notCrossData[key] = hint.notCrossData[key];
				}
			}

			layers.push(notCrossData);
		}

		// now we can just go through all layers and display them!
		const ctx = canvas.getContext('2d');
		for(let i = 0; i < layers.length; i++)
		{
			var layer = layers[i];

			if(layer.type == "texture")
			{
				// get the right frame (either fixed or dynamically from the hint values)
				var key = layer.key;
				if(inkFriendly) { key += "_inkfriendly"; }

				var tex = this.textures[key];
				var frame = 0;
				if("frame" in layer) { frame = layer.frame; }
				if("list" in layer) { 
					var dynVal = hint.values[layer.index];
					frame = layer.list[dynVal].frame;
				}

				var xFrame = frame % 8;
				var yFrame = Math.floor(frame / 8.0);

				// get the right position (defaults to center, always in percentages of full size, 0-1)
				var xPos = 0.5, yPos = 0.5
				if("x" in layer) { xPos = layer.x; }
				if("y" in layer) { yPos = layer.y; }

				var scale = 1.0;
				if("scale" in layer) { scale = layer.scale}

				var position = { 
					"x": xPos * this.size.w - 0.5*scale*this.size.w, 
					"y": yPos * this.size.h - 0.5*scale*this.size.h 
				}

				var rotation = 0;
				if("rotation" in layer) { rotation = layer.rotation; }
				if("rotationIndex" in layer) { rotation = hint.values[layer.rotationIndex]; }

				var transformCanvas = (rotation != 0);
				if(transformCanvas)
				{
					ctx.save();
					ctx.translate(position.x+0.5*scale*this.size.w, position.y+0.5*scale*this.size.h);
					ctx.rotate(rotation * 0.5 * Math.PI);

					// compensate for the changed origin
					position.x = -0.5*scale*this.size.w;
					position.y = -0.5*scale*this.size.h;
				}

				// place image precisely according to frame data and position
				// @parameters => drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
				ctx.drawImage(
					tex, 
					xFrame * this.size.w, yFrame * this.size.h, this.size.w, this.size.h,
					position.x, position.y, this.size.w*scale, this.size.h*scale
				);

				if(transformCanvas)
				{
					ctx.restore();
				}
			
			} 
			else if(layer.type == "grid")
			{
				// @TODO: add possibility of NOT highlighting a specific thing
				// @TODO: add custom colors to highlighting
				// (@TODO: add a background to row/column hints, just a different color, or merely an outline?)

				var highlightValue = hint.values[layer.highlight.index];

				var rectSize = Math.min(Math.floor(256.0/Map.width), Math.floor(256.0/Map.height));
				var offset = { "x": 0.5 * (256.0 - Map.width*rectSize), "y": 0.5*(256.0 - Map.height*rectSize) }
				var inset = 0.1*rectSize

				for(let i = 0; i < Map.mapList.length; i++)
				{
					var cell = Map.mapList[i];
					var highlight = false;

					if(layer.highlight.type == "row") {
						highlight = (cell.row == highlightValue)
					} else if(layer.highlight.type == "column") {
						highlight = (cell.column == highlightValue);
					}

					// @TODO: generalize with much neater code
					ctx.fillStyle = "#BDA36B";
					if(inkFriendly) { ctx.fillStyle = "#484848";}
					if(highlight) { ctx.fillStyle = "#FFD479"; }
					if(highlight && inkFriendly) { ctx.fillStyle = "#A0A0A0"; }

					ctx.fillRect(offset.x + cell.x * rectSize + inset, offset.y + cell.y * rectSize + inset, rectSize - 2*inset, rectSize - 2*inset);
				}

				// draw hook so we know where the top left is
				var hookScale = rectSize;
				ctx.drawImage(
					this.textures.hint_tile_type, 
					3*256, 1*256, 256, 256,
					offset.x, offset.y-rectSize, hookScale, hookScale
				);
			}
		}
	},

	convertCanvasIntoImage(hint, canvas)
	{
		let image = new Image();
  		image.src = canvas.toDataURL();

  		var ths = this;
  		image.addEventListener('load', function() {
			ths.images.push(image);
			hint.image = image;

			image.setAttribute('outputName', hint.id + '.png');

			if(Config.debugging)
			{
				document.getElementById('debugging').appendChild(image);
			}

			if(ths.images.length >= ths.targetNumImages) 
			{
				ths.finishVisualization();
			}
		});
	},

	finishVisualization()
	{
		this.finished = true;
		this.callback();
	},

};