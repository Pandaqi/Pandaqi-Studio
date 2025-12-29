import { colorLighten, ColorLike, createContext, LayoutOperation, MaterialVisualizer, ResourceImage, ResourceText, TextAlign, TextConfig, TintEffect, Vector2 } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { ICONS, ICONS_PICTURES, ICONS_SPECIAL, MaterialType } from "../shared/dict";
import { getRandomTypeData } from "./cardPicker";
import { WordData } from "lib/pq-words";

export class Card
{
    type: MaterialType
    number: number;
    teamIndex: number;
    words: WordData[];

    constructor(tp:MaterialType, num = -1)
    {
        this.type = tp;
        this.number = num;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        if(this.type == MaterialType.SPECIAL) { return this.drawSpecial(vis); }
        if(this.type == MaterialType.MORPH) { return this.drawMorph(vis); }
        if(this.type == MaterialType.VOTE) { return this.drawVote(vis); }
        return this.drawWord(vis);
    }

    drawWord(vis:MaterialVisualizer)
    {
        const cardSize = vis.size;
        const wordOffsetFromCenter = 0.38; // 0.5 means text is exactly on the edge
        const numberOffsetFromCenter = 0.265;
        const baseFontSize = cardSize.x*0.175;

        const addActions = CONFIG._settings.addActions.value;
        const ink = vis.inkFriendly;

        const addNumbersToWords = (CONFIG.expansion == "pictures");

        let iconProbability = 0.75;
        if(CONFIG.expansion == "pictures") { iconProbability =  0.85; }

        let actionIconsKey = "icons";
        let actionDictionary : Record<string,any> = ICONS;
        if(CONFIG.expansion == "pictures") 
        { 
            actionIconsKey = "icons_pictures"; 
            actionDictionary = ICONS_PICTURES; 
        }

        const ctx = createContext({ size: cardSize });
        ctx.fillStyle = "#DDDDDD";
        ctx.fillRect(0, 0, cardSize.x, cardSize.y);

        const bgKey = ink ? "bg_inkfriendly" : "bg";
        const bgResource = vis.getResource(bgKey);
        ctx.drawImage(bgResource.img, 0, 0, cardSize.x, cardSize.y);

        // add action icon in the middle
        const placeIcon = Math.random() <= iconProbability && addActions;
        if(placeIcon)
        {
            let iconKey = actionIconsKey;

            const iconData = getRandomTypeData(actionDictionary);
            const resize = iconData.resize || 1.0;
            const iconParams = {
                frame: iconData.frame, 
                pos: new Vector2(0.5*cardSize.x, 0.5*cardSize.x), 
                size: new Vector2(0.3*cardSize.x*resize, 0.3*cardSize.x*resize),
                pivot: new Vector2(0.5)
            }

            const reminderPos = iconParams.pos.clone();
            reminderPos.y += 0.5*iconParams.size.x*(1.0 / resize);

            const iconResource = vis.getResource(iconKey);
            const canvOp = new LayoutOperation(iconParams);
            iconResource.toCanvas(ctx, canvOp);
        }

        
        // add the actual words
        
        // @NOTE: The extremes (1 and 9) are half as likely as any other number
        // This is _on purpose_, as these numbers are most boring for this game
        const morphNumbers = [2,3,4,6,7,8];
        if(Math.random() <= 0.725) { morphNumbers.push(5); }
        if(Math.random() <= 0.5) { morphNumbers.push(1); morphNumbers.push(9); }

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("numberFontSize"),
            lineHeight: 1.5,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const textRes = new ResourceText({ text: "", textConfig: textConfig });

        for(let i = 0; i < this.words.length; i++)
        {
            const wordData = this.words[i];

            const angle = i * 0.5 * Math.PI;
            const center = cardSize.clone().scale(0.5);
            const offset = new Vector2(
                Math.cos(angle),
                Math.sin(angle)
            );
            const basePos = center.clone().add(offset.clone().scale(wordOffsetFromCenter*cardSize.x));
            const visualAngle = angle-0.5*Math.PI;

            const textOp = new LayoutOperation({
                size: new Vector2(0.75*cardSize.x, 2*vis.get("numberFontSize")),
                pivot: Vector2.CENTER,
                pos: basePos,
                rot: visualAngle
            });

            let fontSize = baseFontSize - (baseFontSize*0.3)*(wordData.getWord().length/7);
            fontSize = Math.max(fontSize, 0.4*baseFontSize);
            //const textParams = { x: 0, y: 0, width: 0.75*cardSize.x, lineHeight: 1.5*fontSize, height: 1.5*fontSize, centerY: true, centerX: true }

            // draw number above it (if enabled)
            const textColors = vis.get("textColors");
            textConfig.size = baseFontSize*0.5;			
            textOp.fill = new ColorLike(textColors[i]);
            
            if(addNumbersToWords)
            {
                const randIndex = Math.floor(Math.random() * morphNumbers.length);
                const number = morphNumbers.splice(randIndex, 1);
                const numberText = number + "";

                const numberPos = center.clone().add(offset.clone().scale(numberOffsetFromCenter*cardSize.x));
                textOp.pos = numberPos;
                textRes.text = numberText;

                if(vis.get("addCircleBehindNumber")) {
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
                textRes.toCanvas(ctx, textOp);
            }

            // draw the main word (big, rotated, center edge)
            textConfig.size = fontSize;
            textRes.text = wordData.getWord();
            textOp.fill = new ColorLike(ink ? "#000000" : textColors[i]);
            textOp.pos = basePos;

            textRes.toCanvas(ctx, textOp);
            
            // draw the subcategory above it (more faded and smaller)
            const addSubCatText = !addNumbersToWords
            const subcatText = wordData.getMetadata().getCategory();
            if(addSubCatText)
            {
                textConfig.size = fontSize*0.44;
                textOp.alpha = 0.6;
                textRes.text = subcatText;
                const subCatPos = center.clone().add(offset.clone().scale(wordOffsetFromCenter*cardSize.x-0.7*fontSize));
                textOp.pos = subCatPos;
                textRes.toCanvas(ctx, textOp);
            }
        }

        return ctx.canvas;
    }

    drawVote(vis:MaterialVisualizer)
    {
        const cardSize = vis.size;
        const scale = vis.get("voteNumberScale") ?? 1.0;
        const baseFontSize = 0.5*cardSize.x*scale;
        const strokeWidth = 0.025*baseFontSize;

        const numberX = 0.5*cardSize.x;
        const numberY = 0.5*cardSize.y + 0.075*baseFontSize; // @NOTE: some weird visual offset error somewhere? this compensates
        
        const patternData = vis.getResource("guess_sign");
        const patternOffset = new Vector2(0.5*cardSize.x, 0.5*cardSize.y);
        const patternSize = new Vector2(0.5*cardSize.x*scale, 0.5*cardSize.y*scale);
        const teamNameOffset = new Vector2(0.05*cardSize.x, 0.05*cardSize.y);

        const edgeMargin = 0.05*cardSize.x;
        const symbolSize = vis.get("voteSymbolScale") * cardSize.x;
        const edges = [
            { x: edgeMargin, y: edgeMargin },
            { x: cardSize.x - edgeMargin - symbolSize, y: edgeMargin },
            { x: cardSize.x - edgeMargin - symbolSize, y: cardSize.y - edgeMargin - symbolSize },
            { x: edgeMargin, y: cardSize.y - edgeMargin - symbolSize }
        ]

        const teamNames = ['RED', 'GREEN', 'BLUE'];
        const symbolShapes = ['circle', 'square', 'triangle'];

        const teamColor = vis.get("teamColors")[this.teamIndex];
        const teamName = teamNames[this.teamIndex];
        const i = this.number;
        const numberText = i + "";
        const ctx = createContext({ size: cardSize });

        // solid bg color
        ctx.fillStyle = teamColor.toString();
        ctx.fillRect(0, 0, cardSize.x, cardSize.y);

        // symbols on edges
        if(vis.get("addVoteSymbolsAtEdges"))
        {
            const symbol = symbolShapes[i];
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
            ctx.font = 0.1*baseFontSize + "px " + vis.get("fonts.body");
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
        ctx.font = baseFontSize + "px " + vis.get("fonts.body");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = "#000000";
        ctx.shadowBlur = strokeWidth * 2;

        ctx.fillStyle = teamColor.lighten(20).toString();
        ctx.fillText(numberText, numberX, numberY);
        
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(numberText, numberX, numberY)

        return ctx.canvas;
    }

    drawMorph(vis:MaterialVisualizer)
    {
        const bubblyOffset = { x: 20, y: 40 } // y twice x
        const bubblySize = new Vector2(256, 256);
        
        const arrowBaseSize = 320;

        const i = this.number;
        const cardSize = vis.size;
        const ctx = createContext({ size: cardSize });
        const invert = (i == 10);
        
        let contrastColor = colorLighten(vis.get("morphCardsColors")[i], 60).toString();
        if(invert) { contrastColor = colorLighten(vis.get("morphCardsColors")[i], -48).toString(); }

        // bg
        ctx.fillStyle = vis.get("morphCardColors")[i].toString();
        ctx.fillRect(0, 0, cardSize.x, cardSize.y);

        // cloudy symbols
        ctx.globalAlpha = 0.2;
        
        let cloudyData = new ResourceImage(vis.getResource("bubbly_cloud"));
        if(invert) 
        {
            const eff = new TintEffect({ color: "#000000" });
            eff.applyToImage(cloudyData);
        }

        ctx.drawImage(
            cloudyData.getImage(), 
            bubblyOffset.x - 0.5*bubblySize.x, bubblyOffset.y - 0.5*bubblySize.y, 
            bubblySize.x, bubblySize.y
        )
        
        ctx.drawImage(
            cloudyData.getImage(), 
            cardSize.x - bubblyOffset.x - 0.5*bubblySize.x - 4, cardSize.y - bubblyOffset.y - 0.5*bubblySize.y - 4, 
            bubblySize.x, bubblySize.y)
        
        ctx.globalAlpha = 1.0;

        // numbers
        const numberFontSize = vis.get("numberFontSize");
        const numberSize = (i <= 9) ? numberFontSize : 0.67*numberFontSize;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: numberSize,
            lineHeight: 0.8,
        })

        const textOp = new LayoutOperation({
            pos: new Vector2(50, 60 + 0.5 * numberSize), // @NOTE: might be incorrect after TextDrawer switch
            size: new Vector2(0.25*cardSize.x, numberSize*2),
            fill: contrastColor,
        });
        const numberText = i.toString();
        const textRes = new ResourceText({ text: numberText, textConfig: textConfig });
        textRes.toCanvas(ctx, textOp);

        textOp.pos = new Vector2(cardSize.x - textOp.pos.x, cardSize.y - 30); // @NOTE: might be incorrect after TextDrawer switch
        textRes.toCanvas(ctx, textOp);

        // arrows
        ctx.fillStyle = contrastColor
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        const arrowSize = (i <= 5) ? arrowBaseSize : 0.75*arrowBaseSize;
        ctx.font = arrowSize + "px " + vis.get("fonts.body");

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

        return ctx.canvas;
    }

