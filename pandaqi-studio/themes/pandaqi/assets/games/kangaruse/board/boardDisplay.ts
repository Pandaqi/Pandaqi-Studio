import { Vector2, MaterialVisualizer, fillResourceGroup, ResourceGroup, Color, LayoutOperation, smoothPath, Path, ResourceShape, TextConfig, StrokeAlign, ResourceText, getSetting } from "lib/pq-games";
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

    sideBarAnchor:Vector2
    sideBarDimensions:Vector2

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
        return getSetting("sideBarType", CONFIG) != "no";
    }

    convertToRealUnits(pos:Vector2)
    {
        return pos.clone().scale(this.cellSize).move(this.getAnchorPos());
    }

    // everything that only depends on the page size, so the `_drawing` values can be read relative to it
    prepare(vis: MaterialVisualizer)
    {
        this.originalPaperDimensions = vis.size;
        this.paperDimensions = vis.size.clone();

        this.gapToSidebar = 0;
        if(this.needSideBar())
        {
            this.gapToSidebar = vis.get("sideBar.gap");
            this.paperDimensions.x *= (1.0 - vis.get("sideBar.percentageOfBoardWidth"));
        }

        const outerMarginFactor = vis.get("board.outerMarginFactor");
        this.outerMargin = new Vector2(
            this.paperDimensions.x * outerMarginFactor.x, 
            this.paperDimensions.y * outerMarginFactor.y 
        );

        const padding = vis.get("board.padding");
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

        this.sideBarAnchor = new Vector2(
            this.getAnchorPos().x + this.boardDimensions.x + this.gapToSidebar, 
            this.outerMargin.y 
        );

        this.sideBarDimensions = new Vector2( 
            this.originalPaperDimensions.x - this.getAnchorPos().x - this.sideBarAnchor.x, 
            this.originalPaperDimensions.y - this.outerMargin.y*2 
        );

        vis.configurator.set("cellSizeUnit", this.cellSizeUnit);
        vis.configurator.set("sideBarWidth", this.sideBarDimensions.x);
        vis.configurator.set("sideBarHeight", this.sideBarDimensions.y);
    }

    async draw(vis: MaterialVisualizer)
    {        
        this.prepare(vis);

        const group = vis.prepareDraw();

        const colBG = vis.inkFriendly ? "#FFFFFF" : vis.get("board.backgroundColor");
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
        const lw = vis.get("board.rivers.lineWidth");
        const col = vis.inkFriendly ? vis.get("board.rivers.colorInkfriendly") : vis.get("board.rivers.color");
        const alpha = vis.get("board.rivers.alpha");

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
        const colOffset = vis.get("board.numbers.offsetFromGrid");
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
        const rowOffset = vis.get("board.dirs.offsetFromGrid");
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
        const fontSize = vis.get("board.numbers.fontSize");

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize
        }).alignCenter();

        const rot = (side == 1) ? Math.PI : 0;
        const opText = new LayoutOperation({
            pos: pos,
            size: new Vector2(3*fontSize),
            fill: vis.get("board.numbers.color"),
            stroke: vis.get("board.numbers.strokeColor"),
            strokeWidth: vis.get("board.numbers.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            rot: rot,
            pivot: Vector2.CENTER
        })

        const resText = new ResourceText({ text: num.toString(), textConfig: textConfig });
        group.add(resText, opText);
    }

    drawDirAt(vis: MaterialVisualizer, group: ResourceGroup, dir:string, pos:Vector2)
    {
        const dirInt = CONFIG.generation.board.dirs.options.indexOf(dir);
        const rot = dirInt * 0.5 * Math.PI;

        const size = vis.get("board.dirs.size");
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
