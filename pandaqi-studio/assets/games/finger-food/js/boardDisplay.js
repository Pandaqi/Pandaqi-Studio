import { Geom, Display } from "js/pq_games/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"
import smoothPath from "js/pq_games/tools/geometry/smoothPath"
import { MAIN_TYPES } from "./dictionary"

export default class BoardDisplay
{
	constructor(game)
	{
		this.game = game;
        this.cfg = this.game.cfg;
        this.cfgBoard = this.cfg.board;
        this.resolutionPerCell = this.cfgBoard.resolutionPerCell;

        this.paperDimensions = { x: this.game.canvas.width, y: this.game.canvas.height };

        const outerMarginFactor = this.cfgBoard.outerMarginFactor;
        this.outerMargin = { x: this.paperDimensions.x * outerMarginFactor.x, y: this.paperDimensions.y * outerMarginFactor.y };
        this.boardDimensions = { x: this.paperDimensions.x - 2*this.outerMargin.x, y: this.paperDimensions.y - 2*this.outerMargin.y };
	}

    draw(board)
    {        
        this.board = board;
        this.dims = board.getDimensions();
        this.cellSize = { 
            x: this.boardDimensions.x / this.dims.x, 
            y: this.boardDimensions.y / this.dims.y 
        };
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        // draws the grid and fills in the squares
        const lines = this.createGridLines(this.dims);
        const linesRandomized = this.randomizeGridLines(lines);
        const linesSmoothed = this.smoothLines(linesRandomized);
        const polygons = this.fillInCells(linesSmoothed);
        this.strokeLines(linesSmoothed);

        // draws the custom images or properties of each cell
        this.displayCells(polygons);

        // finishing touches
        this.drawBoardEdge();
    }

    createGridLines()
    {
        const offsetPerStep = { x: this.cellSize.x / this.resolutionPerCell, y: this.cellSize.y / this.resolutionPerCell };
        const lines = { 
            x: this.createSubdividedLines("x", this.dims, this.resolutionPerCell, offsetPerStep),
            y: this.createSubdividedLines("y", this.dims, this.resolutionPerCell, offsetPerStep)
        }
        return lines;
    }

    createSubdividedLines(variableAxis, dims, resolutionPerCell, offsetPerStep)
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
            let curPoint = new Point();
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

            let finalPoint = new Point();
            finalPoint[variableAxis] = this.outerMargin[variableAxis] + this.boardDimensions[variableAxis];
            finalPoint[nonVariableAxis] = staticCoordinates;
            finalPoint.metadata = { edge: true, cells: this.getCellsConnectedToRealPoint(variableAxis, finalPoint) };
            line.push(finalPoint.clone());

