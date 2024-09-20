import Color from "js/pq_games/layout/color/color"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import imageToPhaser from "js/pq_games/phaser/imageToPhaser"
// @ts-ignore
import { Display, GameObjects } from "js/pq_games/phaser/phaser.esm"
import { pathToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser"
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
import TextConfig from "js/pq_games/layout/text/textConfig"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import textToPhaser from "js/pq_games/phaser/textToPhaser"

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
    dims:Point

	constructor(game:any)
	{
		this.game = game;
        this.resolutionPerCell = CONFIG.board.resolutionPerCell;

        this.paperDimensions = new Point({ x: this.game.canvas.width, y: this.game.canvas.height });

        const outerMarginFactor = CONFIG.board.outerMarginFactor;
        this.outerMargin = new Point({ x: this.paperDimensions.x * outerMarginFactor.x, y: this.paperDimensions.y * outerMarginFactor.y });
        this.boardDimensions = new Point({ x: this.paperDimensions.x - 2*this.outerMargin.x, y: this.paperDimensions.y - 2*this.outerMargin.y });
	}

    draw(board:BoardState)
    {        
        this.board = board;
        this.dims = board.getDimensions();
        this.cellSize = new Point({ 
            x: this.boardDimensions.x / this.dims.x, 
            y: this.boardDimensions.y / this.dims.y 
        });
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        // draws the grid and fills in the squares
        const lines = this.createGridLines();
        const linesRandomized = this.randomizeGridLines(lines);
        const linesSmoothed = this.smoothLines(linesRandomized);
        this.fillInCells(linesSmoothed);
        this.strokeLines(linesSmoothed);

        // draws the custom images or properties of each cell
        this.displayCells();
        this.displayRecipeBook(board.recipeBook);

        // finishing touches
        this.drawBoardEdge();
    }

    createGridLines()
    {
        const offsetPerStep = new Point({ x: this.cellSize.x / this.resolutionPerCell, y: this.cellSize.y / this.resolutionPerCell });
        const lines:Lines = { 
            x: this.createSubdividedLines("x", this.dims, this.resolutionPerCell, offsetPerStep),
            y: this.createSubdividedLines("y", this.dims, this.resolutionPerCell, offsetPerStep)
        }
        return lines;
    }

    createSubdividedLines(variableAxis:string, dims:Point, resolutionPerCell:number, offsetPerStep:Point)
    {
        const nonVariableAxis = (variableAxis == "x") ? "y" : "x";

        // how much we move, each step, along the variable axis
        const offsetVector = new Point();
        offsetVector[variableAxis] = 1;
        offsetVector.scaleFactor(offsetPerStep[variableAxis]);

        // loop through all points
        const lines = [];
        for(let a = 0; a <= dims[nonVariableAxis]; a++)
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
            for(let b = 0; b < dims[variableAxis]; b++)
            {
                for(let i = 0; i < resolutionPerCell; i++)
                {
                    curPoint.add(offsetVector);
                    const p = curPoint.clone();
                    const isEdge = (a == 0 || a == dims[nonVariableAxis]);
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

    strokeLines(lines:Lines)
    {
        const graphics = this.game.add.graphics();
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
                pathToPhaser(new Path(line), opLine, graphics);
            }
        }
    }

    fillInCells(lines:Lines)
    {
        const graphics = this.game.add.graphics();

        let smoothingResolution = CONFIG.board.smoothingResolution;
        if(!CONFIG.board.useWobblyLines) { smoothingResolution = 1; }

        const distBetweenAnchors = smoothingResolution * this.resolutionPerCell;

        for(let x = 0; x < this.dims.x; x++)
        {
            for(let y = 0; y < this.dims.y; y++)
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

                graphics.fillStyle(backgroundColor);

                const points = [set1, set2, set3, set4].flat();
                pathToPhaser(new Path(points), opFill, graphics);
                cell.polygon = points;
            }
        }
    }

    displayCells()
    {
        for(let x = 0; x < this.dims.x; x++)
        {
            for(let y = 0; y < this.dims.y; y++)
            {
                this.displayCell(new Point().setXY(x,y));                
            }
        }
    }

    displayCell(point:Point)
    {
        const cell = this.board.getCellAt(point);
        const data = cell.getTypeData();
        if(!data) { return; }

        const w = this.cellSize.x, h = this.cellSize.y;
        const realPos = this.convertGridPointToRealPoint(point);
        const centerPos = realPos.clone().add(new Point().setXY(0.5*w, 0.5*h));

        const resCustom = CONFIG.visualizer.resLoader.getResource("custom_spritesheet");

        // tutorials get a custom square frame to mark them as such
        if(cell.isTutorial())
        {
            const opBG = new LayoutOperation({
                translate: centerPos,
                dims: new Point(w,h),
                frame: CUSTOM.tutorialBG.frame,
                pivot: Point.CENTER,
            })
            const bgSprite = imageToPhaser(resCustom, opBG, this.game);

            // then a custom image (matching frame from spritesheet) with the actual explanation
            let textureKey = "tutorials_spritesheet";
            let needsTutIcon = false;
            if(cell.mainType == "ingredient" || cell.mainType == "machine") {
                textureKey = cell.mainType + "_tuts";
                needsTutIcon = true;
            }

            const opTut = new LayoutOperation({
                translate: centerPos,
                dims: new Point(w,h),
                frame: data.frame,
                pivot: Point.CENTER
            })
            const tutSprite = imageToPhaser(CONFIG.visualizer.resLoader.getResource(textureKey), opTut, this.game);

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
                        translate: positions[i],
                        dims: new Point(tutIconSize),
                        frame: data.frame,
                        pivot: Point.CENTER,
                    });
                    const iconKey = cell.mainType + "_spritesheet";
                    const tutIcon = imageToPhaser(CONFIG.visualizer.resLoader.getResource(iconKey), opTutIcon, this.game);
                    tutIcon.preFX.addGlow(0xFFFFFF, 0.25*tutIcon.displayWidth, 0, false);
                }
            }


            return;
        }

        const backgroundPatternScaleUp = 1.175;

        // @TODO: find a replacement for this (+ preFX/postFX?) once I switch to loose coupling with Phaser
        const backgroundMaskGraphics = new GameObjects.Graphics(this.game);
        backgroundMaskGraphics.fillStyle(0x000000);
        backgroundMaskGraphics.fillPoints(cell.polygon, true);
        const backgroundMask = new Display.Masks.GeometryMask(this.game, backgroundMaskGraphics);

        // ingredients / machines display their custom sprite big in the center
        if(cell.mainType == "ingredient" || cell.mainType == "machine")
        {
            if(cell.mainType == "machine")
            {
                const opBG = new LayoutOperation({
                    translate: centerPos,
                    dims: new Point(backgroundPatternScaleUp * w, backgroundPatternScaleUp * h),
                    frame: CUSTOM.machineBG.frame,
                    pivot: Point.CENTER,
                })

                const bg = imageToPhaser(resCustom, opBG, this.game);
                bg.setMask(backgroundMask);
            }

            const iconScale = CONFIG.board.iconScale;
            const opSprite = new LayoutOperation({
                translate: centerPos,
                dims: new Point(iconScale * w, iconScale * h),
                frame: data.frame,
                pivot: Point.CENTER
            })

            const resSprite = CONFIG.visualizer.resLoader.getResource(cell.mainType + "_spritesheet");
            const sprite = imageToPhaser(resSprite, opSprite, this.game);

            const shadowOffset = -0.01*sprite.displayWidth;
            const shadowDecay = 0.075;
            const shadowPower = 1.0;
            const shadowColor = 0x000000;
            sprite.preFX.addShadow(shadowOffset, shadowOffset, shadowDecay, shadowPower, shadowColor);

            // if they have extra data (money number or fixed fingers) ...
            if(cell.hasExtraData())
            {
                const displayMoney = cell.hasNum();
                const displayFixedFingers = cell.hasFixedFingers() && CONFIG.expansions.fixedFingers;
                const contentPos = realPos.clone().move(new Point(0.35*w, 0.75*h));

                const extraFrameScale = CONFIG.board.extraFrameScale;
                const frameNum = displayMoney ? CUSTOM.moneyFrame.frame : CUSTOM.fingerFrame.frame;
                const opFrame = new LayoutOperation({
                    translate: new Point(centerPos.x, realPos.y + 0.75*h),
                    dims: new Point(extraFrameScale * w, extraFrameScale * h),
                    frame: frameNum,
                    pivot: Point.CENTER
                })

                // display the background frame
                const extraFrame = imageToPhaser(resCustom, opFrame, this.game);

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
                        translate: contentPos,
                        dims: new Point(2*textConfig.size),
                        fill: txcfg.color,
                        stroke: txcfg.stroke,
                        strokeWidth: fontSize * 0.1,
                        pivot: Point.CENTER
                    })

                    const num = cell.getNum();
                    const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
                    textToPhaser(resText, opText, this.game);
                }
                else if(displayFixedFingers)
                {
                    const f = new FixedFingers(cell.getFixedFingers());
                    const handPos = contentPos.clone();
                    const handHeight = extraFrame.displayHeight;
                    handPos.x = centerPos.x;
                    // @TODO: dive into this function and loosely couple it too
                    f.display(this, handPos, handHeight);
                }

            }
            return;
        }

        // money displays its icon (at the top) and text (at the bottom)
        if(cell.mainType == "money")
        {
            const opBG = new LayoutOperation({
                translate: centerPos,
                dims: new Point(backgroundPatternScaleUp * w, backgroundPatternScaleUp * h),
                pivot: Point.CENTER,
                frame: CUSTOM.moneyBG.frame
            })
            const bg = imageToPhaser(resCustom, opBG, this.game);
            bg.setMask(backgroundMask);

            const moneySpriteScale = CONFIG.board.moneySpriteScale;
            const opMoney = new LayoutOperation({
                translate: new Point(centerPos.x, realPos.y + 0.5 * h),
                dims: new Point(moneySpriteScale * w, moneySpriteScale * h),
                pivot: Point.CENTER,
                frame: CUSTOM.moneyIcon.frame,
            })
            const moneySprite = imageToPhaser(resCustom, opMoney, this.game);

            const txcfg:any = CONFIG.board.moneyTextConfig;
            const fontSize = (txcfg.fontScaleFactor * this.cellSizeUnit);
            const textConfig = new TextConfig({
                font: txcfg.fontFamily,
                size: fontSize
            }).alignCenter();

            const opText = new LayoutOperation({
                translate: new Point(centerPos.x, realPos.y + 0.7*h),
                dims: new Point(2*textConfig.size),
                fill: txcfg.color,
                stroke: txcfg.stroke,
                strokeWidth: fontSize * 0.1,
                pivot: Point.CENTER
            })

            const num = cell.getNum();
            const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
            textToPhaser(resText, opText, this.game);
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

    displayRecipeBook(rb:RecipeBook)
    {
        if(!rb) { return; }
        rb.display(this);
    }

    drawBoardEdge()
    {
        if(!this.hasOuterMargin()) { return; }

        const lineWidth = CONFIG.board.outerEdge.lineWidth * this.cellSizeUnit;
        const lineColor = CONFIG.board.outerEdge.lineColor;
        const lineAlpha = CONFIG.board.outerEdge.lineAlpha;

        const graphics = this.game.add.graphics();
        const opRect = new LayoutOperation({
            stroke: lineColor,
            strokeWidth: lineWidth,
            alpha: lineAlpha
        })
        const resRect = new Rectangle().fromTopLeft(this.outerMargin, this.boardDimensions);
        rectToPhaser(resRect, opRect, graphics);
    }

    hasOuterMargin()
    {
        return this.outerMargin.x > 0.003 || this.outerMargin.y > 0.003
    }

}