import Point from "./point";
import Color from "js/pq_games/layout/color/color";
import Map from "./map"

interface VisResult {
    rects: any[],
    lines: any[],
    circles: any[],
    sprites: any[],
    text: any[]
}

export { MapVisualizer, VisResult }
export default class MapVisualizer {
    map:Map

    constructor(m: Map)
    {
        this.map = m;
    }

    getVisualization(params:Record<string,any>)
    {
        const obj : VisResult = { rects: [], lines: [], circles: [], sprites: [], text: [] };
        this.scaleDynamicParams(params);
        if(!params) { console.error("Can't visualize map without (valid) params."); return obj; }
        if(!this.map) { return obj; }
        
        this.visualizePoints(obj, params);
        this.visualizeLines(obj, params);
        this.visualizeWords(obj, params);

        return obj;
    }

    scaleDynamicParams(params: Record<string, any>)
    {
        const dim = Math.min(params.width, params.height);
        params.pointRadius = params.pointRadiusFactor * dim;
        params.pointRadiusSpecial = params.pointRadiusSpecialFactor * dim;
        params.lineWidth = params.lineWidthFactor * dim;
        params.activeLineWidth = params.activeLineWidthFactor * dim;
        params.fontSize = params.fontSizeFactor * dim;
        params.wordMargin = params.wordMarginFactor * dim;
    }

    visualizeLines(obj: VisResult, params: Record<string, any>)
    {
        const lines = this.map.getLinesAsList();

        for(const line of lines)
        {
            const start = line.getStart();
            const end = line.getEnd();
            const col = params.lineColor;
            const width = params.lineWidth || 2;
            const alpha = params.lineAlpha || 1;
            obj.lines.push({
                p1: start,
                p2: end,
                color: col,
                width: width,
                alpha: alpha
            })
        }
    }

    visualizePoints(obj: VisResult, params: Record<string, any>)
    {
        const points = this.map.getPointsAsList();
        const baseRadius = params.pointRadius;
        const activePoints = params.activePoints || [];

        for(const point of points)
        {
            let col = point.getColor() || params.pointColor;
            let frame = -1
            let radius = baseRadius;
            if(point.getType())
            {
                col = params.pointTypes[point.getType()].col;
                frame = params.pointTypes[point.getType()].frame;
                radius = params.pointRadiusSpecial;

                if(params.inkFriendly) { col = params.pointColor; }
            }

            const isActivePoint = activePoints.includes(point);
            let shadowBlur = 0;
            if(isActivePoint)
            {
                radius *= params.activePointRadiusScale;
                col = params.activePointColor;
                shadowBlur = 10;
            }

            const newElem = {
                p: point,
                radius: radius,
                shadow: shadowBlur,
                color: col,
                size: new Point()
            }

            if(point.isRectangle()) {
                newElem.size = new Point({ x: 3*radius, y: 3*radius });
                obj.rects.push(newElem);
            } else {
                obj.circles.push(newElem);
            }

            const needsSprite = frame >= 0;
            if(needsSprite)
            {
                obj.sprites.push({
                    p: point,
                    rotation: 0,
                    frame: frame,
                    textureKey: "point_types",
                    size: 1.2*radius
                })
            }

            const needsText = point.getNumString();
            if(needsText)
            {
                const textPoint = point.clone();
                textPoint.moveX(radius);
                obj.text.push({
                    p: textPoint,
                    text: point.getNumString(),
                    textAlign: "center",
                    textBaseline: "middle",
                    color: "#000000",
                    stroke: "#FFFFFF",
                    strokeWidth: 0.85*params.lineWidth,
                    fontFamily: "Proza Libre",
                    rotation: 0,
                    fontSize: 0.735*params.fontSize + "px"
                })
            }  
        }
    }