            lines.push(line);
        }
        return lines;
    } 

    randomizeGridLines(lines)
    {
        const maxVariation = this.cfgBoard.maxGridLineVariation * this.cellSizeUnit;
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

    getCellsConnectedToRealPoint(axis, p)
    {
        const gridPointBelow = this.convertRealPointToGridPoint(p);
        let gridPointAbove = gridPointBelow.clone().add(new Point().setXY(0,-1))
        if(axis == "y") { gridPointAbove = gridPointBelow.clone().add(new Point().setXY(-1,0)); }
        
        const arr = [];
        if(this.board.getCellAt(gridPointBelow)) { arr.push(this.board.getCellAt(gridPointBelow)); }
        if(this.board.getCellAt(gridPointAbove)) { arr.push(this.board.getCellAt(gridPointAbove)); }
        return arr;
    }

    convertRealPointToGridPoint(p)
    {
        const x = Math.floor((p.x - this.outerMargin.x) / this.cellSize.x);
        const y = Math.floor((p.y - this.outerMargin.y) / this.cellSize.y);
        return new Point().setXY(x,y);
    }

    convertGridPointToRealPoint(p)
    {
        const x = p.x * this.cellSize.x + this.outerMargin.x;
        const y = p.y * this.cellSize.y + this.outerMargin.y;
        return new Point().setXY(x,y);
    }

    smoothLines(lines)
    {
        const smoothingResolution = this.cfgBoard.smoothingResolution;
        const newLines = {};
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

    strokeLines(lines)
    {
        const graphics = this.game.add.graphics();
        const lineWidth = this.cfgBoard.grid.lineWidth * this.cellSizeUnit;
        const lineColor = this.cfgBoard.grid.lineColor;
        const lineAlpha = this.cfgBoard.grid.lineAlpha;
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

    fillInCells(lines)
    {
        const graphics = this.game.add.graphics();
        const smoothingResolution = this.cfgBoard.smoothingResolution;
        const distBetweenAnchors = smoothingResolution * this.resolutionPerCell;

        const polygons = [];

        for(let x = 0; x < this.dims.x; x++)
        {
            polygons[x] = [];

            for(let y = 0; y < this.dims.y; y++)
            {
                const cell = this.board.getCellAt(new Point().setXY(x,y));
                let backgroundColor = cell.color || 0xFFFFFF;
                if(cell.mainType == "machine") { backgroundColor = this.cfgBoard.defaultBackgroundMachines; }
                else if(cell.mainType == "money") { backgroundColor = this.cfgBoard.defaultBackgroundMoney; }

                const set1 = this.getLineChunk(lines.x[y], x*distBetweenAnchors, (x+1)*distBetweenAnchors);
                const set2 = this.getLineChunk(lines.y[x+1], y*distBetweenAnchors, (y+1)*distBetweenAnchors);
                const set3 = this.getLineChunk(lines.x[y+1], (x+1)*distBetweenAnchors, x*distBetweenAnchors);
                const set4 = this.getLineChunk(lines.y[x], (y+1)*distBetweenAnchors, y*distBetweenAnchors);

                graphics.fillStyle(backgroundColor);

                const polygon = new Geom.Polygon(set1.concat(set2).concat(set3).concat(set4));
                graphics.fillPoints(polygon.points, true);

                polygons.push(polygon);
            }
        }
    }

    displayCells(polygons)
    {
        for(let x = 0; x < this.dims.x; x++)
        {
            for(let y = 0; y < this.dims.y; y++)
            {
                this.displayCell(new Point().setXY(x,y));                
            }
        }
    }

    displayCell(point)
    {
        const cell = this.board.getCellAt(point);
        const data = this.getTypeData(cell);
        const w = this.cellSize.x, h = this.cellSize.y;
        const realPos = this.convertGridPointToRealPoint(point);
        const centerPos = realPos.clone().add(new Point().setXY(0.5*w, 0.5*h));

        // tutorials get a custom square frame to mark them as such
        if(cell.isTutorial())
        {
            const bgSprite = this.game.add.sprite(centerPos.x, centerPos.y, "custom_spritesheet");
            bgSprite.setFrame(0);
            bgSprite.setOrigin(0.5, 0.5);
            bgSprite.displayWidth = w;
            bgSprite.displayHeight = h;

            // then a custom image (matching frame from spritesheet) with the actual explanation
            let textureKey = "tutorials_spritesheet";
            if(cell.mainType == "ingredient" || cell.mainType == "machine") {
                textureKey = cell.mainType + "_tutorials_spritesheet";
            }

            let tutSprite = this.game.add.sprite(centerPos.x, centerPos.y, textureKey);
            tutSprite.setFrame(data.frame);

            tutSprite.setOrigin(0.5, 0.5);
            tutSprite.displayWidth = w;
            tutSprite.displayHeight = h;

            return;
        }

        // ingredients / machines display their custom sprite big in the center
        if(cell.mainType == "ingredient" || cell.mainType == "machine")
        {
            const iconScale = this.cfgBoard.iconScale;
            const sprite = this.game.add.sprite(centerPos.x, centerPos.y, cell.mainType + "_spritesheet");
            sprite.setFrame(data.frame);
            sprite.setOrigin(0.5, 0.5);
            sprite.displayWidth = iconScale * w;
            sprite.displayHeight = iconScale * h;

            // if they have extra data (money number or fixed fingers) ...
            if(cell.hasExtraData())
            {
                // display the background frame
                const extraFrameScale = this.cfgBoard.extraFrameScale;
                const extraFrame = this.game.add.sprite(centerPos.x, realPos.y + 0.75*h, "custom_spritesheet");
                extraFrame.setOrigin(0.5, 0.5);
                extraFrame.displayWidth = extraFrameScale * w;
                extraFrame.displayHeight = extraFrameScale * h;

                const displayMoney = cell.hasNum();
                const displayFixedFingers = cell.hasFixedFingers();
                if(displayMoney)
                {
                    extraFrame.setFrame(3);

                    const textConfig = this.cfgBoard.moneyTextConfigTiny;
                    const fontSize = (textConfig.fontScaleFactor * this.cellSizeUnit);
                    textConfig.fontSize = fontSize + "px";
                    textConfig.strokeThickness = fontSize * 0.1;

                    const num = cell.getNum();
                    const text = this.game.add.text(realPos.x + 0.35*w, realPos.y + 0.75*h, num.toString(), textConfig);
                    text.setOrigin(0.5);
                }

                if(displayFixedFingers)
                {
                    extraFrame.setFrame(4);
                    // @TODO: not sure yet
                }

            }
            return;
        }

        // money displays its icon (at the top) and text (at the bottom)
        if(cell.mainType == "money")
        {
            const moneySpriteScale = this.cfgBoard.moneySpriteScale;
            const moneySprite = this.game.add.sprite(centerPos.x, realPos.y + 0.33*h, "custom_spritesheet");
            moneySprite.setFrame(5);
            moneySprite.setOrigin(0.5, 0.5);
            moneySprite.displayWidth = moneySpriteScale * w;
            moneySprite.displayHeight = moneySpriteScale * h;

            const textConfig = this.cfgBoard.moneyTextConfig;
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

    drawBoardEdge()
    {
        if(!this.hasOuterMargin()) { return; }

        const lineWidth = this.cfgBoard.outerEdge.lineWidth * this.cellSizeUnit;
        const lineColor = this.cfgBoard.outerEdge.lineColor;
        const lineAlpha = this.cfgBoard.outerEdge.lineAlpha;

        const graphics = this.game.add.graphics();
        graphics.lineStyle(lineWidth, lineColor, lineAlpha);
        const rect = new Geom.Rectangle(this.outerMargin.x, this.outerMargin.y, this.boardDimensions.x, this.boardDimensions.y);
        graphics.strokeRectShape(rect);
    }

    hasOuterMargin()
    {
        return this.outerMargin.x > 0.003 || this.outerMargin.y > 0.003
    }

    getTypeData(cell)
    {
        console.log(cell);
        return MAIN_TYPES[cell.mainType].DICT[cell.subType];
    }

}