    drawSpecial(vis:MaterialVisualizer)
    {
        const cardSize = vis.size;
        const bubblyOffset = { x: 20, y: 40 } // y twice x
        const bubblySize = new Vector2(256 + 128, 256 + 128);

        const ctx = createContext({ size: cardSize });
        const randNum = Math.floor(Math.random()*8) + 1;
        let secondRandNum = Math.floor(Math.random()*8) + 1;
        if(Math.abs(secondRandNum - randNum) < 2) { 
            secondRandNum = ((secondRandNum + 3) % 8) + 1;
        }

        let baseColor = vis.get("morphCardColors")[randNum]
        let contrastColor = baseColor.lighten(60).toString();

        // bg
        ctx.fillStyle = baseColor.toString();
        ctx.fillRect(0, 0, cardSize.x, cardSize.y);

        // cloudy symbols
        ctx.globalAlpha = 0.2;
        
        let cloudyData = vis.getResource("bubbly_cloud");

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

        const iconKey = vis.inkFriendly ? "icons_special_inkfriendly" : "icons_special";
        const iconData = getRandomTypeData(ICONS_SPECIAL);
        const resize = iconData.resize || 1.0;
        const iconParams = {
            frame: iconData.frame, 
            pos: new Vector2(0.5*cardSize.x, 0.5*cardSize.x), 
            size: new Vector2(0.55*centerBubblySize.x*resize, 0.55*centerBubblySize.y*resize),
            pivot: new Vector2(0.5)
        }

        const iconResource = vis.getResource(iconKey);
        const canvOp = new LayoutOperation(iconParams);
        iconResource.toCanvas(ctx, canvOp);

        // numbers
        const numFontSize = vis.get("numberFontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: numFontSize,
            lineHeight: 0.8,
        })

        let numberOffset = new Vector2(75, 90 + 0.5*numFontSize); // @NOTE: might be incorrect after TextDrawer switch
        const textOp = new LayoutOperation({
            pos: numberOffset,
            size: new Vector2(0.25*cardSize.x, numFontSize*2),
            fill: contrastColor,
        });
        const numberText = randNum + "+";
        const textRes = new ResourceText({ text: numberText, textConfig: textConfig });
        textRes.toCanvas(ctx, textOp);

        let secondNumberText = numberText;
        const isDualNumber = (iconData.frame == 0 || iconData.frame == 7);
        if(isDualNumber) { secondNumberText = secondRandNum + "+"; }

        textRes.text = secondNumberText;
        textOp.pos = new Vector2(cardSize.x - numberOffset.x, cardSize.y - 30);
        textRes.toCanvas(ctx);
        
        return ctx.canvas;
    }
}