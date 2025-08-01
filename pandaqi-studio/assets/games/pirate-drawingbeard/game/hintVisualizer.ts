import { CONFIG } from "./config"
import Map from "./map"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";
import Point from "js/pq_games/tools/geometry/point";

class HintVisualizer
{
	size = new Point(256)
	images = []
	download = false

	async visualizeAll(list, vis:BoardVisualizer)
	{
		this.images = [];
		for(let i = 0; i < list.length; i++)
		{
			this.images.push( await this.visualize(list[i], vis));
		}
	}

	async visualize(hint, vis:BoardVisualizer)
	{
		const canvas = this.createCanvas();
		this.paintCanvas(hint, canvas, vis);
		const img = await this.convertCanvasToImage(hint, canvas);	

		// @TODO/@NOTE: This is a bit meh, but it's clean enough and I don't expect many changes to this API
		const id = CONFIG.getImageIDFromHint(hint);
		await vis.resLoader.cacheLoadedImage(id, {}, img);
		vis.resLoader.getResource(id).setUniqueKey(id);

		return img;
	}

	createCanvas()
	{
		let canvas = document.createElement("canvas");
		canvas.width = this.size.x;
		canvas.height = this.size.y;
		return canvas;
	}

	// @TODO: currently assumes all source spritesheets are also 8 wide + 256x256 pixels => just roll with that?
	paintCanvas(hint, canvas, vis:BoardVisualizer)
	{
		if(!("layers" in hint)) { return; }

		let layers = structuredClone(hint.layers);

		// hints can stay colored if we're fully digital, even if we're on ink friendly
		let inkFriendly = CONFIG.inkFriendly && (CONFIG.createPremadeGame || CONFIG.useRealMaterial)

		// shuffle layers around if needed
		// (when we find one, with 50% chance, find another shuffle layer and swap)
		for(let i = 0; i < layers.length; i++)
		{
			if(!("shuffle" in layers[i])) { continue; }
			if(Math.random() <= 0.5) { continue; }

			for(let j = 0; j < layers.length; j++) {
				if(i == j) { continue; }
				if(!("shuffle" in layers[j])) { continue; }

				let oldIndex = layers[i].index;
				layers[i].index = layers[j].index;
				layers[j].index = oldIndex;
			}
		}

		// cut off layers if requested
		// (based on one of the values, it removes all layers after that number)
		if("layerCutoff" in hint)
		{
			let offset = 0;
			if("offset" in hint.layerCutoff) { offset = hint.layerCutoff.offset; }
			let cutoffPoint = hint.values[hint.layerCutoff.index] + offset;
			layers.splice(cutoffPoint);
		}

		// add the red "NOT cross" dynamically when needed
		// by default, it's centred and 50% size, but hints can override that with a "notCross" property
		if(hint.negated && !this.download)
		{
			let notKey = "hint_tile_type";
			let notCrossData = { "type": "texture", "key": notKey, "frame": 8, "scale": 0.5 };
			if("notCrossData" in hint) {
				for(const key in hint.notCrossData) {
					notCrossData[key] = hint.notCrossData[key];
				}
			}

			layers.push(notCrossData);
		}

		// now we can just go through all layers and display them!
		const ctx = canvas.getContext('2d');
		for(let i = 0; i < layers.length; i++)
		{
			let layer = layers[i];

			if(layer.type == "texture")
			{
				// get the right frame (either fixed or dynamically from the hint values)
				let key = layer.key;
				if(inkFriendly) { key += "_inkfriendly"; }

				let tex = vis.getResource(key).img;
				let frame = 0;
				if("frame" in layer) { frame = layer.frame; }
				if("list" in layer) { 
					let dynVal = hint.values[layer.index];
					frame = layer.list[dynVal].frame;
				}

				let xFrame = frame % 8;
				let yFrame = Math.floor(frame / 8.0);

				// get the right position (defaults to center, always in percentages of full size, 0-1)
				let xPos = 0.5, yPos = 0.5
				if("x" in layer) { xPos = layer.x; }
				if("y" in layer) { yPos = layer.y; }

				let scale = 1.0;
				if("scale" in layer) { scale = layer.scale}

				let position = { 
					"x": xPos * this.size.x - 0.5*scale*this.size.x, 
					"y": yPos * this.size.y - 0.5*scale*this.size.y 
				}

				let rotation = 0;
				if("rotation" in layer) { rotation = layer.rotation; }
				if("rotationIndex" in layer) { rotation = hint.values[layer.rotationIndex]; }

				let transformCanvas = (rotation != 0);
				if(transformCanvas)
				{
					ctx.save();
					ctx.translate(position.x+0.5*scale*this.size.x, position.y+0.5*scale*this.size.y);
					ctx.rotate(rotation * 0.5 * Math.PI);

					// compensate for the changed origin
					position.x = -0.5*scale*this.size.x;
					position.y = -0.5*scale*this.size.y;
				}

				// place image precisely according to frame data and position
				// @parameters => drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
				ctx.drawImage(
					tex, 
					xFrame * this.size.x, yFrame * this.size.y, this.size.x, this.size.y,
					position.x, position.y, this.size.x*scale, this.size.y*scale
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

				let highlightValue = hint.values[layer.highlight.index];

				let rectSize = Math.min(Math.floor(256.0/Map.width), Math.floor(256.0/Map.height));
				let offset = { "x": 0.5 * (256.0 - Map.width*rectSize), "y": 0.5*(256.0 - Map.height*rectSize) }
				let inset = 0.1*rectSize

				for(let i = 0; i < Map.mapList.length; i++)
				{
					let cell = Map.mapList[i];
					let highlight = false;

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
				let hookScale = rectSize;
				ctx.drawImage(
					vis.getResource("hint_tile_type").img, 
					3*256, 1*256, 256, 256,
					offset.x, offset.y-rectSize, hookScale, hookScale
				);
			}
		}
	}

	async convertCanvasToImage(hint, canvas)
	{
		let image = new Image();
  		image.src = canvas.toDataURL();
		image.setAttribute('outputName', hint.id + '.png');
		await image.decode();
		hint.image = image;
	
		if(CONFIG.debugging)
		{
			document.getElementById('debugging').appendChild(image);
		}
		return image;
	}

};

export default new HintVisualizer();