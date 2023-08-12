import Color from "js/pq_games/canvas/color"
import ResourceLoader from "js/pq_games/canvas/resourceLoader"
import GridMapper from "js/pq_games/canvas/gridMapper"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder"
import Canvas from "js/pq_games/canvas/main"

const baseAssetDir = '/thats-amorphe/assets/'
const pageLayoutDims = { x: 3, y: 4 };
const textColors = ["#283500", "#002B2F", "#130031", "#3C0000"];
const teamColors = [new Color(0,100,35), new Color(121, 100, 23), new Color(217,100,33)];
const borderColor = "#000000";
const borderWidth = 20;
const numberFontSize = 80;

const morphCardColors = [
	new Color(0, 0, 17), new Color(83, 100, 17), new Color(126, 100, 17),
	new Color(166, 100, 17), new Color(201, 100, 17), new Color(228, 100, 17),
	new Color(268, 100, 17), new Color(293, 100, 17), new Color(329, 100, 17),
	new Color(8, 100, 17), new Color(0, 0, 67)
]

const ICONS = { 
	name_this: { frame: 0, prob: 4 },
	reveal: { frame: 1, prob: 4 },
	rotate: { frame: 2, prob: 4 },
	bonus: { frame: 3, prob: 4 },
	duomorph: { frame: 4, prob: 2 },
	morph_this: { frame: 5, prob: 3 },
	verbinator: { frame: 6, prob: 3 },
	reverse_morph: { frame: 7, prob: 3 },
	skip: { frame: 8, prob: 1 },
	glue: { frame: 9, prob: 2 }
}

const ICONS_SPECIAL = {
	multinumber: { frame: 0, prob: 4 },
	riser: { frame: 1, prob: 2 },
	hand_word: { frame: 2, prob: 1 },
	score_penalty: { frame: 3, prob: 1.5 },
	same_letter: { frame: 4, prob: 2 },
	same_num_letters: { frame: 5, prob: 1 },
	inverted_score: { frame: 6, prob: 1.5 },
	face_up: { frame: 7, prob: 2 }
}

const ICONS_PICTURES = {
	add_line: { frame: 0, prob: 4 },
	add_line_self: { frame: 0, prob: 3 },
	bonus: { frame: 2, prob: 2 },
	reveal_unused: { frame: 3, prob: 2 },
	morph_this: { frame: 4, prob: 1.5, resize: 0.775 },
	morph_this_self: { frame: 5, prob: 1.5, resize: 0.775 },
	skip: { frame: 6, prob: 1 },
	actions_free: { frame: 7, prob: 1.5, resize: 0.7 },
	blind_morph: { frame: 8, prob: 3 }
}

function getRandomTypeData(dict)
{
	let totalProb = 0;
	for(const key in dict)
	{
		totalProb += dict[key].prob || 1;
	}

	let rand = Math.random();
	let sum = 0;
	let icons = Object.keys(dict);
	let counter = -1;
	while(sum < rand)
	{
		counter += 1;

		const fraction = dict[icons[counter]].prob / totalProb;
		sum += fraction;
	}

	return dict[icons[counter]];
}

