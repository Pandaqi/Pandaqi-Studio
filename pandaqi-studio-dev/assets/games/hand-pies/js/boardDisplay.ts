// @ts-ignore
import { Geom, Display } from "js/pq_games/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"
import PointGraph from "js/pq_games/tools/geometry/pointGraph"
import smoothPath from "js/pq_games/tools/geometry/smoothPath"
import { CUSTOM } from "./dictionary"
import BoardState from "./boardState"
import CONFIG from "./config"
import FixedFingers from "./fixedFingers"
import RecipeBook from "./recipeBook"

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
        const polygons = this.fillInCells(linesSmoothed);
        this.strokeLines(linesSmoothed);

        // draws the custom images or properties of each cell
        this.displayCells(polygons);
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
        graphics.lineStyle(lineWidth, lineColor, lineAlpha);

        for(const linesAxis of Object.values(lines))
        {
            for(const line of linesAxis)
            {
                const lineObject = new Geom.Polygon(line);
                graphics.strokePoints(lineObject.points);
            }
        }
    }

    fillInCells(lines:Lines)
    {
        const graphics = this.game.add.graphics();
        let smoothingResolution = CONFIG.board.smoothingResolution;
        if(!CONFIG.board.useWobblyLines) { smoothingResolution = 1; }

        const distBetweenAnchors = smoothingResolution * this.resolutionPerCell;

        const polygons = [];

        for(let x = 0; x < this.dims.x; x++)
        {
            polygons[x] = [];

            for(let y = 0; y < this.dims.y; y++)
            {
                const cell = this.board.getCellAt(new Point().setXY(x,y));
                let backgroundColor = new Display.Color.HexStringToColor(cell.getColor());
                if(CONFIG.inkFriendly) { backgroundColor = new Display.Color.HexStringToColor("#FFFFFF"); }

                const set1 = this.getLineChunk(lines.x[y], x*distBetweenAnchors, (x+1)*distBetweenAnchors);
                const set2 = this.getLineChunk(lines.y[x+1], y*distBetweenAnchors, (y+1)*distBetweenAnchors);
                const set3 = this.getLineChunk(lines.x[y+1], (x+1)*distBetweenAnchors, x*distBetweenAnchors);
                const set4 = this.getLineChunk(lines.y[x], (y+1)*distBetweenAnchors, y*distBetweenAnchors);

                graphics.fillStyle(backgroundColor.color);

                const points = [set1, set2, set3, set4].flat();
                const polygon = new Geom.Polygon(points);
                graphics.fillPoints(polygon.points, true);

                polygons.push(polygon);
            }
        }
    }

    displayCells(polygons:any)
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

        // tutorials get a custom square frame to mark them as such
        if(cell.isTutorial())
        {
            const bgSprite = this.game.add.sprite(centerPos.x, centerPos.y, "custom_spritesheet");
            bgSprite.setFrame(CUSTOM.tutorialBG.frame);
            bgSprite.setOrigin(0.5, 0.5);
            bgSprite.displayWidth = w;
            bgSprite.displayHeight = h;

            // then a custom image (matching frame from spritesheet) with the actual explanation
            let textureKey = "tutorials_spritesheet";
            let needsTutIcon = false;
            if(cell.mainType == "ingredient" || cell.mainType == "machine") {
                textureKey = cell.mainType + "_tutorials_spritesheet";
                needsTutIcon = true;
            }

            let tutSprite = this.game.add.sprite(centerPos.x, centerPos.y, textureKey);
            tutSprite.setFrame(data.frame);

            tutSprite.setOrigin(0.5, 0.5);
            tutSprite.displayWidth = w;
            tutSprite.displayHeight = h;

            if(needsTutIcon)
            {
                // and, of course, the icon of the thing to which it refers in top left/right corners
                // (would normally do this by hand in Affinity, but my laptop just can't handle it anymore)
                const offsetFromCenter = 0.4*w;
                const offsetFromTop = 0.1*h;
                const tutIconSize = CONFIG.tutorials.cornerIconSize * w;
                const positions = [
                    new Point(centerPos.x - offsetFromCenter, realPos.y + offsetFromTop),
                    new Point(centerPos.x + offsetFromCenter, realPos.y + offsetFromTop)
                ]
                for(let i = 0; i < 2; i++)
                {
                    const tutIcon = this.game.add.sprite(positions[i].x, positions[i].y, cell.mainType + "_spritesheet")
                    tutIcon.setFrame(data.frame);
                    tutIcon.setOrigin(0.5);
                    tutIcon.displayWidth = tutIconSize;
                    tutIcon.displayHeight = tutIconSize;
                }
            }


            return;
        }

        // ingredients / machines display their custom sprite big in the center
        if(cell.mainType == "ingredient" || cell.mainType == "machine")
        {
            if(cell.mainType == "machine")
            {
                const bg = this.game.add.sprite(centerPos.x, centerPos.y, "custom_spritesheet");
                bg.setFrame(CUSTOM.machineBG.frame);
                bg.setOrigin(0.5);
                bg.displayWidth = w;
                bg.displayHeight = h;
            }

            const iconScale = CONFIG.board.iconScale;
            const sprite = this.game.add.sprite(centerPos.x, centerPos.y, cell.mainType + "_spritesheet");
            sprite.setFrame(data.frame);
            sprite.setOrigin(0.5, 0.5);
            sprite.displayWidth = iconScale * w;
            sprite.displayHeight = iconScale * h;

            // if they have extra data (money number or fixed fingers) ...
            if(cell.hasExtraData())
            {
                // display the background frame
                const extraFrameScale = CONFIG.board.extraFrameScale;
                const extraFrame = this.game.add.sprite(centerPos.x, realPos.y + 0.75*h, "custom_spritesheet");
                extraFrame.setOrigin(0.5, 0.5);
                extraFrame.displayWidth = extraFrameScale * w;
                extraFrame.displayHeight = extraFrameScale * h;

                const displayMoney = cell.hasNum();
                const displayFixedFingers = cell.hasFixedFingers() && CONFIG.expansions.fixedFingers;
                const contentPos = realPos.clone().move(new Point(0.35*w, 0.75*h));
                if(displayMoney)
                {
                    extraFrame.setFrame(CUSTOM.moneyFrame.frame);

                    const textConfig:any = CONFIG.board.moneyTextConfigTiny;
                    const fontSize = (textConfig.fontScaleFactor * this.cellSizeUnit);
                    textConfig.fontSize = fontSize + "px";
                    textConfig.strokeThickness = fontSize * 0.1;

                    const num = cell.getNum();
                    const text = this.game.add.text(contentPos.x, contentPos.y, num.toString(), textConfig);
                    text.setOrigin(0.5);
                }
                else if(displayFixedFingers)
                {
                    extraFrame.setFrame(CUSTOM.fingerFrame.frame);
                    
                    const f = new FixedFingers(cell.getFixedFingers());
                    const handPos = contentPos.clone();
                    const handHeight = extraFrame.displayHeight;
                    handPos.x = centerPos.x;
                    f.display(this, handPos, handHeight);
                }

            }
            return;
        }

        // money displays its icon (at the top) and text (at the bottom)
        if(cell.mainType == "money")
        {
            const bg = this.game.add.sprite(centerPos.x, centerPos.y, "custom_spritesheet");
            bg.setFrame(CUSTOM.moneyBG.frame);
            bg.setOrigin(0.5);
            bg.displayWidth = w;
            bg.displayHeight = h;

            const moneySpriteScale = CONFIG.board.moneySpriteScale;
            const moneySprite = this.game.add.sprite(centerPos.x, realPos.y + 0.33*h, "custom_spritesheet");
            moneySprite.setFrame(CUSTOM.moneyIcon.frame);
            moneySprite.setOrigin(0.5, 0.5);
            moneySprite.displayWidth = moneySpriteScale * w;
            moneySprite.displayHeight = moneySpriteScale * h;

            const textConfig:any = CONFIG.board.moneyTextConfig;
            const fontSize = (textConfig.fontScaleFactor * this.cellSizeUnit);
            textConfig.fontSize = fontSize + "px";
            textConfig.strokeThickness = fontSize * 0.1;

            const num = cell.getNum();
            const text = this.game.add.text(centerPos.x, realPos.y + 0.66*h, num.toString(), textConfig);
            text.setOrigin(0.5, 0.5);

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
        graphics.lineStyle(lineWidth, lineColor, lineAlpha);
        const rect = new Geom.Rectangle(this.outerMargin.x, this.outerMargin.y, this.boardDimensions.x, this.boardDimensions.y);
        graphics.strokeRectShape(rect);
    }

    hasOuterMargin()
    {
        return this.outerMargin.x > 0.003 || this.outerMargin.y > 0.003
    }

}