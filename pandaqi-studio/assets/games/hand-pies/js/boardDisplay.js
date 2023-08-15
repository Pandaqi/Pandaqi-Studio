import { Geom, Display } from "js/pq_games/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"
import smoothPath from "js/pq_games/tools/geometry/smoothPath"

export default class BoardDisplay
{
	constructor(game)
	{
		this.game = game;
        this.cfg = this.game.cfg;
        this.cfgBoard = this.cfg.board;
        this.resolutionPerCell = this.cfgBoard.resolutionPerCell;

        this.paperDimensions = { x: this.game.canvas.width, y: this.game.canvas.height };
	}

    draw(board)
    {
        const grid = board.getGrid();
        
        this.board = board;
        this.dims = board.getDimensions();
        this.cellSize = { 
            x: this.paperDimensions.x / this.dims.x, 
            y: this.paperDimensions.y / this.dims.y 
        };
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        // draws the grid and fills in the squares
        const lines = this.createGridLines(this.dims);
        console.log(Object.assign({}, lines));
        const linesRandomized = this.randomizeGridLines(lines);
        const linesSmoothed = this.smoothLines(linesRandomized);
        console.log(Object.assign({}, linesSmoothed));
        this.fillInCells(linesSmoothed);
        this.strokeLines(linesSmoothed);
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
            let staticCoordinates = a * resolutionPerCell * offsetPerStep[nonVariableAxis];
            curPoint[variableAxis] = 0;
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
            finalPoint[variableAxis] = this.paperDimensions[variableAxis];
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
                        if(cell.getType() == "tutorial") { isTutorial = true;  }
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
        const x = Math.floor(p.x / this.cellSize.x);
        const y = Math.floor(p.y / this.cellSize.y);
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

        // @TODO: get actual fill style from cell type
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFF00FF, 0xFFFF00, 0x00FFFF]

        for(let x = 0; x < this.dims.x; x++)
        {
            for(let y = 0; y < this.dims.y; y++)
            {
                console.log(x,y);
                console.log(this.dims.x, this.dims.y);
                console.log(lines);

                const set1 = this.getLineChunk(lines.x[y], x*distBetweenAnchors, (x+1)*distBetweenAnchors);
                const set2 = this.getLineChunk(lines.y[x+1], y*distBetweenAnchors, (y+1)*distBetweenAnchors);
                const set3 = this.getLineChunk(lines.x[y+1], (x+1)*distBetweenAnchors, x*distBetweenAnchors);
                const set4 = this.getLineChunk(lines.y[x], (y+1)*distBetweenAnchors, y*distBetweenAnchors);

                graphics.fillStyle(colors[Math.floor(Math.random() * colors.length)]);

                const polygon = new Geom.Polygon(set1.concat(set2).concat(set3).concat(set4));
                graphics.fillPoints(polygon.points, true)
            }
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

}