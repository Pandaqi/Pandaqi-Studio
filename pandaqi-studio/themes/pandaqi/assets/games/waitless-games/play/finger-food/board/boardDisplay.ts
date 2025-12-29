
import BoardState from "./boardState"
import { CONFIG } from "../shared/config"
import { CUSTOM } from "../shared/dict"
import FixedFingers from "./fixedFingers"
import RecipeBook from "./recipeBook"
import { Vector2, MaterialVisualizer, Vector2Graph, smoothPath, ResourceGroup, LayoutOperation, ResourceShape, Path, Color, GlowEffect, DropShadowEffect, TextConfig, StrokeAlign, ResourceText, Rectangle } from "lib/pq-games"

interface Lines {
    x: Vector2[][],
    y: Vector2[][]
}

export default class BoardDisplay
{
    resolutionPerCell:number
    paperDimensions: Vector2
    outerMargin: Vector2
    boardDimensions: Vector2

    board:BoardState
    cellSize:Vector2
    cellSizeUnit:number
    size:Vector2

	constructor(board:BoardState)
	{
        this.board = board;
	}

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {        
        const group = vis.prepareDraw();

        this.resolutionPerCell = vis.get("board.resolutionPerCell");

        this.paperDimensions = vis.size;

        const outerMarginFactor = vis.get("board.outerMarginFactor");
        this.outerMargin = new Vector2(this.paperDimensions.x * outerMarginFactor.x, this.paperDimensions.y * outerMarginFactor.y);
        this.boardDimensions = new Vector2(this.paperDimensions.x - 2*this.outerMargin.x, this.paperDimensions.y - 2*this.outerMargin.y);

        this.size = this.board.getDimensions();
        this.cellSize = new Vector2(
            this.boardDimensions.x / this.size.x, 
            this.boardDimensions.y / this.size.y 
        );
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        // draws the grid and fills in the squares
        const lines = this.createGridLines();
        const linesRandomized = this.randomizeGridLines(vis, lines);
        const linesSmoothed = this.smoothLines(vis, linesRandomized);
        this.fillInCells(vis, group, linesSmoothed);
        this.strokeLines(vis, group, linesSmoothed);

        // draws the custom images or properties of each cell
        this.displayCells(vis, group);
        this.displayRecipeBook(vis, group, this.board.recipeBook);

        // finishing touches
        this.drawBoardEdge(vis, group);

        return await vis.finishDraw(group);
    }

    createGridLines()
    {
        const offsetPerStep = new Vector2(this.cellSize.x / this.resolutionPerCell, this.cellSize.y / this.resolutionPerCell);
        const lines:Lines = { 
            x: this.createSubdividedLines("x", this.size, this.resolutionPerCell, offsetPerStep),
            y: this.createSubdividedLines("y", this.size, this.resolutionPerCell, offsetPerStep)
        }
        return lines;
    }

    createSubdividedLines(variableAxis:string, size:Vector2, resolutionPerCell:number, offsetPerStep:Vector2)
    {
        const nonVariableAxis = (variableAxis == "x") ? "y" : "x";

        // how much we move, each step, along the variable axis
        const offsetVector = new Vector2();
        offsetVector[variableAxis] = 1;
        offsetVector.scaleFactor(offsetPerStep[variableAxis]);

        // loop through all points
        const lines = [];
        for(let a = 0; a <= size[nonVariableAxis]; a++)
        {
            const line = [];

            // start at a fixed location on non variable axis
            // the variable axis starts at 0 and will change
            let curPoint = new Vector2Graph();
            let staticCoordinates = this.outerMargin[nonVariableAxis] + a * resolutionPerCell * offsetPerStep[nonVariableAxis];
            curPoint[variableAxis] = this.outerMargin[variableAxis];
            curPoint[nonVariableAxis] = staticCoordinates;
            curPoint.metadata = { edge: true, cells: this.getCellsConnectedToRealPoint(variableAxis, curPoint) };
            line.push(curPoint.clone());

            // then just step along until we're done with the line
            for(let b = 0; b < size[variableAxis]; b++)
            {
                for(let i = 0; i < resolutionPerCell; i++)
                {
                    curPoint.add(offsetVector);
                    const p = curPoint.clone();
                    const isEdge = (a == 0 || a == size[nonVariableAxis]);
                    p.metadata = { edge: isEdge, cells: this.getCellsConnectedToRealPoint(variableAxis, p) };
                    line.push(p);
                }
            }

            let finalPoint = new Vector2Graph();
            finalPoint[variableAxis] = this.outerMargin[variableAxis] + this.boardDimensions[variableAxis];
            finalPoint[nonVariableAxis] = staticCoordinates;
            finalPoint.metadata = { edge: true, cells: this.getCellsConnectedToRealPoint(variableAxis, finalPoint) };
            line.push(finalPoint.clone());

            lines.push(line);
        }
        return lines;
    } 

