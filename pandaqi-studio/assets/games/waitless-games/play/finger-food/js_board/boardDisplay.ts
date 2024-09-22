import Color from "js/pq_games/layout/color/color"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect"
import GlowEffect from "js/pq_games/layout/effects/glowEffect"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import TextConfig from "js/pq_games/layout/text/textConfig"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import Path from "js/pq_games/tools/geometry/paths/path"
import smoothPath from "js/pq_games/tools/geometry/paths/smoothPath"
import Point from "js/pq_games/tools/geometry/point"
import PointGraph from "js/pq_games/tools/geometry/pointGraph"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import BoardState from "./boardState"
import CONFIG from "./config"
import { CUSTOM } from "./dictionary"
import FixedFingers from "./fixedFingers"
import RecipeBook from "./recipeBook"
import StrokeAlign from "js/pq_games/layout/values/strokeAlign"

interface Lines {
    x: Point[][],
    y: Point[][]
}

export default class BoardDisplay
{
    game:any
    resolutionPerCell:number
    paperDimensions: Point
    outerMargin: Point
    boardDimensions: Point

    board:BoardState
    cellSize:Point
    cellSizeUnit:number
    size:Point

	constructor(game:any)
	{
		this.game = game;
        this.resolutionPerCell = CONFIG.board.resolutionPerCell;

        this.paperDimensions = game.visualizer.size;

        const outerMarginFactor = CONFIG.board.outerMarginFactor;
        this.outerMargin = new Point(this.paperDimensions.x * outerMarginFactor.x, this.paperDimensions.y * outerMarginFactor.y);
        this.boardDimensions = new Point(this.paperDimensions.x - 2*this.outerMargin.x, this.paperDimensions.y - 2*this.outerMargin.y);
	}

    draw(vis:BoardVisualizer, board:BoardState) : ResourceGroup[]
    {        
        const group = new ResourceGroup();

        this.board = board;
        this.size = board.getDimensions();
        this.cellSize = new Point(
            this.boardDimensions.x / this.size.x, 
            this.boardDimensions.y / this.size.y 
        );
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        // draws the grid and fills in the squares
        const lines = this.createGridLines();
        const linesRandomized = this.randomizeGridLines(lines);
        const linesSmoothed = this.smoothLines(linesRandomized);
        this.fillInCells(vis, group, linesSmoothed);
        this.strokeLines(vis, group, linesSmoothed);

        // draws the custom images or properties of each cell
        this.displayCells(vis, group);
        this.displayRecipeBook(vis, group, board.recipeBook);

        // finishing touches
        this.drawBoardEdge(vis, group);

        return [group];
    }

    createGridLines()
    {
        const offsetPerStep = new Point(this.cellSize.x / this.resolutionPerCell, this.cellSize.y / this.resolutionPerCell);
        const lines:Lines = { 
            x: this.createSubdividedLines("x", this.size, this.resolutionPerCell, offsetPerStep),
            y: this.createSubdividedLines("y", this.size, this.resolutionPerCell, offsetPerStep)
        }
        return lines;
    }

    createSubdividedLines(variableAxis:string, size:Point, resolutionPerCell:number, offsetPerStep:Point)
    {
        const nonVariableAxis = (variableAxis == "x") ? "y" : "x";

        // how much we move, each step, along the variable axis
        const offsetVector = new Point();
        offsetVector[variableAxis] = 1;
        offsetVector.scaleFactor(offsetPerStep[variableAxis]);

        // loop through all points
        const lines = [];
        for(let a = 0; a <= size[nonVariableAxis]; a++)
        {
            const line = [];

            // start at a fixed location on non variable axis
            // the variable axis starts at 0 and will change
            let curPoint = new PointGraph();
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

            let finalPoint = new PointGraph();
            finalPoint[variableAxis] = this.outerMargin[variableAxis] + this.boardDimensions[variableAxis];
            finalPoint[nonVariableAxis] = staticCoordinates;
            finalPoint.metadata = { edge: true, cells: this.getCellsConnectedToRealPoint(variableAxis, finalPoint) };
            line.push(finalPoint.clone());

            lines.push(line);
        }
        return lines;
    } 

