import Point from "js/pq_games/tools/geometry/point";
import BoardState from "./boardState";
import CONFIG from "../js_shared/config";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import RectangleRounded from "js/pq_games/tools/geometry/rectangleRounded";
import Color from "js/pq_games/layout/color/color";
import Circle from "js/pq_games/tools/geometry/circle";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import ColorLike from "js/pq_games/layout/color/colorLike";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";

// Takes in a BoardState, draws it
export default class BoardDraw
{
    sizeUnit: number;

    originBoard: Point; // "board" refers to both the grid of icons _and_ the player inventories
    originGrid: Point; // "grid" refers only to the grid of icons
    originSidebar: Point;

    boardSize: Point;
    gridSize: Point;
    inventorySize: Point;
    sidebarSize: Point;

    cellSize: Point;
    cellSizeHalf: Point;
    cellSizeUnit: number;
    fullSize: Point;
    showTypeMetadata: boolean;

    async draw(canvas:any, bs:BoardState)
    {
        this.prepare(canvas, bs);
        await this.drawBackground(canvas, bs);
        await this.drawBoard(canvas, bs);
        await this.drawSidebar(canvas, bs);
    }

    prepare(canvas:any, bs:BoardState)
    {
        const fullSize = new Point(canvas.width, canvas.height);
        const fullSizeUnit = Math.min(fullSize.x, fullSize.y);
        const edgeMargin = CONFIG.draw.edgeMargin.clone().scale(fullSizeUnit);

        const innerSize = fullSize.clone().sub(edgeMargin.clone().scale(2));

        const sidebarSize = new Point(innerSize.x * CONFIG.draw.sidebar.width, innerSize.y);
        let extraSidebarMargin = CONFIG.draw.sidebar.extraMargin * fullSizeUnit;
        if(!CONFIG.includeRules) { sidebarSize.x = 0; extraSidebarMargin = 0; }

        const boardSize = new Point(innerSize.x - sidebarSize.x - extraSidebarMargin, innerSize.y);
        const boardSizeUnit = Math.min(boardSize.x, boardSize.y);

        this.fullSize = fullSize;
        this.sizeUnit = fullSizeUnit;
        this.originBoard = edgeMargin;
        this.originSidebar = new Point(this.originBoard.x + innerSize.x - sidebarSize.x, this.originBoard.y);

        this.boardSize = boardSize;
        this.sidebarSize = sidebarSize;

        this.cellSize = boardSize.clone().div(bs.dims);
        this.cellSizeHalf = this.cellSize.clone().scale(0.5);
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        let requiresMetadata = false;
        console.log("UNIQUE TYPES: ", bs.uniqueTypes);
        for(const type of bs.uniqueTypes)
        {
            if(CONFIG.allTypes[type].requiresMetadata) { requiresMetadata = true; break; }
        }

        this.showTypeMetadata = requiresMetadata;
    }

    async drawBackground(canv:HTMLCanvasElement, bs)
    {
        const rect = new Rectangle({ center: this.fullSize.clone().scale(0.5), extents: this.fullSize });
        const bgColor = CONFIG.inkFriendly ? "#FFFFFF" : CONFIG.draw.bgColor;
        const op = new LayoutOperation({
            fill: bgColor,
            pivot: Point.CENTER
        })
        await new ResourceShape(rect).toCanvas(canv, op);
    }

    convertGridPosToRealPos(pos:Point)
    {
        return this.originBoard.clone().add( pos.clone().scale(this.cellSize) );
    }

    async drawBoard(canv:HTMLCanvasElement, bs:BoardState)
    {
        const bgColorLightness = CONFIG.draw.cells.bgColorLightness;
        const bgColorDarken = CONFIG.draw.cells.bgColorDarken;
        const bgColorSaturation = CONFIG.inkFriendly ? 0 : 100;
        const bgColor = new Color(Math.random()*360, bgColorSaturation, bgColorLightness);

        const dotRadius = CONFIG.draw.cells.dotRadius * this.cellSizeUnit;
        const iconDims = new Point(CONFIG.draw.cells.iconSize * this.cellSizeUnit);
        const iconOffset = CONFIG.draw.cells.iconOffsetFromCenter * 0.5 * this.cellSizeUnit;
        const positions = [
            Point.DOWN.clone().scale(iconOffset),
            Point.LEFT.clone().scale(iconOffset),
            Point.UP.clone().scale(iconOffset),
            Point.RIGHT.clone().scale(iconOffset)
        ];

        const iconOp = new LayoutOperation({
            dims: iconDims,
            pivot: Point.CENTER,
        })

        const cellStrokeWidth = CONFIG.draw.cells.strokeWidth * this.cellSizeUnit;
        const rectOp = new LayoutOperation({
            stroke: "#000000",
            strokeWidth: cellStrokeWidth,
            pivot: Point.CENTER
        })

        // for each cell, 
        for(const cell of bs.cells)
        {
            // - draw its rectangle
            const pos = this.convertGridPosToRealPos(cell.pos);
            const posCenter = pos.clone().add(this.cellSizeHalf);

            const isOddCell = (cell.pos.x + cell.pos.y) % 2 == 1;
            let col = bgColor.clone();
            if(isOddCell) { col = col.darken(bgColorDarken); }

            const rect = new Rectangle({ center: new Point(), extents: this.cellSize });
            rectOp.translate = posCenter;
            rectOp.fill = new ColorLike(col);

            await new ResourceShape(rect).toCanvas(canv, rectOp);

            // - draw the writable dot in the center
            const circ = new Circle({ radius: dotRadius });
            rectOp.fill = new ColorLike("#FFFFFF");
            await new ResourceShape(circ).toCanvas(canv, rectOp);
        
            // - draw its 4 icons
            let counter = rangeInteger(0,3);
            for(const iconName of cell.icons)
            {
                const iconData = CONFIG.allTypes[iconName];
                const icon = CONFIG.resLoader.getResource(iconData.textureKey);
                const rotation = counter * 0.5 * Math.PI;
                const pos = posCenter.clone().move(positions[counter]);
                iconOp.frame = iconData.frame;
                iconOp.translate = pos;
                iconOp.rotation = rotation;

                await icon.toCanvas(canv, iconOp);
                counter = (counter + 1) % 4;
            }
            
        }
    }