    randomizeGridLines(vis:MaterialVisualizer, lines:Lines)
    {
        if(!vis.get("board.useWobblyLines")) { return lines; }

        const maxVariation = vis.get("board.maxGridLineVariation") * this.cellSizeUnit;
        for(const [axis,linesAxis] of Object.entries(lines))
        {
            for(const line of linesAxis)
            {
                for(let i = 0; i < line.length; i++)
                {
                    const point = line[i];
                    const isAnchorPoint = i % this.resolutionPerCell == 0;
                    const isEdge = point.metadata.edge;

                    let isTutorial = false;
                    for(const cell of point.metadata.cells)
                    {
                        if(cell.isTutorial()) { isTutorial = true;  }
                    }

                    const keepStatic = isAnchorPoint || isEdge || isTutorial;
                    if(keepStatic) { continue; }

                    const randomization = new Vector2().random().scaleFactor(maxVariation);
                    point.add(randomization);
                }
            }
        }
        return lines;
    }

    getCellsConnectedToRealPoint(axis:string, p:Vector2)
    {
        const gridPointBelow = this.convertRealPointToGridPoint(p);
        let gridPointAbove = gridPointBelow.clone().add(new Vector2(0,-1))
        if(axis == "y") { gridPointAbove = gridPointBelow.clone().add(new Vector2(-1,0)); }
        
        const arr = [];
        if(this.board.getCellAt(gridPointBelow)) { arr.push(this.board.getCellAt(gridPointBelow)); }
        if(this.board.getCellAt(gridPointAbove)) { arr.push(this.board.getCellAt(gridPointAbove)); }
        return arr;
    }

    convertRealPointToGridPoint(p:Vector2)
    {
        const x = Math.floor((p.x - this.outerMargin.x) / this.cellSize.x);
        const y = Math.floor((p.y - this.outerMargin.y) / this.cellSize.y);
        return new Vector2(x,y);
    }

    convertGridPointToRealPoint(p:Vector2)
    {
        const x = p.x * this.cellSize.x + this.outerMargin.x;
        const y = p.y * this.cellSize.y + this.outerMargin.y;
        return new Vector2(x,y);
    }

    smoothLines(vis:MaterialVisualizer, lines:Lines)
    {
        if(!vis.get("board.useWobblyLines")) { return lines; }

        const smoothingResolution = vis.get("board.smoothingResolution");
        const newLines:Lines = { x: [], y: [] };
        for(const key of Object.keys(lines))
        {
            newLines[key] = [];
            const linesAxis = lines[key];
            for(const line of linesAxis)
            {
                const params = { path: line, resolution: smoothingResolution };
                const newLine = smoothPath(params);
                newLines[key].push(newLine);
            }
        }
        return newLines;
    }

    strokeLines(vis:MaterialVisualizer, group:ResourceGroup, lines:Lines)
    {
        const data = vis.inkFriendly ? vis.get("board.grid.linesInkfriendly") : vis.get("board.grid.lines");

        const lineWidth = data.width * this.cellSizeUnit;
        const lineColor = data.color;
        const lineAlpha = data.alpha;

        const opLine = new LayoutOperation({
            stroke: lineColor,
            strokeWidth: lineWidth,
            alpha: lineAlpha
        });

        for(const linesAxis of Object.values(lines))
        {
            for(const line of linesAxis)
            {
                group.add(new ResourceShape(new Path(line)), opLine);
            }
        }
    }