    randomizeGridLines(lines:Lines)
    {
        if(!CONFIG.board.useWobblyLines) { return lines; }

        const maxVariation = CONFIG.board.maxGridLineVariation * this.cellSizeUnit;
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

                    const randomization = new Point().random().scaleFactor(maxVariation);
                    point.add(randomization);
                }
            }
        }
        return lines; // @TODO: actually (deep) copy lines first?
    }

    getCellsConnectedToRealPoint(axis:string, p:Point)
    {
        const gridPointBelow = this.convertRealPointToGridPoint(p);
        let gridPointAbove = gridPointBelow.clone().add(new Point().setXY(0,-1))
        if(axis == "y") { gridPointAbove = gridPointBelow.clone().add(new Point().setXY(-1,0)); }
        
        const arr = [];
        if(this.board.getCellAt(gridPointBelow)) { arr.push(this.board.getCellAt(gridPointBelow)); }
        if(this.board.getCellAt(gridPointAbove)) { arr.push(this.board.getCellAt(gridPointAbove)); }
        return arr;
    }

    convertRealPointToGridPoint(p:Point)
    {
        const x = Math.floor((p.x - this.outerMargin.x) / this.cellSize.x);
        const y = Math.floor((p.y - this.outerMargin.y) / this.cellSize.y);
        return new Point().setXY(x,y);
    }

    convertGridPointToRealPoint(p:Point)
    {
        const x = p.x * this.cellSize.x + this.outerMargin.x;
        const y = p.y * this.cellSize.y + this.outerMargin.y;
        return new Point().setXY(x,y);
    }

    smoothLines(lines:Lines)
    {
        if(!CONFIG.board.useWobblyLines) { return lines; }

        const smoothingResolution = CONFIG.board.smoothingResolution;
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

    strokeLines(vis:BoardVisualizer, group:ResourceGroup, lines:Lines)
    {
        const data = CONFIG.inkFriendly ? CONFIG.board.grid.linesInkfriendly : CONFIG.board.grid.lines;

        const lineWidth = data.width * this.cellSizeUnit;
        const lineColor = data.color;
        const lineAlpha = data.alpha;

        const opLine = new LayoutOperation({
            stroke: lineColor, // @TODO: update all colors to string hexes again
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

    fillInCells(vis:BoardVisualizer, group:ResourceGroup, lines:Lines)
    {
        let smoothingResolution = CONFIG.board.smoothingResolution;
        if(!CONFIG.board.useWobblyLines) { smoothingResolution = 1; }

        const distBetweenAnchors = smoothingResolution * this.resolutionPerCell;

        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const cell = this.board.getCellAt(new Point().setXY(x,y));
                let backgroundColor = new Color(cell.getColor());
                if(CONFIG.inkFriendly) { backgroundColor = Color.WHITE; }

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

    displayCells(vis:BoardVisualizer, group:ResourceGroup,)
    {
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                this.displayCell(vis, group, new Point(x,y));                
            }
        }
    }

    displayCell(vis:BoardVisualizer, group:ResourceGroup, point:Point)
    {
        const cell = this.board.getCellAt(point);
        const data = cell.getTypeData();
        if(!data) { return; }

        const w = this.cellSize.x, h = this.cellSize.y;
        const realPos = this.convertGridPointToRealPoint(point);
        const centerPos = realPos.clone().add(new Point().setXY(0.5*w, 0.5*h));

        const resCustom = vis.getResource("custom_spritesheet");

        // tutorials get a custom square frame to mark them as such
        if(cell.isTutorial())
        {
            const opBG = new LayoutOperation({
                pos: centerPos,
                size: new Point(w,h),
                frame: CUSTOM.tutorialBG.frame,
                pivot: Point.CENTER,
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
                size: new Point(w,h),
                frame: data.frame,
                pivot: Point.CENTER
            })
            group.add(resTut, opTut);

            if(needsTutIcon)
            {
                // and, of course, the icon of the thing to which it refers in top left/right corners
                // (would normally do this by hand in Affinity, but my laptop just can't handle it anymore)
                const offsetFromCenter = 0.38*w;
                const offsetFromTop = 0.1*h;
                const tutIconSize = CONFIG.tutorials.cornerIconSize * w;
                const positions = [
                    new Point(centerPos.x - offsetFromCenter, realPos.y + offsetFromTop),
                    new Point(centerPos.x + offsetFromCenter, realPos.y + offsetFromTop)
                ]
                for(let i = 0; i < 2; i++)
                {
                    const opTutIcon = new LayoutOperation({
                        pos: positions[i],
                        size: new Point(tutIconSize),
                        frame: data.frame,
                        pivot: Point.CENTER,
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
                    size: new Point(backgroundPatternScaleUp * w, backgroundPatternScaleUp * h),
                    frame: CUSTOM.machineBG.frame,
                    pivot: Point.CENTER,
                    clip: backgroundMask
                })
                group.add(resCustom, opBG);
            }

            const iconScale = CONFIG.board.iconScale;
            const spriteSize = new Point(iconScale * w, iconScale * h);
            const opSprite = new LayoutOperation({
                pos: centerPos,
                size: spriteSize,
                frame: data.frame,
                pivot: Point.CENTER,
                effects: [new DropShadowEffect({ color: "#000000", blur: 0.01 * spriteSize.x }) ]
            })

            const resSprite = vis.getResource(cell.mainType + "_spritesheet");
            group.add(resSprite, opSprite);

            // if they have extra data (money number or fixed fingers) ...
            if(cell.hasExtraData())
            {
                const displayMoney = cell.hasNum();
                const displayFixedFingers = cell.hasFixedFingers() && CONFIG.expansions.fixedFingers;
                const contentPos = realPos.clone().move(new Point(0.35*w, 0.75*h));

                const extraFrameScale = CONFIG.board.extraFrameScale;
                const frameNum = displayMoney ? CUSTOM.moneyFrame.frame : CUSTOM.fingerFrame.frame;
                const opFrame = new LayoutOperation({
                    pos: new Point(centerPos.x, realPos.y + 0.75*h),
                    size: new Point(extraFrameScale * w, extraFrameScale * h),
                    frame: frameNum,
                    pivot: Point.CENTER
                })

                // display the background frame
                group.add(resCustom, opFrame);

                // display what's on top
                if(displayMoney)
                {
                    const txcfg:any = CONFIG.board.moneyTextConfigTiny;
                    const fontSize = (txcfg.fontScaleFactor * this.cellSizeUnit);

                    const textConfig = new TextConfig({
                        font: txcfg.fontFamily,
                        size: fontSize
                    }).alignCenter();

                    const opText = new LayoutOperation({
                        pos: contentPos,
                        size: new Point(2*textConfig.size),
                        fill: txcfg.color,
                        stroke: txcfg.stroke,
                        strokeWidth: fontSize * 0.1,
                        strokeAlign: StrokeAlign.OUTSIDE,
                        pivot: Point.CENTER
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
                    // @TODO: dive into this function and loosely couple it too
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
                size: new Point(backgroundPatternScaleUp * w, backgroundPatternScaleUp * h),
                pivot: Point.CENTER,
                frame: CUSTOM.moneyBG.frame,
                clip: backgroundMask
            })
            group.add(resCustom, opBG);

            const moneySpriteScale = CONFIG.board.moneySpriteScale;
            const opMoney = new LayoutOperation({
                pos: new Point(centerPos.x, realPos.y + 0.5 * h),
                size: new Point(moneySpriteScale * w, moneySpriteScale * h),
                pivot: Point.CENTER,
                frame: CUSTOM.moneyIcon.frame,
            })
            group.add(resCustom, opMoney);

            const txcfg:any = CONFIG.board.moneyTextConfig;
            const fontSize = (txcfg.fontScaleFactor * this.cellSizeUnit);
            const textConfig = new TextConfig({
                font: txcfg.fontFamily,
                size: fontSize
            }).alignCenter();

            const opText = new LayoutOperation({
                pos: new Point(centerPos.x, realPos.y + 0.7*h),
                size: new Point(2*textConfig.size),
                fill: txcfg.color,
                stroke: txcfg.stroke,
                strokeWidth: fontSize * 0.1,
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER
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

    displayRecipeBook(vis:BoardVisualizer, group:ResourceGroup, rb:RecipeBook)
    {
        if(!rb) { return; }
        rb.display(vis, group, this);
    }

    drawBoardEdge(vis:BoardVisualizer, group:ResourceGroup)
    {
        if(!this.hasOuterMargin()) { return; }

        const lineWidth = CONFIG.board.outerEdge.lineWidth * this.cellSizeUnit;
        const lineColor = CONFIG.board.outerEdge.lineColor;
        const lineAlpha = CONFIG.board.outerEdge.lineAlpha;

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