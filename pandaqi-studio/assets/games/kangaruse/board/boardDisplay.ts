import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import Color from "js/pq_games/layout/color/color";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";
import Path from "js/pq_games/tools/geometry/paths/path";
import smoothPath from "js/pq_games/tools/geometry/paths/smoothPath";
import Point from "js/pq_games/tools/geometry/point";
import { GENERAL } from "../shared/dictionary";
import BoardState from "./boardState";
import CellDisplay from "./cellDisplay";
import CONFIG from "./config";
import SideBar from "./sideBar";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";

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
    size:Point
    board:BoardState
    graphics: any;
    boardPadding: Point;

	constructor(game:any)
	{
		this.game = game;

        this.originalPaperDimensions = game.visualizer.size;
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

    convertToRealUnits(pos:Point)
    {
        return pos.clone().scale(this.cellSize).move(this.getAnchorPos());
    }

    draw(vis: BoardVisualizer, group: ResourceGroup, board:BoardState)
    {        
        this.board = board;
        this.size = board.getDimensions();
        this.cellSize = new Point(
            this.boardDimensions.x / this.size.x, 
            this.boardDimensions.y / this.size.y 
        );
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        const colBG = CONFIG.inkFriendly ? "#FFFFFF" : CONFIG.board.backgroundColor;
        fillResourceGroup(vis.size, group, colBG);

        this.drawRivers(vis, group, board);
        this.drawCells(vis, group, board);
        this.drawRowColumnCommands(vis, group, board);
        this.drawSidebar(vis, group, board);
    }
    
    drawRivers(vis: BoardVisualizer, group: ResourceGroup, board:BoardState)
    {
        const rivers = board.rivers;
        const cfg = CONFIG.board.rivers;
        const lw = cfg.lineWidth * this.cellSizeUnit;
        const col = CONFIG.inkFriendly ? cfg.colorInkfriendly : cfg.color;
        const alpha = cfg.alpha;

        const colorMod = new Color(col);
        colorMod.a = alpha;
        const opPath = new LayoutOperation({
            stroke: colorMod,
            strokeWidth: lw,
            depth: 100
        })

        for(const river of rivers)
        {
            const points = river.getAsLine(this);
            const pointsSmoothed = smoothPath({ path: points, resolution: 10 });
            const path = new Path(pointsSmoothed);
            group.add(new ResourceShape(path), opPath);
        }
    }

    drawCells(vis: BoardVisualizer, group: ResourceGroup, board:BoardState)
    {
        const cells = board.getGridFlat();
        const cellsDisplayed = [];
        for(const cell of cells)
        {
            var display = new CellDisplay(cell);
            display.draw(vis, group, this);
            cellsDisplayed.push(display);
        }
    }

    drawRowColumnCommands(vis: BoardVisualizer, group: ResourceGroup, board:BoardState)
    {
        const size = board.getDimensions();
        const colOffset = CONFIG.board.numbers.offsetFromGrid * this.cellSizeUnit;
        const colData = board.columnData;
        const anchorPos = this.getAnchorPos();
        for(let i = 0; i < size.x; i++)
        {
            const x = anchorPos.x + (i + 0.5) * this.cellSize.x;
            const yTop = anchorPos.y - colOffset;
            const yBelow = anchorPos.y + this.boardDimensions.y + colOffset;
            const positions = [new Point().setXY(x, yTop), new Point().setXY(x,yBelow)];
            
            this.drawGridCommandsAt(vis, group, colData[i], positions);
        }

        // ROWS = Directions
        const rowOffset = CONFIG.board.dirs.offsetFromGrid * this.cellSizeUnit;
        const rowData = board.rowData;
        for(let i = 0; i < size.y; i++)
        {
            const y = anchorPos.y + (i + 0.5) * this.cellSize.y;
            const xTop = anchorPos.x - rowOffset;
            const xBelow = anchorPos.x + this.boardDimensions.x + rowOffset;
            const positions = [new Point().setXY(xTop, y), new Point().setXY(xBelow, y)];

            this.drawGridCommandsAt(vis, group, rowData[i], positions);
        }
    }

    getAnchorPos() : Point
    {
        return this.outerMargin.clone().add(this.boardPadding);
    }

    drawGridCommandsAt(vis: BoardVisualizer, group: ResourceGroup, val:number|string, positions:Point[])
    {
        let counter = 0;
        for(const pos of positions)
        {
            this.drawGridCommandAt(vis, group, val, pos, counter);
            counter++;
        }
    }

    drawGridCommandAt(vis: BoardVisualizer, group: ResourceGroup, val:number|string, pos:Point, side:number)
    {
        // @ts-ignore
        if(!isNaN(parseInt(val))) { return this.drawNumberAt(vis, group, val as number, pos, side); }
        this.drawDirAt(vis, group, val as string, pos);
    }

    drawNumberAt(vis: BoardVisualizer, group: ResourceGroup, num:number, pos:Point, side:number)
    {
        const txtCfg = CONFIG.board.numbers.textConfig;
        const fontSize = (CONFIG.board.numbers.scaleFactor * this.cellSizeUnit);

        const textConfig = new TextConfig({
            font: txtCfg.fontFamily,
            size: fontSize
        }).alignCenter();

        const rot = (side == 1) ? Math.PI : 0;
        const opText = new LayoutOperation({
            pos: pos,
            size: new Point(3*fontSize),
            fill: txtCfg.color,
            stroke: txtCfg.stroke,
            strokeWidth: 0.5*txtCfg.strokeThickness,
            strokeAlign: StrokeAlign.OUTSIDE,
            rot: rot,
            pivot: Point.CENTER
        })

        const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
        group.add(resText, opText);
    }

    drawDirAt(vis: BoardVisualizer, group: ResourceGroup, dir:string, pos:Point)
    {
        const dirInt = CONFIG.board.dirs.options.indexOf(dir);
        const rot = dirInt * 0.5 * Math.PI;

        const size = CONFIG.board.dirs.scaleFactor * this.cellSizeUnit;
        const res = vis.getResource("general_spritesheet");
        const op = new LayoutOperation({
            pos: pos,
            rot: rot,
            pivot: Point.CENTER,
            size: new Point(size),
            frame: GENERAL.dir.frame
        })
        group.add(res, op);
    }

    drawSidebar(vis: BoardVisualizer, group: ResourceGroup, board:BoardState)
    {
        if(!this.needSideBar()) { return; }
        const s = new SideBar(this, board);
        s.draw(vis, group, this, board);
    }

}