    visualizeWords(obj: VisResult, params: Record<string, any>)
    {
        if(!this.map.printWordsOnPaper) { return; }

        const words = this.map.getWordsAsList().slice();
        let column = 0;
        let row = 0;

        const anchor = this.map.getPrintedWordsAnchor();
        const yMargin = 40;
        anchor.y = this.map.height - yMargin;

        const columnWidth = (this.map.height - 2*yMargin) / params.maxWordColumns;
        const columnHeight = this.map.width - anchor.x;
        const singleRowHeight = params.fontSize + params.wordMargin;

        // the subtraction at the end is just to get more padding/whitespace 
        // around the words, which looks nicer
        const wordsPerColumn = Math.floor(columnHeight / singleRowHeight) - 2;

        const centeringOffset = { 
            x: 0.5 * (columnHeight - wordsPerColumn * singleRowHeight) + 0.5*params.wordMargin, 
            y: 0 
        };

        while(words.length > 0)
        {
            const word = words.pop();
            const x = anchor.x + row * singleRowHeight + centeringOffset.x;
            const y = anchor.y - column * columnWidth + centeringOffset.y;
            const txt = word.getWord();

            const textParams = {
                p: new Point({ x: x, y: y}),
                rotation: -0.5 * Math.PI,
                textAlign: "left",
                textBaseline: "top",
                fontSize: params.fontSize + "px",
                fontFamily: params.fontFamily,
                font: params.fontSize + "px " + params.fontFamily,
                color: "#000000",
                text: txt
            }

            const smallFontSize = 0.7*params.fontSize;

            const spriteSize = smallFontSize;
            const metadataTextSize = 0.75*smallFontSize;
            const spriteOffsetSize = 1.75*spriteSize;
            const spriteParams = {
                p: null,
                rotation: -0.5 * Math.PI,
                frame: 0,
                textureKey: "icon_points",
                size: spriteSize
            }

            // like the cards, align right => start from right edge and move backwared
            const marginToNextColumn = 1.5*spriteSize;
            const marginToNextColumnFromLine = 0.25*params.fontSize;
            const metadataPos = new Point({ x: x + 0.33*smallFontSize, y: y - columnWidth + marginToNextColumn }); 
            const metadataPosSprite = metadataPos.clone().moveX(0.6*smallFontSize);    
            
            // points
            const pointsText = Object.assign({}, textParams);
            pointsText.p = metadataPos;
            pointsText.text = word.getPoints();
            pointsText.fontSize = smallFontSize + "px";
            pointsText.textAlign = "right";
            obj.text.push(pointsText);

            const pointsSprite = Object.assign({}, spriteParams);
            pointsSprite.p = metadataPosSprite.clone().moveY(metadataTextSize);
            obj.sprites.push(pointsSprite);

            // lines
            const linesText = Object.assign({}, textParams);
            linesText.p = pointsText.p.clone().moveY(spriteOffsetSize + metadataTextSize);
            linesText.text = word.getLines();
            linesText.fontSize = smallFontSize + "px";
            linesText.textAlign = "right";
            obj.text.push(linesText);

            const linesSprite = Object.assign({}, spriteParams);
            linesSprite.p = pointsSprite.p.clone().moveY(spriteOffsetSize + metadataTextSize);
            linesSprite.textureKey = "icon_lines";
            obj.sprites.push(linesSprite);

            // this is the actual word
            obj.text.push(textParams);

            // rectangle behind the word
            if((column + row) % 2 == 0)
            {
                const rectParams = {
                    p: new Point({ x: x, y: y - columnWidth + marginToNextColumnFromLine }),
                    size: new Point({ x: singleRowHeight, y: columnWidth }),
                    color: new Color(0, 50, 90),
                    alpha: 1
                }
                if(params.inkFriendly) { rectParams.color = new Color(0,0,90); }
                obj.rects.push(rectParams);
            }

            row += 1;

            const gotoNextColumn = row >= wordsPerColumn;
            if(!gotoNextColumn) { continue; }

            const dividerLine = { 
                p1: new Point({ x: anchor.x + singleRowHeight, y: y + marginToNextColumnFromLine }),
                p2: new Point({ x: x + singleRowHeight, y: y + marginToNextColumnFromLine }),
                color: new Color(100,70,70),
                width: 5
            }
            if(params.inkFriendly) { dividerLine.color = new Color(0,0,70); }
            obj.lines.push(dividerLine);

            column += 1; 
            row = 0; 
        }
    }
}