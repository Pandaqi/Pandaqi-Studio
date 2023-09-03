import { Geom, Display } from "js/pq_games/phaser.esm"
import CellDisplay from "./cellDisplay"
import Point from "js/pq_games/tools/geometry/point";
import smoothPath from "js/pq_games/tools/geometry/smoothPath"
import { CONFIG, GENERAL } from "./dictionary"
import SideBar from "./sideBar"

export default class BoardDisplay
{
	constructor(game)
	{
		this.game = game;
        this.resolutionPerCell = CONFIG.board.resolutionPerCell;

        this.originalPaperDimensions = { x: this.game.canvas.width, y: this.game.canvas.height };
        this.paperDimensions = structuredClone(this.originalPaperDimensions);

        if(this.needSideBar())
        {
            this.gapToSidebar = CONFIG.sideBar.gap * this.originalPaperDimensions.x;
            this.paperDimensions.x *= (1.0 - CONFIG.sideBar.percentageOfBoardWidth);
        }

        const outerMarginFactor = CONFIG.board.outerMarginFactor;
        this.outerMargin = { x: this.paperDimensions.x * outerMarginFactor.x, y: this.paperDimensions.y * outerMarginFactor.y };
        this.boardDimensions = { x: this.paperDimensions.x - 2*this.outerMargin.x, y: this.paperDimensions.y - 2*this.outerMargin.y };
        

    }

    needSideBar()
    {
        return CONFIG.sideBar != "no";
    }

    convertToRealUnits(pos)
    {
        return pos.clone().scale(this.cellSize).move(this.outerMargin);
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

        this.drawRivers(board);
        this.drawCells(board);
        this.drawRowColumnCommands(board);
        this.drawSidebar(board);
    }

    drawRivers(board)
    {
        const rivers = board.rivers;
        const cfg = CONFIG.board.rivers;
        const lw = cfg.lineWidth * this.cellSizeUnit;
        const col = cfg.color;
        const alpha = cfg.alpha;

        var graphics = this.game.add.graphics();
        graphics.lineStyle(lw, col, alpha);

        for(const river of rivers)
        {
            const points = river.getAsLine(this);
            const pointsSmoothed = smoothPath({ path: points, resolution: 10 });

            const poly = new Geom.Polygon(pointsSmoothed);
            graphics.strokePoints(poly.points, false);
        }
    }

    drawCells(board)
    {
        const cells = board.getGridFlat();
        const cellsDisplayed = [];
        for(const cell of cells)
        {
            var display = new CellDisplay(cell);
            display.draw(this);
            cellsDisplayed.push(display);
        }
    }

    drawRowColumnCommands(board)
    {
        const dims = board.getDimensions();
        const colOffset = CONFIG.board.numbers.offsetFromGrid * this.cellSizeUnit;
        const colData = board.columnData;
        for(let i = 0; i < dims.x; i++)
        {
            const x = this.outerMargin.x + (i+0.5) * this.cellSize.x;
            const yTop = this.outerMargin.y - colOffset;
            const yBelow = this.outerMargin.y + this.boardDimensions.y + colOffset;
            const positions = [new Point().setXY(x, yTop), new Point().setXY(x,yBelow)];
            
            this.drawGridCommandsAt(colData[i], positions);
        }

        // ROWS = Directions
        const rowOffset = CONFIG.board.dirs.offsetFromGrid * this.cellSizeUnit;
        const rowData = board.rowData;
        for(let i = 0; i < dims.y; i++)
        {
            const y = this.outerMargin.y + (i+0.5) * this.cellSize.y;
            const xTop = this.outerMargin.x - rowOffset;
            const xBelow = this.outerMargin.x + this.boardDimensions.x + rowOffset;
            const positions = [new Point().setXY(xTop, y), new Point().setXY(xBelow, y)];

            this.drawGridCommandsAt(rowData[i], positions);
        }
    }

    drawGridCommandsAt(val, positions)
    {
        for(const pos of positions)
        {
            console.log(val);
            this.drawGridCommandAt(val, pos);
        }
    }

    drawGridCommandAt(val, pos)
    {
        if(isNaN(parseInt(val))) { this.drawDirAt(val, pos); }
        else { this.drawNumberAt(val, pos); }
    }

    drawNumberAt(num, pos)
    {
        var txtCfg = CONFIG.board.numbers.textConfig;
        txtCfg.fontSize = (CONFIG.board.numbers.scaleFactor * this.cellSizeUnit) + "px";

        const txt = this.game.add.text(pos.x, pos.y, num.toString(), txtCfg);
        txt.setOrigin(0.5);
    }

    drawDirAt(dir, pos)
    {
        const sprite = this.game.add.sprite(pos.x, pos.y, "general");
        sprite.setFrame(GENERAL.dir.frame);

        const dirInt = CONFIG.board.dirs.options.indexOf(dir);
        const rot = dirInt * 0.5 * Math.PI;
        sprite.setRotation(rot);
        sprite.setOrigin(0.5);

        var size = CONFIG.board.dirs.scaleFactor * this.cellSizeUnit;
        sprite.displayWidth = size;
        sprite.displayHeight = size;
    }

    drawSidebar(board)
    {
        if(!this.needSideBar()) { return; }
        const s = new SideBar(this, board);
    }

}