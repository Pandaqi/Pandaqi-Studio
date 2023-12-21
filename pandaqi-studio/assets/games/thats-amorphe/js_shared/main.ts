import Color from "js/pq_games/layout/color/color"
import GridMapper from "js/pq_games/layout/gridMapper"
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import { ICONS, ICONS_SPECIAL, ICONS_PICTURES } from "./dict"
import createContext from "js/pq_games/layout/canvas/createContext"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import PandaqiWords from "js/pq_words/main"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import TintEffect from "js/pq_games/layout/effects/tintEffect"
import Point from "js/pq_games/tools/geometry/point"
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import ColorLike from "js/pq_games/layout/color/colorLike"

const baseAssetDir = '/thats-amorphe/assets/'
const pageLayoutDims = new Point(3, 4);
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

	const resLoader = new ResourceLoader({ base: baseAssetDir });
	resLoader.planLoad("icons_special", { path: "icons_special.webp", frames: new Point(8,1), inkfriendly: ink }); 
	resLoader.planLoad("bubbly_cloud", { path: "bubbly_cloud.webp" });
	await resLoader.loadPlannedResources();

	const config = { orientation: PageOrientation.PORTRAIT };
	const pdfBuilder = new PdfBuilder(config);

	const gridConfig = { pdfBuilder: pdfBuilder, dims: pageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);
	const cardSize = gridMapper.getMaxElementSizeAsSquare();

	const bubblyOffset = { x: 20, y: 40 } // y twice x
	const bubblySize = new Point(256 + 128, 256 + 128);

	for(let i = 0; i < 12; i++)
	{
		const ctx = createContext({ size: cardSize });
		const randNum = Math.floor(Math.random()*8) + 1;
		let secondRandNum = Math.floor(Math.random()*8) + 1;
		if(Math.abs(secondRandNum - randNum) < 2) { 
			secondRandNum = ((secondRandNum + 3) % 8) + 1;
		}

		let baseColor = morphCardColors[randNum]
		let contrastColor = baseColor.lighten(60).toString();

		// bg
		ctx.fillStyle = baseColor.toString();
		ctx.fillRect(0, 0, cardSize.x, cardSize.y);

		// cloudy symbols
		ctx.globalAlpha = 0.2;
		
		let cloudyData = resLoader.getResource("bubbly_cloud") as ResourceImage;

		ctx.drawImage(
			cloudyData.img, 
			bubblyOffset.x - 0.5*bubblySize.x, bubblyOffset.y - 0.5*bubblySize.y, 
			bubblySize.x, bubblySize.y
		)
		
		ctx.drawImage(
			cloudyData.img, 
			cardSize.x - bubblyOffset.x - 0.5*bubblySize.x - 4, cardSize.y - bubblyOffset.y - 0.5*bubblySize.y - 4, 
			bubblySize.x, bubblySize.y)
		
		ctx.globalAlpha = 1.0;

		// special icon
		const centerBubblySize = bubblySize.clone().scaleFactor(0.5);
		ctx.drawImage(
			cloudyData.img,
			0.5*cardSize.x - 0.5*centerBubblySize.x, 0.5*cardSize.y - 0.5*centerBubblySize.y,
			centerBubblySize.x, centerBubblySize.y
		)

		const iconKey = params.userConfig.inkFriendly ? "icons_special_inkfriendly" : "icons_special";
		const iconData = getRandomTypeData(ICONS_SPECIAL);
		const resize = iconData.resize || 1.0;
		const iconParams = {
			frame: iconData.frame, 
			translate: new Point(0.5*cardSize.x, 0.5*cardSize.x), 
			dims: new Point(0.55*centerBubblySize.x*resize, 0.55*centerBubblySize.y*resize),
			pivot: new Point(0.5)
		}

		const iconResource = resLoader.getResource(iconKey) as ResourceImage;
		const canvOp = new LayoutOperation(iconParams);
		await iconResource.toCanvas(ctx, canvOp);

		// numbers
		const textConfig = new TextConfig({
			font: "Ribeye",
			size: numberFontSize,
			lineHeight: 0.8,
			alignHorizontal: TextAlign.MIDDLE,
			alignVertical: TextAlign.MIDDLE
		})

		let numberOffset = new Point(75, 90 + 0.5*numberFontSize); // @TODO: might be incorrect after TextDrawer switch
		const textOp = new LayoutOperation({
			translate: numberOffset,
			dims: new Point(0.25*cardSize.x, numberFontSize*2),
			fill: contrastColor,
			pivot: Point.CENTER
		});
		const numberText = randNum + "+";
		const textRes = new ResourceText({ text: numberText, textConfig: textConfig });
		await textRes.toCanvas(ctx, textOp);

		let secondNumberText = numberText;
		const isDualNumber = (iconData.frame == 0 || iconData.frame == 7);
		if(isDualNumber) { secondNumberText = secondRandNum + "+"; }

		textRes.text = secondNumberText;
		textOp.translate = new Point(cardSize.x - numberOffset.x, cardSize.y - 30);
		await textRes.toCanvas(ctx)

		// thick border
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(0, 0, cardSize.x, cardSize.y);
		gridMapper.addElement(ctx.canvas);
	}

	const images = await convertCanvasToImageMultiple(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	const pdfConfig = { customFileName: "[That's Amorphe] Special Cards" }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function createMorphCards(params)
{
	const resLoader = new ResourceLoader({ base: baseAssetDir });
	resLoader.planLoad("bubbly_cloud", { path: "bubbly_cloud.webp" });
	await resLoader.loadPlannedResources();

	const config = { orientation: PageOrientation.PORTRAIT };
	const pdfBuilder = new PdfBuilder(config);

	const gridConfig = { pdfBuilder: pdfBuilder, dims: pageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);
	const cardSize = gridMapper.getMaxElementSizeAsSquare();

	const bubblyOffset = { x: 20, y: 40 } // y twice x
	const bubblySize = new Point(256, 256);
	
	const arrowBaseSize = 320;

	for(let i = 0; i <= 10; i++)
	{
		const ctx = createContext({ size: cardSize });
		const invert = (i == 10);
		
		let contrastColor = morphCardColors[i].lighten(60).toString();
		if(invert) { contrastColor = morphCardColors[i].lighten(-48).toString(); }

		// bg
		ctx.fillStyle = morphCardColors[i].toString();
		ctx.fillRect(0, 0, cardSize.x, cardSize.y);

		// cloudy symbols
		ctx.globalAlpha = 0.2;
		
		let cloudyData = resLoader.getResource("bubbly_cloud") as ResourceImage;
		if(invert) {
			const eff = new TintEffect({ color: "#000000" });
			await eff.applyToImage(cloudyData);
		}

		ctx.drawImage(
			cloudyData.img, 
			bubblyOffset.x - 0.5*bubblySize.x, bubblyOffset.y - 0.5*bubblySize.y, 
			bubblySize.x, bubblySize.y
		)
		
		ctx.drawImage(
			cloudyData.img, 
			cardSize.x - bubblyOffset.x - 0.5*bubblySize.x - 4, cardSize.y - bubblyOffset.y - 0.5*bubblySize.y - 4, 
			bubblySize.x, bubblySize.y)
		
		ctx.globalAlpha = 1.0;

		// numbers
		const numberSize = (i <= 9) ? numberFontSize : 0.67*numberFontSize;
		const textConfig = new TextConfig({
			font: "Ribeye",
			size: numberSize,
			lineHeight: 0.8,
			alignHorizontal: TextAlign.MIDDLE,
			alignVertical: TextAlign.MIDDLE,
		})

		const textOp = new LayoutOperation({
			translate: new Point(50, 60 + 0.5 * numberSize), // @TODO: might be incorrect after TextDrawer switch
			dims: new Point(0.25*cardSize.x, numberSize*2),
			fill: contrastColor,
			pivot: Point.CENTER
		});
		const numberText = i.toString();
		const textRes = new ResourceText({ text: numberText, textConfig: textConfig });
		await textRes.toCanvas(ctx, textOp);

		textOp.translate = new Point(cardSize.x - textOp.translate.x, cardSize.y - 30); // @TODO: might be incorrect after TextDrawer switch
		await textRes.toCanvas(ctx, textOp);

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
				const x = (0.5*cardSize.x - totalOffsetX)  + a*offsetBetweenX;
				const y = (0.5*cardSize.y - totalOffsetY) + r*offsetBetweenY;
				ctx.fillText(">", x, y);
			}
			arrowsLeft -= 5;
		}

		if(i == 0)
		{
			ctx.fillText("|", 0.5*cardSize.x, 0.5*cardSize.y+0.125*arrowSize);
		}
		

		// thick border
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(0, 0, cardSize.x, cardSize.y);

		gridMapper.addElement(ctx.canvas);
	}

	const images = await convertCanvasToImageMultiple(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	const pdfConfig = { customFileName: "[That's Amorphe] Morph Cards" }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function createVoteCards(params)
{
	const config = { orientation: PageOrientation.PORTRAIT };
	const pdfBuilder = new PdfBuilder(config);

	const customPageLayoutDims = new Point(5, 6);
	const gridConfig = { pdfBuilder: pdfBuilder, dims: customPageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);

	const cardSize = gridMapper.getMaxElementSizeAsSquare();
	const scale = params.voteNumberScale || 1.0;
	const baseFontSize = 0.5*cardSize.x*scale;
	const strokeWidth = 0.025*baseFontSize;

	const numberX = 0.5*cardSize.x;
	const numberY = 0.5*cardSize.y + 0.075*baseFontSize; // @NOTE: some weird visual offset error somewhere? this compensates

	const resLoader = new ResourceLoader({ base: baseAssetDir });
	resLoader.planLoad("guess_sign", { path: "guess_sign.webp" });

	await resLoader.loadPlannedResources();
	
	const patternData = resLoader.getResource("guess_sign") as ResourceImage;
	const patternOffset = new Point(0.5*cardSize.x, 0.5*cardSize.y);
	const patternSize = new Point(0.5*cardSize.x*scale, 0.5*cardSize.y*scale);
	const teamNameOffset = new Point(0.05*cardSize.x, 0.05*cardSize.y);

	const edgeMargin = 0.05*cardSize.x;
	const symbolSize = params.voteSymbolScale * cardSize.x;
	const edges = [
		{ x: edgeMargin, y: edgeMargin },
		{ x: cardSize.x - edgeMargin - symbolSize, y: edgeMargin },
		{ x: cardSize.x - edgeMargin - symbolSize, y: cardSize.y - edgeMargin - symbolSize },
		{ x: edgeMargin, y: cardSize.y - edgeMargin - symbolSize }
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
			const ctx = createContext({ size: cardSize });

			// solid bg color
			ctx.fillStyle = teamColor.toString();
			ctx.fillRect(0, 0, cardSize.x, cardSize.y);

			// default border (that's around all cards)
			ctx.strokeStyle = borderColor;
			ctx.lineWidth = borderWidth;
			ctx.strokeRect(0, 0, cardSize.x, cardSize.y);

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
				patternData.img, 
				patternOffset.x - 0.5*patternSize.x, patternOffset.y - 0.5*patternSize.y, 
				patternSize.x, patternSize.y
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

	const images = await convertCanvasToImageMultiple(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	let fileName = "[That's Amorphe; pictures] Vote Cards";
	const pdfConfig = { customFileName: fileName }
	pdfBuilder.downloadPDF(pdfConfig);
}

async function createWordCards(params)
{
	const config = { orientation: PageOrientation.PORTRAIT, varyWordCount: false };
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

	const pandaqiWords = new PandaqiWords();

	await pandaqiWords.loadWithParams(wordParams);
	
	const wordsPerCard = 4;
	const cardsPerPage = gridConfig.dims.x * gridConfig.dims.y;
	const numPages = 4;
	const numWordsNeeded = wordsPerCard * cardsPerPage * numPages; 
	const wordList = pandaqiWords.getRandomMultiple(numWordsNeeded, true);

	const cardSize = gridMapper.getMaxElementSizeAsSquare();
	const wordOffsetFromCenter = 0.38; // 0.5 means text is exactly on the edge
	const numberOffsetFromCenter = 0.265;
	const baseFontSize = cardSize.x*0.175;

	const addActions = params.userConfig.addActions;
	const ink = params.userConfig.inkFriendly;

	const addNumbersToWords = (params.expansion == "pictures");

	let iconProbability = 0.75;
	if(params.expansion == "pictures") { iconProbability =  0.85; }

	let actionIconsKey = "icons";
	let actionDictionary : Record<string,any> = ICONS;
	if(params.expansion == "pictures") { 
		actionIconsKey = "icons_pictures"; 
		actionDictionary = ICONS_PICTURES; 
	}

	const resLoader = new ResourceLoader({ base: baseAssetDir });
	resLoader.planLoad("bg", { path: "background_word_card.webp", inkfriendly: ink });
	if(addActions) 
	{ 
		resLoader.planLoad(actionIconsKey, { path: actionIconsKey + ".webp", frames: new Point(10, 1) }); 
	}
	
	await resLoader.loadPlannedResources();

	const createWordCard = async (words) => 
	{
		const ctx = createContext({ size: cardSize });
		ctx.fillStyle = "#DDDDDD";
		ctx.fillRect(0, 0, cardSize.x, cardSize.y);

		const bgKey = params.userConfig.inkFriendly ? "bg_inkfriendly" : "bg";
		const bgResource = resLoader.getResource(bgKey) as ResourceImage;
		ctx.drawImage(bgResource.img, 0, 0, cardSize.x, cardSize.y);

		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(0, 0, cardSize.x, cardSize.y);

		// add action icon in the middle
		const placeIcon = Math.random() <= iconProbability && addActions;
		if(placeIcon)
		{
			let iconKey = actionIconsKey;

			const iconData = getRandomTypeData(actionDictionary);
			const resize = iconData.resize || 1.0;
			const iconParams = {
				frame: iconData.frame, 
				translate: new Point(0.5*cardSize.x, 0.5*cardSize.x), 
				dims: new Point(0.3*cardSize.x*resize, 0.3*cardSize.x*resize),
				pivot: new Point(0.5)
			}

			const reminderPos = iconParams.translate.clone();
			reminderPos.y += 0.5*iconParams.dims.x*(1.0 / resize);

			const iconResource = resLoader.getResource(iconKey) as ResourceImage;
			const canvOp = new LayoutOperation(iconParams);
			await iconResource.toCanvas(ctx, canvOp);
	
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

		const textConfig = new TextConfig({
			font: "Ribeye",
			size: numberFontSize,
			lineHeight: 1.5,
			alignHorizontal: TextAlign.MIDDLE,
			alignVertical: TextAlign.MIDDLE
		})



		const textRes = new ResourceText({ text: "", textConfig: textConfig });

		for(let i = 0; i < words.length; i++)
		{
			const wordData = words[i];

			const angle = i * 0.5 * Math.PI;
			const x = (0.5 + wordOffsetFromCenter*Math.cos(angle))*cardSize.x;
			const y = (0.5 + wordOffsetFromCenter*Math.sin(angle))*cardSize.y;

			const textOp = new LayoutOperation({
				dims: new Point(0.75*cardSize.x, numberFontSize*2),
				pivot: Point.CENTER
			});

			const visualAngle = angle-0.5*Math.PI;

			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(visualAngle);

			let fontSize = baseFontSize - (baseFontSize*0.3)*(wordData.getWord().length/7);
			fontSize = Math.max(fontSize, 0.4*baseFontSize);
			//const textParams = { x: 0, y: 0, width: 0.75*cardSize.x, lineHeight: 1.5*fontSize, height: 1.5*fontSize, centerY: true, centerX: true }

			// draw number above it (if enabled)
			textConfig.size = baseFontSize*0.5;			
			textOp.fill = new ColorLike(textColors[i]);
			
			if(addNumbersToWords)
			{
				const randIndex = Math.floor(Math.random() * morphNumbers.length);
				const number = morphNumbers.splice(randIndex, 1);
				const numberText = number + "";

				const numberPos = new Point(0, -wordOffsetFromCenter*cardSize.x + numberOffsetFromCenter*cardSize.x);
				textOp.translate = numberPos;

				if(params.addCircleBehindNumber)
				{
					const radius = 0.37*baseFontSize;
					ctx.beginPath();
					ctx.arc(numberPos.x, numberPos.y, radius, 0, 2 * Math.PI, false);
					ctx.fillStyle = 'rgba(255,255,255,0.4)';
					if(i == 0 || i == 1) { ctx.fillStyle = 'rgba(255,255,255,0.66)'; }
					ctx.fill();
				} else {
					const strokeWidth = 0.125*baseFontSize;
					textOp.strokeWidth = strokeWidth;
					textOp.stroke = new ColorLike("#FFFFFF");
				}

				textOp.fill = new ColorLike(ink ? "#000000" : textColors[i]);
				await textRes.toCanvas(ctx, textOp);
			}

			// draw the main word (big, rotated, center edge)
			textConfig.size = fontSize;
			textRes.text = wordData.getWord();
			textOp.fill = new ColorLike(ink ? "#000000" : textColors[i]);

			await textRes.toCanvas(ctx, textOp);
			
			// draw the subcategory above it (more faded and smaller)
			const addSubCatText = !addNumbersToWords
			const subcatText = wordData.getMetadata().getCategory();
			if(addSubCatText)
			{
				textConfig.size = fontSize*0.44;
				textOp.alpha = 0.6;
				textRes.text = subcatText;
				textOp.translate = new Point(0, -0.7*fontSize); // @TODO: might also be incorrect after TextDrawer change
				await textRes.toCanvas(ctx, textOp);
			}

			ctx.restore();
		}

		return ctx.canvas;
	}
	
	const promises = [];
	while(wordList.length > 0)
	{
		let tempWordsPerCard = wordsPerCard;
		if(config.varyWordCount) 
		{ 
			tempWordsPerCard = Math.floor(Math.random() * (wordsPerCard-1)) + 1; 
		}
		tempWordsPerCard = Math.min(tempWordsPerCard, wordList.length);

		const words = wordList.splice(0, tempWordsPerCard);
		promises.push(createWordCard(words));
	}
	
	const canvases = await Promise.all(promises);
	for(const canv of canvases)
	{
		gridMapper.addElement(canv);
	}

	const images = await convertCanvasToImageMultiple(gridMapper.getCanvases());
	pdfBuilder.addImages(images);

	let fileName = "[That's Amorphe"
	if(params.expansion) { fileName += "; " + params.expansion; }
	fileName += "] Word Cards";

	const pdfConfig = { customFileName: fileName }
	pdfBuilder.downloadPDF(pdfConfig);
}

export default async function startAmorpheGenerator(params)
{
	const resLoader = new ResourceLoader();
	resLoader.planLoad("ribeye", { key: "Ribeye", path: baseAssetDir + "ribeye_regular.woff2" })
	await resLoader.loadPlannedResources();

	const feedbackHeading = document.getElementById("feedback");
	if(feedbackHeading) { feedbackHeading.innerHTML = "Generating ... "; }

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

	if(feedbackHeading) { feedbackHeading.innerHTML = "Done!"; }
}