async function createSpecialMorphCards(params)
{
	const ink = params.userConfig.inkFriendly;

	const resLoader = new ResourceLoader();
	resLoader.planLoad("icons_special", { path: baseAssetDir + "icons_special.webp", frames: { x: 8, y: 1 }, inkfriendly: ink }); 
	resLoader.planLoad("bubbly_cloud", { path: baseAssetDir +  "bubbly_cloud.webp" });
	await resLoader.loadPlannedResources();

	const config = { orientation: "portrait" };
	const pdfBuilder = new PdfBuilder(config);

	const gridConfig = { pdfBuilder: pdfBuilder, dims: pageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);
	const cardSize = gridMapper.getMaxElementSizeAsSquare();

	const bubblyOffset = { x: 20, y: 40 } // y twice x
	const bubblySize = { width: 256+128, height: 256+128 }

	for(let i = 0; i < 12; i++)
	{
		const ctx = Canvas.createNewContext(cardSize);
		const randNum = Math.floor(Math.random()*8) + 1;
		let secondRandNum = Math.floor(Math.random()*8) + 1;
		if(Math.abs(secondRandNum - randNum) < 2) { 
			secondRandNum = ((secondRandNum + 3) % 8) + 1;
		}

		let baseColor = morphCardColors[randNum]
		let contrastColor = baseColor.lighten(60).toString();

		// bg
		ctx.fillStyle = baseColor.toString();
		ctx.fillRect(0, 0, cardSize.width, cardSize.height);

		// cloudy symbols
		ctx.globalAlpha = 0.2;
		
		let cloudyData = resLoader.getResource("bubbly_cloud");

		ctx.drawImage(
			cloudyData, 
			bubblyOffset.x - 0.5*bubblySize.width, bubblyOffset.y - 0.5*bubblySize.height, 
			bubblySize.width, bubblySize.height
		)
		
		ctx.drawImage(
			cloudyData, 
			cardSize.width - bubblyOffset.x - 0.5*bubblySize.width - 4, cardSize.height - bubblyOffset.y - 0.5*bubblySize.height - 4, 
			bubblySize.width, bubblySize.height)
		
		ctx.globalAlpha = 1.0;

		// special icon
		const centerBubblySize = { width: 0.5*bubblySize.width, height: 0.5*bubblySize.height };
		ctx.drawImage(
			cloudyData,
			0.5*cardSize.width - 0.5*centerBubblySize.width, 0.5*cardSize.height - 0.5*centerBubblySize.height,
			centerBubblySize.width, centerBubblySize.height
		)

		const iconKey = params.userConfig.inkFriendly ? "icons_special_inkfriendly" : "icons_special";
		const iconData = getRandomTypeData(ICONS_SPECIAL);
		const resize = iconData.resize || 1.0;
		const iconParams = {
			id: iconKey, 
			frame: iconData.frame, 
			pos: { x: 0.5*cardSize.width, y: 0.5*cardSize.width }, 
			size: { width: 0.55*centerBubblySize.width*resize, height: 0.55*centerBubblySize.height*resize } 
		}

		Canvas.addResourceToContext(ctx, resLoader, iconParams);

		// numbers
		ctx.fillStyle = contrastColor
		ctx.font = numberFontSize + "px Ribeye";

		let numberText = randNum + "+";
		let numberOffset = { x: 75, y: 90 + 0.5*numberFontSize }
		let textParams = { 
			x: numberOffset.x, 
			y: numberOffset.y, 
			width: 0.25*cardSize.width, 
			lineHeight: 0.8*numberFontSize, 
			centerX: true, centerY: true 
		}
		Canvas.addWrappedTextToContext(ctx, numberText, textParams);

		let secondNumberText = numberText;
		const isDualNumber = (iconFrame == 0 || iconFrame == 7);
		if(isDualNumber) { secondNumberText = secondRandNum + "+"; }

		textParams.x = cardSize.width - numberOffset.x
		textParams.y = cardSize.height - 30
		Canvas.addWrappedTextToContext(ctx, secondNumberText, textParams);

		// thick border
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(0, 0, cardSize.width, cardSize.height);
		gridMapper.addElement(ctx.canvas);
	}

	const images = await Canvas.convertCanvasesToImage(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	const pdfConfig = { customFileName: "[That's Amorphe] Special Cards" }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function createMorphCards(params)
{
	const resLoader = new ResourceLoader();
	resLoader.planLoad("bubbly_cloud", { path: baseAssetDir + "bubbly_cloud.webp" });
	await resLoader.loadPlannedResources();

	const config = { orientation: "portrait" };
	const pdfBuilder = new PdfBuilder(config);

	const gridConfig = { pdfBuilder: pdfBuilder, dims: pageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);
	const cardSize = gridMapper.getMaxElementSizeAsSquare();

	const bubblyOffset = { x: 20, y: 40 } // y twice x
	const bubblySize = { width: 256, height: 256 }
	
	const arrowBaseSize = 320;

	for(let i = 0; i <= 10; i++)
	{
		const ctx = Canvas.createNewContext(cardSize);
		const invert = (i == 10);
		
		let contrastColor = morphCardColors[i].lighten(60).toString();
		if(invert) { contrastColor = morphCardColors[i].lighten(-48).toString(); }

		// bg
		ctx.fillStyle = morphCardColors[i].toString();
		ctx.fillRect(0, 0, cardSize.width, cardSize.height);

		// cloudy symbols
		ctx.globalAlpha = 0.2;
		
		let cloudyData = resLoader.getResource("bubbly_cloud");
		if(invert) { cloudyData = Canvas.tintResource(resLoader, { id: "bubbly_cloud", color: "#000000" })}

		ctx.drawImage(
			cloudyData, 
			bubblyOffset.x - 0.5*bubblySize.width, bubblyOffset.y - 0.5*bubblySize.height, 
			bubblySize.width, bubblySize.height
		)
		
		ctx.drawImage(
			cloudyData, 
			cardSize.width - bubblyOffset.x - 0.5*bubblySize.width - 4, cardSize.height - bubblyOffset.y - 0.5*bubblySize.height - 4, 
			bubblySize.width, bubblySize.height)
		
		ctx.globalAlpha = 1.0;

		// numbers
		ctx.fillStyle = contrastColor
		const numberSize = (i <= 9) ? numberFontSize : 0.67*numberFontSize;
		ctx.font = numberSize + "px Ribeye";

		let numberOffset = { x: 50, y: 60 + 0.5*numberSize }
		let textParams = { x: numberOffset.x, y: numberOffset.y, width: 0.25*cardSize.width, lineHeight: 0.8*numberSize, centerX: true, centerY: true }
		Canvas.addWrappedTextToContext(ctx, i, textParams);

		textParams.x = cardSize.width - numberOffset.x
		textParams.y = cardSize.height - 30
		Canvas.addWrappedTextToContext(ctx, i, textParams);

		// arrows
		ctx.fillStyle = contrastColor
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		const arrowSize = (i <= 5) ? arrowBaseSize : 0.75*arrowBaseSize;
		ctx.font = arrowSize + "px Ribeye";

		const offsetBetweenX = 0.2*arrowSize;
		const offsetBetweenY = 0.66*arrowSize;
		const rows = Math.ceil(i/5);
		const totalOffsetY = 0.5*(rows-1) * offsetBetweenY - 0.125*arrowSize;
		
		let arrowsLeft = i;
		for(let r = 0; r < rows; r++)
		{
			const arrowsInRow = Math.min(arrowsLeft, 5);
			const totalOffsetX = 0.5*(arrowsInRow-1) * offsetBetweenX; // just for optical centering
			
			for(let a = 0; a < arrowsInRow ; a++)
			{
				const x = (0.5*cardSize.width - totalOffsetX)  + a*offsetBetweenX;
				const y = (0.5*cardSize.height - totalOffsetY) + r*offsetBetweenY;
				ctx.fillText(">", x, y);
			}
			arrowsLeft -= 5;
		}

		if(i == 0)
		{
			ctx.fillText("|", 0.5*cardSize.width, 0.5*cardSize.height+0.125*arrowSize);
		}
		

		// thick border
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(0, 0, cardSize.width, cardSize.height);

		gridMapper.addElement(ctx.canvas);
	}

	const images = await Canvas.convertCanvasesToImage(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	const pdfConfig = { customFileName: "[That's Amorphe] Morph Cards" }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function createVoteCards(params)
{
	const config = { orientation: "portrait" };
	const pdfBuilder = new PdfBuilder(config);

	const customPageLayoutDims = { x: 5, y: 6 }
	const gridConfig = { pdfBuilder: pdfBuilder, dims: customPageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);

	const cardSize = gridMapper.getMaxElementSizeAsSquare();
	const scale = params.voteNumberScale || 1.0;
	const baseFontSize = 0.5*cardSize.width*scale;
	const strokeWidth = 0.025*baseFontSize;

	const numberX = 0.5*cardSize.width;
	const numberY = 0.5*cardSize.height + 0.075*baseFontSize; // @NOTE: some weird visual offset error somewhere? this compensates

	const resLoader = new ResourceLoader();
	resLoader.planLoad("guess_sign", { path: baseAssetDir +  "guess_sign.webp" });

	await resLoader.loadPlannedResources();
	
	const patternData = resLoader.getResource("guess_sign");
	const patternOffset = { x: 0.5*cardSize.width, y: 0.5*cardSize.height };
	const patternSize = { width: 0.5*cardSize.width*scale, height: 0.5*cardSize.height*scale };
	const teamNameOffset = { x: 0.05*cardSize.width, y: 0.05*cardSize.height };

	const edgeMargin = 0.05*cardSize.width;
	const symbolSize = params.voteSymbolScale * cardSize.width;
	const edges = [
		{ x: edgeMargin, y: edgeMargin },
		{ x: cardSize.width - edgeMargin - symbolSize, y: edgeMargin },
		{ x: cardSize.width - edgeMargin - symbolSize, y: cardSize.height - edgeMargin - symbolSize },
		{ x: edgeMargin, y: cardSize.height - edgeMargin - symbolSize }
	]

	const teamNames = ['RED', 'GREEN', 'BLUE'];
	const symbolShapes = ['circle', 'square', 'triangle'];

	for(let c = 0; c < teamColors.length; c++)
	{
		const teamColor = teamColors[c];
		const teamName = teamNames[c];

		for(let i = 1; i <= 9; i++)
		{
			const numberText = i + "";
			const ctx = Canvas.createNewContext(cardSize);

			// solid bg color
			ctx.fillStyle = teamColor.toString();
			ctx.fillRect(0, 0, cardSize.width, cardSize.height);

			// default border (that's around all cards)
			ctx.strokeStyle = borderColor;
			ctx.lineWidth = borderWidth;
			ctx.strokeRect(0, 0, cardSize.width, cardSize.height);

			// symbols on edges
			if(params.addVoteSymbolsAtEdges)
			{
				const symbol = symbolShapes[c];
				ctx.fillStyle = "rgba(255,255,255,0.66)";

				for(let e = 0; e < 4; e++)
				{
					const edge = edges[e];
					
					if(symbol == "circle") {
						ctx.beginPath();
						ctx.arc(edge.x + 0.5*symbolSize, edge.y + 0.5*symbolSize, 0.5*symbolSize, 0, 2 * Math.PI, false);
						ctx.fill();
					} else if(symbol == "square") {
						ctx.fillRect(edge.x, edge.y, symbolSize, symbolSize)
					} else if(symbol == "triangle") {
						const path = new Path2D();
						path.moveTo(edge.x + 0.5*symbolSize, edge.y);
						path.lineTo(edge.x + symbolSize, edge.y + symbolSize);
						path.lineTo(edge.x, edge.y + symbolSize);
						ctx.fill(path);
					}
				}
			} else {
				// text (for colorblind/inkfriendly situations) that tells the color
				ctx.font = 0.1*baseFontSize + "px Ribeye";
				ctx.textAlign = "start";
				ctx.textBaseline = "top";
				ctx.fillStyle = "rgba(255,255,255,0.8)";
				ctx.fillText(teamName, teamNameOffset.x, teamNameOffset.y);
			}

			// some icons/pattern to make the cards a little less basic
			ctx.globalAlpha = 0.33;
			ctx.drawImage(
				patternData, 
				patternOffset.x - 0.5*patternSize.width, patternOffset.y - 0.5*patternSize.height, 
				patternSize.width, patternSize.height
			)
			ctx.globalAlpha = 1.0;

			// big number
			ctx.font = baseFontSize + "px Ribeye";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.shadowColor = "#000000";
			ctx.shadowBlur = strokeWidth * 2;

			ctx.fillStyle = teamColor.lighten(20).toString();
			ctx.fillText(numberText, numberX, numberY);
			
			ctx.strokeStyle = "#FFFFFF";
			ctx.lineWidth = strokeWidth;
			ctx.strokeText(numberText, numberX, numberY)

			gridMapper.addElement(ctx.canvas);
		}
	}

	const images = await Canvas.convertCanvasesToImage(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	let fileName = "[That's Amorphe; pictures] Vote Cards";
	const pdfConfig = { customFileName: fileName }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function createWordCards(params)
{
	const config = { orientation: "portrait" };
	const pdfBuilder = new PdfBuilder(config);

	const gridConfig = { pdfBuilder: pdfBuilder, dims: pageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);

	// Categories are a "multi checkbox" => an object with all keys and then false/true behind them
	// so collect only the true entries
	let categories = [];
	for(const key in params.userConfig.categories)
	{
		if(!params.userConfig.categories[key]) { continue; }
		categories.push(key);
	}

	let useAllCategories = params.userConfig.useAllCategories;
	if(categories.length <= 0)
	{
		categories = undefined;
		useAllCategories = true;
	}

	const queryMethod = params.debugging ? "txt" : "json";
	const types = ["nouns"];
	if(params.userConfig.includeGeography) { types.push("geography"); }
	if(params.userConfig.includeNames) { types.push("names"); }

	const wordParams = {
		method: queryMethod,
		types: types,
		levels: [params.userConfig.wordComplexity],
		categories: categories,
		useAllSubcat: true,
		useAllCategories: useAllCategories,
		useAllLevelsBelow: true
	}

	await PQ_WORDS.loadWithParams(wordParams);
	
	const wordsPerCard = 4;
	const cardsPerPage = gridConfig.dims.x * gridConfig.dims.y;
	const numPages = 4;
	const numWordsNeeded = wordsPerCard * cardsPerPage * numPages; 
	const wordList = PQ_WORDS.getRandomMultiple(numWordsNeeded, true);

	const cardSize = gridMapper.getMaxElementSizeAsSquare();
	const wordOffsetFromCenter = 0.38; // 0.5 means text is exactly on the edge
	const numberOffsetFromCenter = 0.265;
	const baseFontSize = cardSize.width*0.175;

	const addActions = params.userConfig.addActions;
	const ink = params.userConfig.inkFriendly;

	const addNumbersToWords = (params.expansion == "pictures");

	let iconProbability = 0.75;
	if(params.expansion == "pictures") { iconProbability =  0.85; }

	let actionIconsKey = "icons";
	let actionDictionary = ICONS;
	if(params.expansion == "pictures") { 
		actionIconsKey = "icons_pictures"; 
		actionDictionary = ICONS_PICTURES; 
	}

	const resLoader = new ResourceLoader();
	resLoader.planLoad("bg", { path: baseAssetDir + "background_word_card.webp", inkfriendly: ink });
	if(addActions) 
	{ 
		resLoader.planLoad(actionIconsKey, { path: baseAssetDir + actionIconsKey + ".webp", frames: { x: 10, y: 1 } }); 
	}
	
	await resLoader.loadPlannedResources();
	
	while(wordList.length > 0)
	{
		const ctx = Canvas.createNewContext(cardSize);
		ctx.fillStyle = "#DDDDDD";
		ctx.fillRect(0, 0, cardSize.width, cardSize.height);

		const bgKey = params.userConfig.inkFriendly ? "bg_inkfriendly" : "bg";
		ctx.drawImage(resLoader.getResource(bgKey), 0, 0, cardSize.width, cardSize.height);

		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(0, 0, cardSize.width, cardSize.height);

		let tempWordsPerCard = wordsPerCard;
		if(config.varyWordCount) { tempWordsPerCard = Math.floor(Math.random() * (wordsPerCard-1)) + 1; }
		
		// add action icon in the middle
		const placeIcon = Math.random() <= iconProbability && addActions;
		if(placeIcon)
		{
			let iconKey = actionIconsKey;

			const iconData = getRandomTypeData(actionDictionary);
			const resize = iconData.resize || 1.0;
			const iconParams = {
				id: iconKey, 
				frame: iconData.frame, 
				pos: { x: 0.5*cardSize.width, y: 0.5*cardSize.width }, 
				size: { width: 0.3*cardSize.width*resize, height: 0.3*cardSize.width*resize } 
			}

			const reminderPos = structuredClone(iconParams.pos);
			reminderPos.y += 0.5*iconParams.size.height*(1.0 / resize);
	
			Canvas.addResourceToContext(ctx, resLoader, iconParams);

			// add reminder of the "-1 penalty" rule
			ctx.textAlign = "center";
			ctx.font = (baseFontSize * 0.2) + "px Ribeye";
			ctx.fillStyle = "#000000";
			ctx.globalAlpha = 0.5;
			ctx.fillText("-1", reminderPos.x, reminderPos.y);
			ctx.globalAlpha = 1.0;
		}

		
		// add the actual words
		
		// @NOTE: The extremes (1 and 9) are half as likely as any other number
		// This is _on purpose_, as these numbers are most boring for this game
		const morphNumbers = [2,3,4,6,7,8];
		if(Math.random() <= 0.725) { morphNumbers.push(5); }
		if(Math.random() <= 0.5) { morphNumbers.push(1); morphNumbers.push(9); }

		for(let i = 0; i < tempWordsPerCard; i++)
		{
			if(wordList.length <= 0) { break; }

			const wordData = wordList.pop();

			const angle = i * 0.5 * Math.PI;
			const x = (0.5 + wordOffsetFromCenter*Math.cos(angle))*cardSize.width;
			const y = (0.5 + wordOffsetFromCenter*Math.sin(angle))*cardSize.height;

			const visualAngle = angle-0.5*Math.PI;

			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(visualAngle);

			let fontSize = baseFontSize - (baseFontSize*0.3)*(wordData.getWord().length/7);
			fontSize = Math.max(fontSize, 0.4*baseFontSize);
			const textParams = { x: 0, y: 0, width: 0.75*cardSize.width, lineHeight: 1.5*fontSize, height: 1.5*fontSize, centerY: true, centerX: true }

			// draw number above it (if enabled)
			ctx.font = (baseFontSize * 0.5) + "px Ribeye";
			ctx.fillStyle = textColors[i];
			
			if(addNumbersToWords)
			{
				const randIndex = Math.floor(Math.random() * morphNumbers.length);
				const number = morphNumbers.splice(randIndex, 1);
				const numberText = number + "";

				const numberX = textParams.x;
				const numberY = textParams.y - wordOffsetFromCenter*cardSize.width + numberOffsetFromCenter*cardSize.width;

				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				if(params.addCircleBehindNumber)
				{
					const radius = 0.37*baseFontSize;
					ctx.beginPath();
					ctx.arc(numberX, numberY, radius, 0, 2 * Math.PI, false);
					ctx.fillStyle = 'rgba(255,255,255,0.4)';
					if(i == 0 || i == 1) { ctx.fillStyle = 'rgba(255,255,255,0.66)'; }
					ctx.fill();
				} else {
					const strokeWidth = 0.125*baseFontSize;
					ctx.strokeStyle = "rgba(0,0,0,0.5)";
					ctx.lineWidth = strokeWidth;
					ctx.strokeText(numberText, numberX, numberY)
	
					ctx.strokeStyle = "#FFFFFF";
					ctx.lineWidth = 0.5*strokeWidth;
					ctx.strokeText(numberText, numberX, numberY)
				}

				ctx.fillStyle = textColors[i];
				if(ink) { ctx.fillStyle = "#000000"; }

				ctx.fillText(numberText, numberX, numberY);
			}

			// draw the main word (big, rotated, center edge)
			ctx.fillStyle = textColors[i];
			if(ink) { ctx.fillStyle = "#000000"; }

			ctx.font = fontSize + "px Ribeye";
			Canvas.addWrappedTextToContext(ctx, wordData.getWord(), textParams);
			
			// draw the subcategory above it (more faded and smaller)
			const addSubCatText = !addNumbersToWords
			const subcatText = wordData.getMetadata().getCategory();
			if(addSubCatText)
			{
				ctx.font = (fontSize * 0.44) + "px Ribeye";
				ctx.globalAlpha = 0.6;
				ctx.fillText(subcatText, textParams.x, textParams.y - 0.7*fontSize);
				ctx.globalAlpha = 1.0;
			}

			ctx.restore();
		}

		gridMapper.addElement(ctx.canvas);
	}

	const images = await Canvas.convertCanvasesToImage(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	let fileName = "[That's Amorphe"
	if(params.expansion) { fileName += "; " + params.expansion; }
	fileName += "] Word Cards";

	const pdfConfig = { customFileName: fileName }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function startAmorpheGenerator(params)
{
	const fontURL = baseAssetDir + "ribeye_regular.woff2";
	const fontFile = new FontFace
	(
		"Ribeye",
		"url(" + fontURL + ")"
	);
	document.fonts.add(fontFile);

	await fontFile.load();

	const feedbackHeading = document.getElementById("feedback");
	feedbackHeading.innerHTML = "Generating ... ";

	params.userConfig = JSON.parse(window.localStorage[params.config]);
	console.log(params.userConfig);

	const visualParams = {
		addCircleBehindNumber: true,
		voteNumberScale: 1.66,
		addVoteSymbolsAtEdges: true,
		voteSymbolScale: 0.066, // percentage of card width
	}

	Object.assign(params, visualParams);

	const what = params.what || "words";
	if(what == "words") { await createWordCards(params); }
	else if(what == "morph") { await createMorphCards(params); }
	else if(what == "special") { await createSpecialMorphCards(params); }
	else if(what == "vote") { await createVoteCards(params); }

	feedbackHeading.innerHTML = "Done!";
}

window.startAmorpheGenerator = startAmorpheGenerator;