    fillInCells(vis:MaterialVisualizer, group:ResourceGroup, lines:Lines)
    {
        let smoothingResolution = vis.get("board.smoothingResolution");
        if(!vis.get("board.useWobblyLines")) { smoothingResolution = 1; }

        const distBetweenAnchors = smoothingResolution * this.resolutionPerCell;

        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const cell = this.board.getCellAt(new Vector2(x,y));
                let backgroundColor = new Color(cell.getColor());
                if(vis.inkFriendly) { backgroundColor = Color.WHITE; }

                const set1 = this.getLineChunk(lines.x[y], x*distBetweenAnchors, (x+1)*distBetweenAnchors);
                const set2 = this.getLineChunk(lines.y[x+1], y*distBetweenAnchors, (y+1)*distBetweenAnchors);
                const set3 = this.getLineChunk(lines.x[y+1], (x+1)*distBetweenAnchors, x*distBetweenAnchors);
                const set4 = this.getLineChunk(lines.y[x], (y+1)*distBetweenAnchors, y*distBetweenAnchors);

                const opFill = new LayoutOperation({
                    fill: backgroundColor
                })

                const points = [set1, set2, set3, set4].flat();
                group.add(new ResourceShape(new Path(points)), opFill);
                cell.polygon = points;
            }
        }
    }

    displayCells(vis:MaterialVisualizer, group:ResourceGroup,)
    {
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                this.displayCell(vis, group, new Vector2(x,y));                
            }
        }
    }

    displayCell(vis:MaterialVisualizer, group:ResourceGroup, point:Vector2)
    {
        const cell = this.board.getCellAt(point);
        const data = cell.getTypeData();
        if(!data) { return; }

        const w = this.cellSize.x, h = this.cellSize.y;
        const realPos = this.convertGridPointToRealPoint(point);
        const centerPos = realPos.clone().add(new Vector2(0.5*w, 0.5*h));

        const resCustom = vis.getResource("custom_spritesheet");

        // tutorials get a custom square frame to mark them as such
        if(cell.isTutorial())
        {
            const opBG = new LayoutOperation({
                pos: centerPos,
                size: new Vector2(w,h),
                frame: CUSTOM.tutorialBG.frame,
                pivot: Vector2.CENTER,
            })
            group.add(resCustom, opBG);

            // then a custom image (matching frame from spritesheet) with the actual explanation
            let textureKey = "tutorials_spritesheet";
            let needsTutIcon = false;
            if(cell.mainType == "ingredient" || cell.mainType == "machine") {
                textureKey = cell.mainType + "_tuts";
                needsTutIcon = true;
            }

            const resTut = vis.getResource(textureKey);
            const opTut = new LayoutOperation({
                pos: centerPos,
                size: new Vector2(w,h),
                frame: data.frame,
                pivot: Vector2.CENTER
            })
            group.add(resTut, opTut);

            if(needsTutIcon)
            {
                // and, of course, the icon of the thing to which it refers in top left/right corners
                // (would normally do this by hand in Affinity, but my laptop just can't handle it anymore)
                const offsetFromCenter = 0.38*w;
                const offsetFromTop = 0.1*h;
                const tutIconSize = vis.get("tutorials.cornerIconSize") * w;
                const positions = [
                    new Vector2(centerPos.x - offsetFromCenter, realPos.y + offsetFromTop),
                    new Vector2(centerPos.x + offsetFromCenter, realPos.y + offsetFromTop)
                ]
                for(let i = 0; i < 2; i++)
                {
                    const opTutIcon = new LayoutOperation({
                        pos: positions[i],
                        size: new Vector2(tutIconSize),
                        frame: data.frame,
                        pivot: Vector2.CENTER,
                        effects: [new GlowEffect({ color: "#FFFFFF", blur: 0.25 * tutIconSize })]
                    });
                    const iconKey = cell.mainType + "_spritesheet";
                    const resTut = vis.getResource(iconKey);
                    group.add(resTut, opTutIcon);
                }
            }

            return;
        }

        const backgroundPatternScaleUp = 1.175;
        const backgroundMask = new Path(cell.polygon);

        // ingredients / machines display their custom sprite big in the center
        if(cell.mainType == "ingredient" || cell.mainType == "machine")
        {
            if(cell.mainType == "machine")
            {
                const opBG = new LayoutOperation({
                    pos: centerPos,
                    size: new Vector2(backgroundPatternScaleUp * w, backgroundPatternScaleUp * h),
                    frame: CUSTOM.machineBG.frame,
                    pivot: Vector2.CENTER,
                    clip: backgroundMask
                })
                group.add(resCustom, opBG);
            }

            const iconScale = vis.get("board.iconScale");
            const spriteSize = new Vector2(iconScale * w, iconScale * h);
            const opSprite = new LayoutOperation({
                pos: centerPos,
                size: spriteSize,
                frame: data.frame,
                pivot: Vector2.CENTER,
                effects: [new DropShadowEffect({ color: "#000000", blur: 0.01 * spriteSize.x }) ]
            })

            const resSprite = vis.getResource(cell.mainType + "_spritesheet");
            group.add(resSprite, opSprite);

            // if they have extra data (money number or fixed fingers) ...
            if(cell.hasExtraData())
            {
                const displayMoney = cell.hasNum();
                const displayFixedFingers = cell.hasFixedFingers() && CONFIG._settings.expansions.fixedFingers.value;
                const contentPos = realPos.clone().move(new Vector2(0.35*w, 0.75*h));

                const extraFrameScale = vis.get("board.extraFrameScale");
                const frameNum = displayMoney ? CUSTOM.moneyFrame.frame : CUSTOM.fingerFrame.frame;
                const opFrame = new LayoutOperation({
                    pos: new Vector2(centerPos.x, realPos.y + 0.75*h),
                    size: new Vector2(extraFrameScale * w, extraFrameScale * h),
                    frame: frameNum,
                    pivot: Vector2.CENTER
                })

                // display the background frame
                group.add(resCustom, opFrame);

                // display what's on top
                if(displayMoney)
                {
                    const txcfg:any = vis.get("board.moneyTextConfigTiny");
                    const fontSize = (txcfg.fontScaleFactor * this.cellSizeUnit);

                    const textConfig = new TextConfig({
                        font: txcfg.fontFamily,
                        size: fontSize
                    }).alignCenter();

                    const opText = new LayoutOperation({
                        pos: contentPos,
                        size: new Vector2(2*textConfig.size),
                        fill: txcfg.color,
                        stroke: txcfg.stroke,
                        strokeWidth: fontSize * 0.1,
                        strokeAlign: StrokeAlign.OUTSIDE,
                        pivot: Vector2.CENTER
                    })

                    const num = cell.getNum();
                    const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
                    group.add(resText, opText);
                }
                else if(displayFixedFingers)
                {
                    const f = new FixedFingers(cell.getFixedFingers());
                    const handPos = contentPos.clone();
                    const handHeight = opFrame.size.y;
                    handPos.x = centerPos.x;
                    f.display(vis, group, this, handPos, handHeight);
                }

            }
            return;
        }

        // money displays its icon (at the top) and text (at the bottom)
        if(cell.mainType == "money")
        {
            const opBG = new LayoutOperation({
                pos: centerPos,
                size: new Vector2(backgroundPatternScaleUp * w, backgroundPatternScaleUp * h),
                pivot: Vector2.CENTER,
                frame: CUSTOM.moneyBG.frame,
                clip: backgroundMask
            })
            group.add(resCustom, opBG);

            const moneySpriteScale = vis.get("board.moneySpriteScale");
            const opMoney = new LayoutOperation({
                pos: new Vector2(centerPos.x, realPos.y + 0.5 * h),
                size: new Vector2(moneySpriteScale * w, moneySpriteScale * h),
                pivot: Vector2.CENTER,
                frame: CUSTOM.moneyIcon.frame,
            })
            group.add(resCustom, opMoney);

            const txcfg:any = vis.get("board.moneyTextConfig");
            const fontSize = (txcfg.fontScaleFactor * this.cellSizeUnit);
            const textConfig = new TextConfig({
                font: txcfg.fontFamily,
                size: fontSize
            }).alignCenter();

            const opText = new LayoutOperation({
                pos: new Vector2(centerPos.x, realPos.y + 0.7*h),
                size: new Vector2(2*textConfig.size),
                fill: txcfg.color,
                stroke: txcfg.stroke,
                strokeWidth: fontSize * 0.1,
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Vector2.CENTER
            })

            const num = cell.getNum();
            const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
            group.add(resText, opText);
            return;
        }
    }

    getLineChunk(line, start, end)
    {
        let isReversed = (start > end);
        if(isReversed) { 
            let temp = start;
            start = end;
            end = temp;
        }

        const chunk = [];
        for(let i = start; i <= end; i++)
        {
            chunk.push(line[i]);
        }

        if(isReversed) { chunk.reverse(); }
        return chunk;
    }

    displayRecipeBook(vis:MaterialVisualizer, group:ResourceGroup, rb:RecipeBook)
    {
        if(!rb) { return; }
        rb.display(vis, group, this);
    }

    drawBoardEdge(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasOuterMargin()) { return; }

        const lineWidth = vis.get("board.outerEdge.lineWidth") * this.cellSizeUnit;
        const lineColor = vis.get("board.outerEdge.lineColor");
        const lineAlpha = vis.get("board.outerEdge.lineAlpha");

        const opRect = new LayoutOperation({
            stroke: lineColor,
            strokeWidth: lineWidth,
            alpha: lineAlpha
        })
        const resRect = new Rectangle().fromTopLeft(this.outerMargin, this.boardDimensions);
        group.add(new ResourceShape(resRect), opRect);
    }

    hasOuterMargin()
    {
        return this.outerMargin.x > 0.003 || this.outerMargin.y > 0.003
    }

}