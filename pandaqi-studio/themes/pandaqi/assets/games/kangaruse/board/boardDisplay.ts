
import { Vector2, MaterialVisualizer, fillResourceGroup, ResourceGroup, Color, LayoutOperation, smoothPath, Path, ResourceShape, TextConfig, StrokeAlign, ResourceText } from "lib/pq-games";
import { GENERAL } from "../shared/dict";
import BoardState from "./boardState";
import CellDisplay from "./cellDisplay";
import { CONFIG } from "./config";
import SideBar from "./sideBar";
export default class BoardDisplay
{
    originalPaperDimensions:Vector2
    paperDimensions:Vector2
    gapToSidebar:number
    outerMargin:Vector2
    boardDimensions:Vector2

    cellSize:Vector2
    cellSizeUnit:number
    size:Vector2
    board:BoardState
    graphics: any;
    boardPadding: Vector2;

	constructor(bs:BoardState)
	{
        this.board = bs;
    }

    needSideBar()
    {
        return CONFIG._settings.sideBarType.value != "no";
    }

    convertToRealUnits(pos:Vector2)
    {
        return pos.clone().scale(this.cellSize).move(this.getAnchorPos());
    }

    async draw(vis: MaterialVisualizer)
    {        
        this.originalPaperDimensions = vis.size;
        this.paperDimensions = this.originalPaperDimensions.clone();

        if(this.needSideBar())
        {
            this.gapToSidebar = CONFIG.sideBar.gap * this.originalPaperDimensions.x;
            this.paperDimensions.x *= (1.0 - CONFIG.sideBar.percentageOfBoardWidth);
        }

        const outerMarginFactor = CONFIG.board.outerMarginFactor;
        this.outerMargin = new Vector2(
            this.paperDimensions.x * outerMarginFactor.x, 
            this.paperDimensions.y * outerMarginFactor.y 
        );

        const padding = CONFIG.board.padding * Math.min(this.originalPaperDimensions.x, this.originalPaperDimensions.y);
        this.boardPadding = new Vector2(padding);

        this.boardDimensions = new Vector2(
            this.paperDimensions.x - 2*this.outerMargin.x - 2*this.boardPadding.x, 
            this.paperDimensions.y - 2*this.outerMargin.y - 2*this.boardPadding.y
        );

        this.size = this.board.getDimensions();
        this.cellSize = new Vector2(
            this.boardDimensions.x / this.size.x, 
            this.boardDimensions.y / this.size.y 
        );
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        const group = vis.prepareDraw();

        const colBG = vis.inkFriendly ? "#FFFFFF" : CONFIG.board.backgroundColor;
        fillResourceGroup(vis.size, group, colBG);

        this.drawRivers(vis, group);
        this.drawCells(vis, group);
        this.drawRowColumnCommands(vis, group);
        this.drawSidebar(vis, group);

        return await vis.finishDraw(group);
    }
    
    drawRivers(vis: MaterialVisualizer, group: ResourceGroup)
    {
        const rivers = this.board.rivers;
        const cfg = CONFIG.board.rivers;
        const lw = cfg.lineWidth * this.cellSizeUnit;
        const col = vis.inkFriendly ? cfg.colorInkfriendly : cfg.color;
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

    drawCells(vis: MaterialVisualizer, group: ResourceGroup)
    {
        const cells = this.board.getGridFlat();
        const cellsDisplayed = [];
        for(const cell of cells)
        {
            var display = new CellDisplay(cell);
            display.draw(vis, group, this);
            cellsDisplayed.push(display);
        }
    }

    drawRowColumnCommands(vis: MaterialVisualizer, group: ResourceGroup)
    {
        const size = this.board.getDimensions();
        const colOffset = CONFIG.board.numbers.offsetFromGrid * this.cellSizeUnit;
        const colData = this.board.columnData;
        const anchorPos = this.getAnchorPos();
        for(let i = 0; i < size.x; i++)
        {
            const x = anchorPos.x + (i + 0.5) * this.cellSize.x;
            const yTop = anchorPos.y - colOffset;
            const yBelow = anchorPos.y + this.boardDimensions.y + colOffset;
            const positions = [new Vector2(x, yTop), new Vector2(x,yBelow)];
            
            this.drawGridCommandsAt(vis, group, colData[i], positions);
        }

        // ROWS = Directions
        const rowOffset = CONFIG.board.dirs.offsetFromGrid * this.cellSizeUnit;
        const rowData = this.board.rowData;
        for(let i = 0; i < size.y; i++)
        {
            const y = anchorPos.y + (i + 0.5) * this.cellSize.y;
            const xTop = anchorPos.x - rowOffset;
            const xBelow = anchorPos.x + this.boardDimensions.x + rowOffset;
            const positions = [new Vector2(xTop, y), new Vector2(xBelow, y)];

            this.drawGridCommandsAt(vis, group, rowData[i], positions);
        }
    }

    getAnchorPos() : Vector2
    {
        return this.outerMargin.clone().add(this.boardPadding);
    }

    drawGridCommandsAt(vis: MaterialVisualizer, group: ResourceGroup, val:number|string, positions:Vector2[])
    {
        let counter = 0;
        for(const pos of positions)
        {
            this.drawGridCommandAt(vis, group, val, pos, counter);
            counter++;
        }
    }

    drawGridCommandAt(vis: MaterialVisualizer, group: ResourceGroup, val:number|string, pos:Vector2, side:number)
    {
        // @ts-ignore
        if(!isNaN(parseInt(val))) { return this.drawNumberAt(vis, group, val as number, pos, side); }
        this.drawDirAt(vis, group, val as string, pos);
    }

    drawNumberAt(vis: MaterialVisualizer, group: ResourceGroup, num:number, pos:Vector2, side:number)
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
            size: new Vector2(3*fontSize),
            fill: txtCfg.color,
            stroke: txtCfg.stroke,
            strokeWidth: 0.5*txtCfg.strokeThickness,
            strokeAlign: StrokeAlign.OUTSIDE,
            rot: rot,
            pivot: Vector2.CENTER
        })

        const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
        group.add(resText, opText);
    }

    drawDirAt(vis: MaterialVisualizer, group: ResourceGroup, dir:string, pos:Vector2)
    {
        const dirInt = CONFIG.board.dirs.options.indexOf(dir);
        const rot = dirInt * 0.5 * Math.PI;

        const size = CONFIG.board.dirs.scaleFactor * this.cellSizeUnit;
        const res = vis.getResource("general_spritesheet");
        const op = new LayoutOperation({
            pos: pos,
            rot: rot,
            pivot: Vector2.CENTER,
            size: new Vector2(size),
            frame: GENERAL.dir.frame
        })
        group.add(res, op);
    }

    drawSidebar(vis: MaterialVisualizer, group: ResourceGroup)
    {
        if(!this.needSideBar()) { return; }
        const s = new SideBar(this, this.board);
        s.draw(vis, group, this, this.board);
    }

}