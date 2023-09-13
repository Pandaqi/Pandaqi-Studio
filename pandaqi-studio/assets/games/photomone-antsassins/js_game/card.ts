import Point from "./shapes/point"
import Rectangle from "./shapes/rectangle"
import Triangle from "./shapes/triangle"
import Hexagon from "./shapes/hexagon"
import Random from "js/pq_games/tools/random/main"
import Canvas from "js/pq_games/canvas/main"
import { ALMOST_ACTIONS } from "./dict"
import CONFIG from "./config"
import createContext from "js/pq_games/canvas/createContext"
import CanvasOperation from "js/pq_games/canvas/canvasOperation"

type Cell = Rectangle|Triangle|Hexagon;

export default class Card 
{
    ctx: CanvasRenderingContext2D
    id: number
    // @TODO
    size: import("c:/Users/Tiamo/Documents/Programming/Websites/Pandaqi/Pandaqi Studio/pandaqi-studio/assets/js/pq_games/tools/geometry/point").Point
    sizeSquare: number
    gridSize: import("c:/Users/Tiamo/Documents/Programming/Websites/Pandaqi/Pandaqi Studio/pandaqi-studio/assets/js/pq_games/tools/geometry/point").Point
    cellSize: number
    innerCellSize: number
    offset: Point
    innerOffset: Point
    grid: Cell[][]
    possibleAlmostActions: {}
    startingTeam: string

    getCanvas() { return this.ctx.canvas; }
    constructor(id:number)
    {
        this.id = id;

        this.setupCanvas();
        this.setupGrid();
        this.prepareAlmostActions();
        this.assignRoles();
        this.visualize();

        if(CONFIG.cards.debug) { document.body.appendChild(this.ctx.canvas); }
    }

    setupCanvas()
    {
        const size = CONFIG.cards.size;
        this.size = size;
        this.sizeSquare = Math.min(size.x, size.y);
        this.ctx = createContext({ width: size.x, height: size.y, alpha: true, willReadFrequently: false });
		this.ctx.clearRect(0, 0, size.x, size.y);

        this.ctx.strokeStyle = CONFIG.cards.strokeStyle;
        this.ctx.lineWidth = CONFIG.cards.lineWidth * this.sizeSquare;

        const bgColor = CONFIG.inkFriendly ? CONFIG.cards.fillStyleInkfriendly : CONFIG.cards.fillStyle;
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, size.x, size.y);
        this.ctx.strokeRect(0, 0, size.x, size.y);

        this.gridSize = CONFIG.cards.grid;

        const margin = Math.min(size.x, size.y)*CONFIG.cards.innerMargin;
        const innerSize = new Point(size.x - margin, size.y - margin);

        const shp = CONFIG.tileShape
        const fakeSize = innerSize.clone();
        if(shp == "triangle") {
            fakeSize.x /= 0.5;
            fakeSize.y /= 0.85; 
        } else if(shp == "hexagon") {
            fakeSize.x /= (0.5*3/2);
            fakeSize.y /= (0.5*Math.sqrt(3));
            fakeSize.y -= 0.5*(fakeSize.y/this.gridSize.y); // that one offset column
        }

        this.cellSize = Math.min(fakeSize.x/this.gridSize.x, fakeSize.y/this.gridSize.y);
        this.innerCellSize = this.cellSize*(1.0 - CONFIG.cards.cells.margin);

        const spaceUsed = new Point(this.cellSize*this.gridSize.x, this.cellSize*this.gridSize.y);
        spaceUsed.x *= (innerSize.x / fakeSize.x);
        spaceUsed.y *= (innerSize.y / fakeSize.y);

