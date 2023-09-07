import canvasTxt from "./canvasText"
import Point from "../tools/geometry/point"

export default {
	createNew(params = {})
	{
		const canvas = document.createElement('canvas');
		canvas.width = 512;
		canvas.height = 512;
		Object.assign(canvas, params);
		return canvas;
	},

	createNewContext(params = {})
	{
		const contextParams = { 
			willReadFrequently: true,
			alpha: true,
		};
		Object.assign(contextParams, params);
		return this.createNew(params).getContext("2d", contextParams);
	},

	addTextToContext(context, params = {})
	{
		const text = params.text || "?";
		const pos = params.pos || new Point().fromXY(0, 0);
		const fontFamily = params.fontFamily || "Dosis";
		const fontSize = params.fontSize || 16;
		const alpha = params.alpha || 1;
		const color = params.color || "#000000";
		const align = params.align || "center"; // left, center, right
		const verticalAlign = params.alignVertical || "top"; // top, middle, bottom
		const maxWidth = params.maxWidth || 10000;
		const maxHeight = params.maxHeight || 10000;

		context.save();
		context.translate(pos.x, pos.y);
		context.globalAlpha = alpha;
		context.fillStyle = color;
		//context.textAlign = align;
		//context.font = fontSize + "px '" + fontFamily + "'"
		//context.fillText(text, 0, 0);

		canvasTxt.fontSize = fontSize;
		canvasTxt.font = fontFamily;
		canvasTxt.align = align;
		canvasTxt.vAlign = verticalAlign;
		canvasTxt.drawText(context, text, 0, 0, maxWidth, maxHeight)

		context.restore();
	},

	addResourceToContext(context, resLoader, params = {})
	{
		const id = params.id || ""; // @TODO: create a "default/debug resource" to load if we can't find something => do so as a DATA URL?
		const frameData = resLoader.getFrame(id, params.frame || 0);
		const pos = params.pos || { x: 0, y: 0 };
		const size = params.size || { width: context.canvas.width, height: context.canvas.height };
		const anchor = params.anchor || { x: 0.5, y: 0.5 };
		const rotation = params.rotation || 0;
		const alpha = params.alpha || 1; 
		const scale = params.scale || { x: 1, y: 1 };
		if(params.flipX) { scale.x *= -1; }
		if(params.flipY) { scale.y *= -1; }

		const offsetX = -anchor.x * size.width;
		const offsetY = -anchor.y * size.height;

		context.save();
		context.translate(pos.x, pos.y);
		context.globalAlpha = alpha;
		context.rotate(rotation);
		context.scale(scale.x, scale.y);

		let res = resLoader.getResource(id);
		if(params.tint) { res = this.tintResource(resLoader, { id: id, color: params.tint }); }
		if(params.dropShadow)
		{
			const shadowParams = { id: id }
			Object.assign(shadowParams, params.dropShadow)
			res = this.dropShadowResource(resLoader, shadowParams);
		}

		context.drawImage(
			res, 
			frameData.x, frameData.y, frameData.width, frameData.height,
			offsetX, offsetY, size.width, size.height
		);

		context.restore();
	},

	applyPaths(ctx, params)
	{
		if(params.color) 
		{ 
			ctx.fillStyle = params.color;
			ctx.fill();
		}

		if(params.stroke)
		{
			ctx.strokeStyle = params.stroke;
			ctx.lineWidth = params.strokeWidth || 1;
			ctx.stroke();
		}
	},

	drawLine(ctx, params)
	{
		params.points = params.points || [];

		ctx.beginPath();
		for(const p of params.points)
		{
			ctx.lineTo(p.x, p.y);
		}
		this.applyPaths(ctx, params);
	},

	drawCircle(ctx, params)
	{
		params.pos = params.pos || { x: 0, y: 0 };
		params.radius = params.radius || 10;

		ctx.beginPath();
		ctx.arc(params.pos.x, params.pos.y, params.radius, 0, 2*Math.PI, false);
		this.applyPaths(ctx, params);
	},

	drawRectangle(ctx, params)
	{
		params.pos = params.pos || { x: 0, y: 0 };
		params.extents = params.extents || { x: 10, y: 10 };

		const center = new Point(params.pos);

		const points = [
			center.clone().add( new Point().fromXY(-1,-1).scale(params.extents).scaleFactor(0.5) ),
			center.clone().add( new Point().fromXY(1,-1).scale(params.extents).scaleFactor(0.5) ),
			center.clone().add( new Point().fromXY(1,1).scale(params.extents).scaleFactor(0.5) ),
			center.clone().add( new Point().fromXY(-1,1).scale(params.extents).scaleFactor(0.5) )
		]

		params.points = points;
		this.drawPolygon(ctx, params);
	},

	drawPolygon(ctx, params)
	{
		params.points = params.points || [];

		ctx.beginPath();
		for(const p of params.points)
		{
			ctx.lineTo(p.x, p.y);
		}
		ctx.closePath();
		this.applyPaths(ctx, params);
	},

	rotateAndApply(context, x, y, rot, callback)
	{
		context.save();
		context.translate(x, y);
		context.rotate(rot);

		callback();

		context.restore();
	},

	dropShadowResource(resLoader, params = {})
	{
		const id = params.id || "";
		const size = resLoader.getResourceSize(id);

		const color = params.color || "#000000";
		const offset = params.offset || { x: 0, y: 0 };
		const blurRadius = params.blur || 12;

		const contextParams = { width: size.width, height: size.height, alpha: true }
		let ctx = this.createNewContext(contextParams);
		ctx.filter = "drop-shadow(" + offset.x + "px " + offset.y + "px " + blurRadius + "px " + color + ")"
		ctx.drawImage(resLoader.getResource(id), 0, 0);
		return ctx.canvas;
	},

	tintResource(resLoader, params = {})
	{
		const id = params.id || "";
		const color = params.color || "#FF0000";
		const size = resLoader.getResourceSize(id);
		
		// first, we get a mask just with the tint color
		const contextParams = { width: size.width, height: size.height, alpha: true }
		let ctx = this.createNewContext(contextParams);
		ctx.drawImage(resLoader.getResource(id), 0, 0);
		ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, contextParams.width, contextParams.height);

		// then we multiply that mask with the original image to do an actual, proper tinting
		let ctx2 = this.createNewContext(contextParams);
		ctx2.drawImage(resLoader.getResource(id), 0, 0);
		ctx2.globalCompositeOperation = "multiply";
		ctx2.drawImage(ctx.canvas, 0, 0);
		return ctx2.canvas;
	},

	addBackground(context, color)
	{
		context.fillStyle = color;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	},

	addOutline(context, color, width)
	{
		context.strokeStyle = color;
		context.lineWidth = width;
		context.strokeRect(0, 0, context.canvas.width, context.canvas.height);
	},

	// @SOURCE: https://codepen.io/peterhry/pen/nbMaYg
	// Modified to allow centering and other stuff
	// @TODO: might want to allow more values for centerX/centerY (start, center, end, etcetera)
	addWrappedTextToContext(context, text, params = {}) 
	{
		text = text + "";

		let x = params.x || 0;
		let y = params.y || 0;
		const width = params.width || 512;
		const height = params.height || -1;
		const lineHeight = params.lineHeight || 20;
		const centerX = params.centerX;
		const centerY = params.centerY;

		if(centerX) { context.textAlign = "center"; }
		if(centerY) { context.textBaseline = "middle"; }

		var words = text.split(' '),
			line = '',
			i,
			test,
			metrics;
		
		let plannedLines = [];
	
		for (i = 0; i < words.length; i++) {
			
			// check the next word
			// if it is too long _on its own_, keep shortening it until it fits
			test = words[i];
			metrics = context.measureText(test);
			while (metrics.width > width) {
				test = test.substring(0, test.length - 1);
				metrics = context.measureText(test);
			}

			// if split, insert the second part to be evaluated after us (next iteration of loop)
			const wordWasSplit = (words[i] != test);
			if (wordWasSplit) {
				words.splice(i + 1, 0,  words[i].substr(test.length))
				words[i] = test;
			}  
	
			// now test the current line + the next word
			test = line + words[i] + ' ';  
			metrics = context.measureText(test);

			// it's too long? save our current line (it's finished)
			// start the next one with this overflowing word
			const needNewLine = metrics.width > width && i > 0;
			if (needNewLine) {
				plannedLines.push({ x: x, y: y, text: line.trim() });
				line = words[i] + ' ';
				y += lineHeight;
				continue;
			}
			
			// otherwise, update the line to have that added word
			line = test;
		}

		// the last line hasn't been saved yet (as that only happens when a new line is triggered); do that now
		plannedLines.push({ x: x, y: y, text: line.trim() });

		// calculate how large it ends up being
		let lastLineMetrics = context.measureText(line);
		let blockDimensions = { 
			width: (plannedLines.length <= 1) ? lastLineMetrics.width : width, 
			height: plannedLines.length * lineHeight
		};

		let realLineHeight = lastLineMetrics.actualBoundingBoxAscent + lastLineMetrics.actualBoundingBoxDescent;
		let emptyVerticalSpace = 0.5*(height - blockDimensions.height);
		// if(height <= 0) { emptyVerticalSpace = -0.5*realLineHeight; } => doesn't work with baseLine=middle, and that's better

		// actually place all planned lines (with correct positioning)
		for(const line of plannedLines)
		{
			//if(centerX) { line.x += 0.5*block; }
			if(centerY) { line.y += emptyVerticalSpace; }
			context.fillText(line.text, line.x, line.y);
		}

		return plannedLines;
	},

	async splitImage(img, params = {})
	{
		if(!params.split) { return [img]; }

		const cols = params.cols || 2;
		const rows = params.rows || 2; 
		const totalParts = cols * rows;
		const promises = [];

		for(var i = 0; i < totalParts; i++) {
			var x = i % cols;
			var y = Math.floor(i / cols);

			let canv = document.createElement('canvas');
			canv.width = img.naturalWidth;
			canv.height = img.naturalHeight;

			const chunkX = canv.width / cols;
			const chunkY = canv.height / rows;

			// MAGIC HAPPENS HERE => this slices part of the image and draws it onto the canvas
			canv.getContext('2d').drawImage(
				img, 
				x*chunkX, y*chunkY, chunkX, chunkY, 
				0, 0, canv.width, canv.height
			)

			const loadPromise = new Promise((resolve, reject) => 
			{
				const tempImg = new Image();
				tempImg.src = canv.toDataURL();
				tempImg.style.maxWidth = '100%'
				tempImg.onload = () => {
					resolve(tempImg);
				}
			})

			promises.push(loadPromise);
		}

		const arr = await Promise.all(promises);
		return arr;
	},

	convertCanvasToImage(canvas)
	{
		let image = new Image();
		image.src = canvas.toDataURL();

		return new Promise((resolve, reject) => {
			image.onload = function() {
				resolve(image);
			};
		})
	},

	async convertCanvasesToImage(canvases)
	{
		const promises = [];
		for(const canv of canvases)
		{
			promises.push(this.convertCanvasToImage(canv));
		}
		const values = await Promise.all(promises);
		return values;
	},
}