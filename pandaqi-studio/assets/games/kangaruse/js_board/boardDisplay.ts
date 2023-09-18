// @ts-ignore
import { Geom, Display } from "js/pq_games/phaser.esm"
import CellDisplay from "./cellDisplay"
import Point from "js/pq_games/tools/geometry/point";
import smoothPath from "js/pq_games/tools/geometry/paths/smoothPath"
import { GENERAL } from "../js_shared/dictionary"
import CONFIG from "./config"
import SideBar from "./sideBar"
import BoardState from "./boardState"

export default class BoardDisplay
{
    game:any
    originalPaperDimensions:Point
    paperDimensions:Point
    gapToSidebar:number
    outerMargin:Point
    boardDimensions:Point

    cellSize:Point
    cellSizeUnit:number
    dims:Point
    board:BoardState
    graphics: any;
    boardPadding: Point;

	constructor(game:any)
	{
		this.game = game;

        this.originalPaperDimensions = new Point(this.game.canvas.width, this.game.canvas.height);
        this.paperDimensions = this.originalPaperDimensions.clone();

        if(this.needSideBar())
        {
            this.gapToSidebar = CONFIG.sideBar.gap * this.originalPaperDimensions.x;
            this.paperDimensions.x *= (1.0 - CONFIG.sideBar.percentageOfBoardWidth);
        }

        const outerMarginFactor = CONFIG.board.outerMarginFactor;
        this.outerMargin = new Point(
            this.paperDimensions.x * outerMarginFactor.x, 
            this.paperDimensions.y * outerMarginFactor.y 
        );

        const padding = CONFIG.board.padding * Math.min(this.originalPaperDimensions.x, this.originalPaperDimensions.y);
        this.boardPadding = new Point(padding);

        this.boardDimensions = new Point(
            this.paperDimensions.x - 2*this.outerMargin.x - 2*this.boardPadding.x, 
            this.paperDimensions.y - 2*this.outerMargin.y - 2*this.boardPadding.y
        );
    }

    needSideBar()
    {
        return CONFIG.sideBarType != "no";
    }

    convertToRealUnits(pos)
    {
        return pos.clone().scale(this.cellSize).move(this.getAnchorPos());
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

        this.graphics = this.game.add.graphics();

        this.drawBackground(board);
        this.drawRivers(board);
        this.drawCells(board);
        this.drawRowColumnCommands(board);
        this.drawSidebar(board);
    }
    
    drawBackground(board:BoardState)
    {
        const col = CONFIG.inkFriendly ? 0xFFFFFF : CONFIG.board.backgroundColor;
        this.graphics.fillStyle(col);
        this.graphics.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }

    drawRivers(board)
    {
        const rivers = board.rivers;
        const cfg = CONFIG.board.rivers;
        const lw = cfg.lineWidth * this.cellSizeUnit;
        const col = CONFIG.inkFriendly ? cfg.colorInkfriendly : cfg.color;
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

    drawCells(board:BoardState)
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

    drawRowColumnCommands(board:BoardState)
    {
        const dims = board.getDimensions();
        const colOffset = CONFIG.board.numbers.offsetFromGrid * this.cellSizeUnit;
        const colData = board.columnData;
        const anchorPos = this.getAnchorPos();
        for(let i = 0; i < dims.x; i++)
        {
            const x = anchorPos.x + (i + 0.5) * this.cellSize.x;
            const yTop = anchorPos.y - colOffset;
            const yBelow = anchorPos.y + this.boardDimensions.y + colOffset;
            const positions = [new Point().setXY(x, yTop), new Point().setXY(x,yBelow)];
            
            this.drawGridCommandsAt(colData[i], positions);
        }

        // ROWS = Directions
        const rowOffset = CONFIG.board.dirs.offsetFromGrid * this.cellSizeUnit;
        const rowData = board.rowData;
        for(let i = 0; i < dims.y; i++)
        {
            const y = anchorPos.y + (i + 0.5) * this.cellSize.y;
            const xTop = anchorPos.x - rowOffset;
            const xBelow = anchorPos.x + this.boardDimensions.x + rowOffset;
            const positions = [new Point().setXY(xTop, y), new Point().setXY(xBelow, y)];

            this.drawGridCommandsAt(rowData[i], positions);
        }
    }

    getAnchorPos() : Point
    {
        return this.outerMargin.clone().add(this.boardPadding);
    }

    drawGridCommandsAt(val:number|string, positions:Point[])
    {
        for(const pos of positions)
        {
            this.drawGridCommandAt(val, pos);
        }
    }

    drawGridCommandAt(val:number|string, pos:Point)
    {
        // @ts-ignore
        if(!isNaN(parseInt(val))) { return this.drawNumberAt(val as number, pos); }
        this.drawDirAt(val as string, pos);
    }

    drawNumberAt(num:number, pos:Point)
    {
        var txtCfg = CONFIG.board.numbers.textConfig;
        txtCfg.fontSize = (CONFIG.board.numbers.scaleFactor * this.cellSizeUnit) + "px";

        const txt = this.game.add.text(pos.x, pos.y, num.toString(), txtCfg);
        txt.setOrigin(0.5);
    }

    drawDirAt(dir:string, pos:Point)
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

    drawSidebar(board:BoardState)
    {
        if(!this.needSideBar()) { return; }
        const s = new SideBar(this, board);
    }

}