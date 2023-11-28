import Point from "js/pq_games/tools/geometry/point";
import BoardState from "./boardState";
import CONFIG from "../js_shared/config";
import { rectToPhaserObject } from "js/pq_games/phaser/shapeToPhaserObject";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import imageToPhaser from "js/pq_games/phaser/imageToPhaser";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import textToPhaser from "js/pq_games/phaser/textToPhaser";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import RectangleRounded from "js/pq_games/tools/geometry/rectangleRounded";
import shapeToPhaser from "js/pq_games/phaser/shapeToPhaser";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import Color from "js/pq_games/layout/color/color";
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

    async draw(canvas:HTMLCanvasElement, bs:BoardState)
    {
        this.prepareDimensions(canvas, bs);
        await this.drawBackground(canvas, bs);
        await this.drawBoard(canvas, bs);
        await this.drawSidebar(canvas, bs);
    }

    prepareDimensions(canvas:HTMLCanvasElement, bs:BoardState)
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

        const inventoryHeight = CONFIG.draw.inventories.height*boardSize.y;
        const extraInventoryMargin = CONFIG.draw.inventories.extraMargin*fullSizeUnit;
        const inventorySize = new Point(boardSizeUnit - 2*inventoryHeight -2*extraInventoryMargin, inventoryHeight); // this is for horizontal variant; verticals are just flipped = rotated
        const inventoryMargin = new Point(inventorySize.y + extraInventoryMargin)
        const gridSize = boardSize.clone().sub(inventoryMargin.clone().scale(2));

        this.fullSize = fullSize;
        this.sizeUnit = fullSizeUnit;
        this.originBoard = edgeMargin;
        this.originGrid = this.originBoard.clone().move(inventoryMargin);
        this.originSidebar = new Point(this.originBoard.x + innerSize.x - sidebarSize.x, this.originBoard.y);

        this.boardSize = boardSize;
        this.gridSize = gridSize;
        this.inventorySize = inventorySize;
        this.sidebarSize = sidebarSize;

        this.cellSize = gridSize.clone().div(bs.dims);
        this.cellSizeHalf = this.cellSize.clone().scale(0.5);
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);
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
        return this.originGrid.clone().add( pos.clone().scale(this.cellSize) );
    }

    async drawBoard(canv:HTMLCanvasElement, bs:BoardState)
    {

        // draw the inventories
        const invStrokeWidth = CONFIG.draw.inventories.strokeWidth * this.cellSizeUnit;
        const inventoryCenters = [
            new Point(this.originBoard.x + 0.5*this.boardSize.x, this.originBoard.y + 0.5*this.inventorySize.y),
            new Point(this.originBoard.x + this.boardSize.x - 0.5*this.inventorySize.y, this.originBoard.y + 0.5 * this.boardSize.y),
            new Point(this.originBoard.x + 0.5*this.boardSize.x, this.originBoard.y + this.boardSize.y - 0.5*this.inventorySize.y),
            new Point(this.originBoard.x + 0.5 * this.inventorySize.y, this.originBoard.y + 0.5*this.boardSize.y),
        ];

        const numInventorySlots = CONFIG.draw.inventories.numSlots[CONFIG.boardSize];
        const slotDims = new Point(this.inventorySize.x / numInventorySlots, this.inventorySize.y);
        for(let i = 0; i < 4; i++)
        {
            const inventoryDir = (i == 0 || i == 2) ? Point.RIGHT : Point.DOWN;
            const slotDimsTemp = (i == 0 || i == 2) ? slotDims : new Point(slotDims.y, slotDims.x);
            const positions = getPositionsCenteredAround({
                pos: inventoryCenters[i],
                num: numInventorySlots,
                dims: slotDimsTemp,
                dir: inventoryDir
            })

            for(let pos of positions)
            {
                const rect = new Rectangle({ center: new Point(), extents: slotDimsTemp });
                const rectOp = new LayoutOperation({
                    translate: pos,
                    fill: "#FFFFFF",
                    stroke: "#000000",
                    strokeWidth: invStrokeWidth,
                    pivot: Point.CENTER
                })
                await new ResourceShape(rect).toCanvas(canv, rectOp);
            }
        }

        const bgColorLightness = CONFIG.draw.cells.bgColorLightness;
        const bgColorDarken = CONFIG.draw.cells.bgColorDarken;
        const bgColorSaturation = CONFIG.inkFriendly ? 0 : 100;
        const bgColor = new Color(Math.random()*360, bgColorSaturation, bgColorLightness);

        // for each cell, simply draw its rectangle (boundaries/cell) and its icon
        const cellStrokeWidth = CONFIG.draw.cells.strokeWidth * this.cellSizeUnit;
        for(const cell of bs.cells)
        {
            const pos = this.convertGridPosToRealPos(cell.pos);
            const posCenter = pos.clone().add(this.cellSizeHalf);

            const isOddCell = (cell.pos.x + cell.pos.y) % 2 == 1;
            let col = bgColor.clone();
            if(isOddCell) { col = col.darken(bgColorDarken); }

            const rect = new Rectangle({ center: new Point(), extents: this.cellSize });
            const rectOp = new LayoutOperation({
                translate: posCenter,
                fill: col,
                stroke: "#000000",
                strokeWidth: cellStrokeWidth,
                pivot: Point.CENTER
            })
            await new ResourceShape(rect).toCanvas(canv, rectOp);

            const iconData = CONFIG.allTypes[cell.type];
            const icon = CONFIG.resLoader.getResource(iconData.textureKey);
            const iconDims = new Point(CONFIG.draw.cells.iconSize * this.cellSizeUnit);
            const iconOp = new LayoutOperation({
                frame: iconData.frame,
                translate: posCenter,
                dims: iconDims,
                pivot: Point.CENTER
            })
            await icon.toCanvas(canv, iconOp);
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
        const iconSimpleDims = iconDims.clone().scale(CONFIG.draw.sidebar.iconSimpleScale);
        const entryDims = new Point(this.sidebarSize.x, iconDims.y);
        const textDims = entryDims.clone().sub(new Point(iconDims.x + 2*xPadding, 0));

        let pos = this.originSidebar.clone().move(new Point(0, tutDims.y));

        const fontSize = Math.min(CONFIG.draw.sidebar.fontSize * textDims.y, CONFIG.draw.sidebar.maxFontSize);
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            lineHeight: CONFIG.draw.sidebar.lineHeight,
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE    
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

            // draw the simplified icon on top
            const iconSimple = CONFIG.resLoader.getResource(data.textureKey + "_simplified");
            const iconSimplePos = iconPos.clone().move(new Point(iconDims).scale(-0.4));
            const iconSimpleOp = new LayoutOperation({
                frame: data.frame,
                translate: iconSimplePos,
                dims: iconSimpleDims,
                pivot: Point.CENTER,
            })

            const rectSimple = new RectangleRounded({ center: iconSimplePos, extents: iconSimpleDims.clone().scale(1.1), radius: borderRadius });
            await new ResourceShape(rectSimple).toCanvas(canv, rectOp);
            await iconSimple.toCanvas(canv, iconSimpleOp);

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
                pivot: new Point(0, 0.5)
            })

            const rectCenter = new Point(textPos.x + 0.5*textDims.x, textPos.y);
            const rectText = new RectangleRounded({ center: rectCenter, extents: textDims, radius: borderRadius });
            await new ResourceShape(rectText).toCanvas(canv, rectOp);
            await textRes.toCanvas(canv, textOp);
            
            pos.y += iconDims.y + yPadding;
        }
    }
}