    async drawSidebar(canv:HTMLCanvasElement, bs:BoardState)
    {
        if(!CONFIG.includeRules) { return; }

        // tutorial image at the top
        const tut = CONFIG.resLoader.getResource("sidebar");
        const tutWidth = this.sidebarSize.x;
        const tutDims = new Point(tutWidth, CONFIG.draw.sidebar.tutImageRatio * tutWidth);
        const tutOp = new LayoutOperation({
            translate: this.originSidebar,
            dims: tutDims
        })

        await tut.toCanvas(canv, tutOp);

        // specific types explained below that
        const uniqueTypes = bs.uniqueTypes; // @TODO: calculate automatically
        const ySpaceLeft = this.sidebarSize.y - tutDims.y;
        const maxYSpacePerItem = ySpaceLeft / uniqueTypes.length;
        const yPadding = CONFIG.draw.sidebar.iconYPadding * maxYSpacePerItem;

        const iconDims = new Point(maxYSpacePerItem - yPadding);
        const iconDimsWithPadding = iconDims.clone().scale(CONFIG.draw.sidebar.iconScale);
        const xPadding = CONFIG.draw.sidebar.iconPadding * this.sidebarSize.x;
        const entryDims = new Point(this.sidebarSize.x, iconDims.y);
        const textDims = entryDims.clone().sub(new Point(iconDims.x + 2*xPadding, 0));

        let pos = this.originSidebar.clone().move(new Point(0, tutDims.y));

        const fontSize = Math.min(CONFIG.draw.sidebar.fontSize * textDims.y, CONFIG.draw.sidebar.maxFontSize);
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            lineHeight: CONFIG.draw.sidebar.lineHeight,
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE ,
            resLoader: CONFIG.resLoader   
        })

        const rectOp = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: 4 // @TODO
        });
        const borderRadius = 0.1*iconDims.x;

        for(const type of uniqueTypes)
        {
            // draw the icon
            const data = CONFIG.allTypes[type];
            const icon = CONFIG.resLoader.getResource(data.textureKey);
            const iconPos = pos.clone().move(new Point(iconDims).scale(0.5));
            iconPos.x += xPadding;
            const iconOp = new LayoutOperation({
                frame: data.frame,
                translate: iconPos,
                dims: iconDimsWithPadding,
                pivot: Point.CENTER
            })

            const rect = new RectangleRounded({ center: iconPos, extents: iconDims, radius: borderRadius });
            await new ResourceShape(rect).toCanvas(canv, rectOp);
            await icon.toCanvas(canv, iconOp);

            // add the text explaining how it scores
            const text = data.desc;
            const textRes = new ResourceText({ text: text, textConfig: textConfig });
            const textPos = new Point(iconPos.x + 0.5*iconDims.x + xPadding, pos.y + 0.5*textDims.y);
            
            const innerTextPos = textPos.clone().move(new Point(xPadding, 0));
            const innerTextDims = textDims.clone().sub(new Point(xPadding*2, 0)); 

            const textOp = new LayoutOperation({
                fill: "#000000",
                dims: innerTextDims,
                translate: innerTextPos,
                pivot: new Point(0,0.5)
            })

            const rectCenter = new Point(textPos.x + 0.5*textDims.x, textPos.y);
            const rectText = new RectangleRounded({ center: rectCenter, extents: textDims, radius: borderRadius });
            await new ResourceShape(rectText).toCanvas(canv, rectOp);
            await textRes.toCanvas(canv, textOp);

            // @TODO: show the type metadata (HAZARD/ITEM) in some way
            if(this.showTypeMetadata)
            {

            }

            pos.y += iconDims.y + yPadding;
        }
    }
}