        const spaceLeft = new Point(size.x - spaceUsed.x, size.y - spaceUsed.y);
        this.offset = new Point(0.5*spaceLeft.x, 0.5*spaceLeft.y);
        this.innerOffset = new Point(0.5*(this.cellSize - this.innerCellSize), 0.5*(this.cellSize - this.innerCellSize));
    }

    getFlatGrid() { return this.grid.flat(); }
    getCellTypes()
    {
        const arr = [];
        const cells = this.getFlatGrid();
        for(const cell of cells)
        {
            arr.push(cell.getTeam())
        }
        return arr;
    }
    setupGrid()
    {
        const grid = [];
        this.grid = grid;
        for(let x = 0; x < this.gridSize.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < this.gridSize.y; y++)
            {
                const p = new Point(x,y);
                const c = this.createNewCell(p);
                c.setGrid(p.clone());
                grid[x][y] = c;
            }
        }
    }

    createNewCell(p)
    {
        const centerPos = this.offset.clone();
        const radius = 0.5*this.cellSize;

        const innerExtents = new Point(this.innerCellSize, this.innerCellSize);
        const innerRadius = 0.5*this.innerCellSize;

        const shp = CONFIG.tileShape
        if(shp == "rectangle")
        {
            centerPos.x += (p.x + 0.5)*this.cellSize;
            centerPos.y += (p.y + 0.5)*this.cellSize;
            return new Rectangle(centerPos, innerExtents);
        }
        else if(shp == "triangle")
        {
            const horizontalSpacing = radius; // size * 0.5
            const verticalSpacing = radius * 1.66; // size * 0.85

            centerPos.x += (p.x + 0.5)*horizontalSpacing; // triangles can be squished into half size
            centerPos.y += (p.y + 0.5)*verticalSpacing;
            const pointyTop = ((p.x + p.y) % 2 == 1);
            return new Triangle(centerPos, innerRadius, pointyTop);
        }
        else if(shp == "hexagon")
        {
            const horizontalSpacing = radius * (3/2);
            const verticalSpacing = radius * Math.sqrt(3);

            centerPos.x += (p.x + 0.5)*horizontalSpacing;
            centerPos.y += (p.y + 0.5)*verticalSpacing;

            const offsetColumn = p.x % 2 == 1;
            if(offsetColumn) { centerPos.y += 0.5*verticalSpacing; }
            return new Hexagon(centerPos, innerRadius);
        }
    }

    outOfBounds(pos)
    {
        return pos.x < 0 || pos.x >= this.gridSize.x || pos.y < 0 || pos.y >= this.gridSize.y;
    }

    getNeighborsOf(cells : Cell[]) : Cell[]
    {
        const nbs : Set<Cell> = new Set();
        for(const cell of cells)
        {
            const nbCoords = cell.getNeighbors();
            for(const coords of nbCoords)
            {
                if(this.outOfBounds(coords)) { continue; }
                const nb = this.grid[coords.x][coords.y];
                nbs.add(nb);
            }
        }
        return Array.from(nbs);
    }

    assignRoles()
    {
        const cells = this.getFlatGrid();
        Random.shuffle(cells);

        // assign the secret tiles for each team
        const numTeams = CONFIG.numTeamsOnCodeCard;
        const numSecretTiles = CONFIG.numSecretTilesPerTeam;

        console.log("[Photomone] Creating secret tiles");

        for(let i = 0; i < numTeams; i++)
        {
            const teamKey = "team" + i;
            for(let j = 0; j < numSecretTiles; j++)
            {
                const c = cells.pop();
                c.setTeam(teamKey);
                c.setType("secret");
            }
        }

        console.log("[Photomone] Creating almost tiles");

        // create Almost tiles for each team
        const almostTilesPerTeam = CONFIG.cards.almostTilesPerTeam;
        const actionProb = CONFIG.cards.actionProb;
        const addAlmostActions = CONFIG.addAlmostActions;
        for(let i = 0; i < numTeams; i++)
        {
            const teamKey = "team" + i;
            const possibleTiles = this.getAlmostTilesForTeam(i);
            const numAlmostTiles = Math.min(possibleTiles.length, almostTilesPerTeam);
            Random.shuffle(possibleTiles);
            for(let j = 0; j < numAlmostTiles; j++)
            {
                const c = possibleTiles.pop();
                if(!c) { break; }

                c.setTeam(teamKey);
                c.setType("almost");

                const addAction = (Math.random() <= actionProb) && addAlmostActions;
                if(!addAction) { continue; }

                const action = this.getRandomAlmostAction();
                c.setAction(action)
            }
        }

        console.log("[Photomone] Creating antsassins");

        // add antsassins
        const numAssassins = CONFIG.cards.numAssassins;
        const minDistanceToAssassin = CONFIG.cards.minDistToAssassinTile;
        const possibleTiles = this.getTilesWithDistanceToTeams(minDistanceToAssassin);
        const numTiles = Math.min(possibleTiles.length, numAssassins)
        for(let i = 0; i < numTiles; i++)
        {
            const c = possibleTiles.pop();
            c.setTeam("antsassin");
        }

        console.log("[Photomone] Filling up neutral tiles");

        // fill up the rest
        for(const c of cells)
        {
            if(c.getTeam()) { continue; }
            c.setTeam("neutral");
        }
    }

    closestDistanceToSecretTile(targetCell)
    {
        let closestDist = Infinity;
        const cells = this.getFlatGrid();
        for(const cell of cells)
        {
            if(cell.getType() != "secret") { continue; }
            let dist = Math.abs(targetCell.gridPos.x - cell.gridPos.x) + Math.abs(targetCell.gridPos.y - cell.gridPos.y);
            closestDist = Math.min(dist, closestDist);
        }
        return closestDist;
    }

    getTilesWithDistanceToTeams(minDist)
    {
        const cells = this.getFlatGrid();
        const arr = [];
        for(const cell of cells)
        {
            if(cell.getTeam()) { continue; }
            const dist = this.closestDistanceToSecretTile(cell);
            if(dist < minDist) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    prepareAlmostActions()
    {
        const numBounds = CONFIG.cards.numUniqueAlmostActions;
        const num = Random.rangeInteger(numBounds.min, numBounds.max);
        const dict = structuredClone(ALMOST_ACTIONS);
        const actions = {};
        for(let i = 0; i < num; i++)
        {
            const type = Random.getWeighted(dict, "prob");
            actions[type] = dict[type];
            delete dict[type];
        }
        this.possibleAlmostActions = actions;
    }

    getRandomAlmostAction()
    {
        return Random.getWeighted(this.possibleAlmostActions, "prob")
    }

    getSecretTilesForTeam(teamNum)
    {
        const cells = this.getFlatGrid();
        const teamKey = "team" + teamNum; // @TODO: just store the NUMBER, not add team before it each time?
        const arr = [];
        for(const cell of cells)
        {
            if(cell.getType() != "secret") { continue; }
            if(cell.getTeam() != teamKey) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    getAlmostTilesForTeam(teamNum:number) : Cell[]
    {
        const arr : Set<Cell> = new Set();
        const secretTiles = this.getSecretTilesForTeam(teamNum);
        const almostTypes = ["row", "column", "adjacent"];
        const cells = this.getFlatGrid();

        for(const secretTile of secretTiles)
        {
            for(const cell of cells)
            {
                if(cell.getTeam()) { continue; }

                if(almostTypes.includes("row"))
                {
                    if(cell.gridPos.x == secretTile.gridPos.x) { arr.add(cell); }
                }

                if(almostTypes.includes("column"))
                {
                    if(cell.gridPos.y == secretTile.gridPos.y) { arr.add(cell); }
                }
            }

            if(almostTypes.includes("adjacent"))
            {
                const nbs = this.getNeighborsOf([secretTile]);
                for(const nb of nbs) { 
                    if(nb.getTeam()) { continue; }
                    arr.add(nb); 
                }
            }
        }

        return Array.from(arr);
    }

    visualize()
    {
        this.visualizeCells();
        this.visualizeStartingTeam();
    }

    visualizeCells()
    {
        const ctx = this.ctx;
        const cells = this.getFlatGrid();
        const drawPattern = !CONFIG.inkFriendly;
        for(const cell of cells)
        {
            ctx.save();

            const boundingBox = cell.getBoundingBox();
            const team = cell.getTeam();
            const type = cell.getType();
            const centerPos = cell.getCenter();
            
            let color = this.getTeamColor(team, type);
            let strokeStyle = CONFIG.cards.cells.strokeStyle;
            let lineWidth = CONFIG.cards.cells.lineWidth * this.sizeSquare;

            let shadowColor = color;
            let shadowBlur = CONFIG.cards.cells.shadowBlur * this.sizeSquare;
            if(type == "secret") { 
                shadowBlur = CONFIG.cards.cells.shadowBlurSecretTile * this.sizeSquare; 
                shadowColor = "#000000";
                strokeStyle = "#FFFFFF";
                lineWidth *= 2;
            }
            
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.fillStyle = color;

            // create tile (fill and outline)
            ctx.beginPath();
            for(const p of cell.getEdgePoints()) 
            {
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            ctx.clip();
             
            // add pattern (if needed and available)
            const bgPattern = CONFIG.cards.bgPatterns[team];
            if(bgPattern && drawPattern) { 
                const helperCanvas = document.createElement("canvas");
                helperCanvas.width = boundingBox.width;
                helperCanvas.height = boundingBox.height;

                const helperContext = helperCanvas.getContext("2d");
                helperContext.drawImage(bgPattern, 0, 0, boundingBox.width, boundingBox.height);
                //ctx.createPattern(helperCanvas, "repeat"); 

                ctx.drawImage(helperCanvas, centerPos.x - 0.5*boundingBox.width, centerPos.y - 0.5*boundingBox.height);
            }

            // add action icon (if needed)
            if(type == "almost" && cell.getAction())
            {
                let spriteSize = CONFIG.cards.actionSpriteSize*Math.min(boundingBox.width, boundingBox.height);
                if(CONFIG.tileShape == "triangle") { spriteSize *= 0.75; } // simply less space in triangles, so compensate

                const res = CONFIG.resLoader.getResource("almostActions");
                const canvOp = new CanvasOperation({
                    frame: ALMOST_ACTIONS[cell.getAction()].frame,
                    translate: centerPos,
                    dims: new Point(spriteSize)
                })
                res.drawTo(ctx, canvOp);
            }

            ctx.restore();
        }
    }
    
    getTeamColor(team = "team0", type = "secret")
    {
        let color = CONFIG.cards.teamColors[team];
        if(CONFIG.inkFriendly) { color = CONFIG.cards.teamColorsInkFriendly[team]; }

        if(type == "almost")
        {
            color = CONFIG.cards.almostColors[team];
            if(CONFIG.inkFriendly) { color = CONFIG.cards.almostColorsInkFriendly[team]; }
        }

        return color;
    }

    getStartingTeamColor() 
    { 
        return this.getTeamColor("team" + this.startingTeam); 
    }

    visualizeStartingTeam()
    {
        const ctx = this.ctx;
        const innerScale = CONFIG.cards.startingTeam.innerScale;
        const extents = new Point(innerScale*this.size.x, innerScale*this.size.y);
        const centerPos = new Point(0.5*this.size.x, 0.5*this.size.y);
        const outlineRect = new Rectangle(centerPos, extents);
        const numTeams = CONFIG.numTeamsOnCodeCard;

        ctx.lineWidth = CONFIG.cards.startingTeam.lineWidth * this.sizeSquare;

        // outline rectangle
        let curTeam = 0;
        let edgePoints = outlineRect.getEdgePoints();
        for(let i = 0; i < edgePoints.length; i++)
        {
            const p1 = edgePoints[i];
            const p2 = edgePoints[(i + 1) % edgePoints.length];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.strokeStyle = this.getTeamColor("team" + i);
            ctx.stroke();

            curTeam = (curTeam + 1) % numTeams;
        }

        // triangles in the edges
        // @TODO: how to color them? now that there's no starting team and outline has different color edges?
        const diagonalSize = Math.sqrt(Math.pow(0.5*this.size.x, 2) + Math.pow(0.5*this.size.x, 2));
        const triangleSize = 2 * this.sizeSquare * (1.0 - innerScale);
        ctx.fillStyle = "#111111";
        for(let i = 0; i < 4; i++)
        {
            ctx.save();
            const a = i * 0.5*Math.PI;
            const angle = 0.25*Math.PI + a;
            const x = Math.cos(angle) * diagonalSize;
            const y = Math.sin(angle) * diagonalSize;
            ctx.translate(centerPos.x + x, centerPos.y + y);
            ctx.rotate(a);
            ctx.beginPath();
            ctx.lineTo(0,0);
            ctx.lineTo(-triangleSize, 0);
            ctx.lineTo(0, -triangleSize);
            ctx.fill();
            ctx.restore();
        }
    }
}