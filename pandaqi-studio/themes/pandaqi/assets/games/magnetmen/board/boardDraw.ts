
import { Vector2, MaterialVisualizer, ResourceGroup, fillResourceGroup, getPositionsCenteredAround, Rectangle, LayoutOperation, ResourceShape, Color, TextConfig, TextAlign, RectangleRounded, fromArray, ResourceText, colorDarken } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { MISC } from "../shared/dict";
import BoardState from "./boardState";

// Takes in a BoardState, draws it
export default class BoardDraw
{
    sizeUnit: number;

    originBoard: Vector2; // "board" refers to both the grid of icons _and_ the player inventories
    originGrid: Vector2; // "grid" refers only to the grid of icons
    originSidebar: Vector2;

    boardSize: Vector2;
    gridSize: Vector2;
    inventorySize: Vector2;
    sidebarSize: Vector2;

    cellSize: Vector2;
    cellSizeHalf: Vector2;
    cellSizeUnit: number;
    fullSize: Vector2;

    board:BoardState;

    constructor(board:BoardState)
    {
        this.board = board;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.prepareDraw();
        this.prepare(vis);
        this.drawBackground(vis, group);
        this.drawBoard(vis, group);
        this.drawSidebar(vis, group);
        return await vis.finishDraw(group);
    }

    prepare(vis:MaterialVisualizer)
    {
        const fullSize = vis.size;
        const fullSizeUnit = Math.min(fullSize.x, fullSize.y);
        const edgeMargin = vis.get("edgeMargin").clone().scale(fullSizeUnit);

        const innerSize = fullSize.clone().sub(edgeMargin.clone().scale(2));

        const sidebarSize = new Vector2(innerSize.x * vis.get("sidebar.width"), innerSize.y);
        let extraSidebarMargin = vis.get("sidebar.extraMargin") * fullSizeUnit;
        if(!CONFIG._settings.includeRules.value) { sidebarSize.x = 0; extraSidebarMargin = 0; }

        const boardSize = new Vector2(innerSize.x - sidebarSize.x - extraSidebarMargin, innerSize.y);
        const boardSizeUnit = Math.min(boardSize.x, boardSize.y);

        const inventoryHeight = vis.get("inventories.height") * boardSize.y;
        const extraInventoryMargin = vis.get("inventories.extraMargin") * fullSizeUnit;
        const inventorySize = new Vector2(boardSizeUnit - 2*inventoryHeight -2*extraInventoryMargin, inventoryHeight); // this is for horizontal variant; verticals are just flipped = rotated
        const inventoryMargin = new Vector2(inventorySize.y + extraInventoryMargin)
        const gridSize = boardSize.clone().sub(inventoryMargin.clone().scale(2));

        this.fullSize = fullSize;
        this.sizeUnit = fullSizeUnit;
        this.originBoard = edgeMargin;
        this.originGrid = this.originBoard.clone().move(inventoryMargin);
        this.originSidebar = new Vector2(this.originBoard.x + innerSize.x - sidebarSize.x, this.originBoard.y);

        this.boardSize = boardSize;
        this.gridSize = gridSize;
        this.inventorySize = inventorySize;
        this.sidebarSize = sidebarSize;

        this.cellSize = gridSize.clone().div(this.board.size);
        this.cellSizeHalf = this.cellSize.clone().scale(0.5);
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const bgColor = vis.inkFriendly ? "#FFFFFF" : vis.get("bgColor");
        fillResourceGroup(this.fullSize, group, bgColor);
    }

    convertGridPosToRealPos(pos:Vector2)
    {
        return this.originGrid.clone().add( pos.clone().scale(this.cellSize) );
    }

    drawBoard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // draw the inventories
        const invStrokeWidth = vis.get("inventories.strokeWidth") * this.cellSizeUnit;
        const inventoryCenters = [
            new Vector2(this.originBoard.x + 0.5*this.boardSize.x, this.originBoard.y + 0.5*this.inventorySize.y),
            new Vector2(this.originBoard.x + this.boardSize.x - 0.5*this.inventorySize.y, this.originBoard.y + 0.5 * this.boardSize.y),
            new Vector2(this.originBoard.x + 0.5*this.boardSize.x, this.originBoard.y + this.boardSize.y - 0.5*this.inventorySize.y),
            new Vector2(this.originBoard.x + 0.5 * this.inventorySize.y, this.originBoard.y + 0.5*this.boardSize.y),
        ];

        const numInventorySlots = vis.get("inventories.numSlots")[CONFIG._settings.boardSize.value];
        const slotDims = new Vector2(this.inventorySize.x / numInventorySlots, this.inventorySize.y);
        for(let i = 0; i < 4; i++)
        {
            const inventoryDir = (i == 0 || i == 2) ? Vector2.RIGHT : Vector2.DOWN;
            const slotDimsTemp = (i == 0 || i == 2) ? slotDims : new Vector2(slotDims.y, slotDims.x);
            const positions = getPositionsCenteredAround({
                pos: inventoryCenters[i],
                num: numInventorySlots,
                size: slotDimsTemp,
                dir: inventoryDir
            })

            for(let pos of positions)
            {
                const rect = new Rectangle({ center: Vector2.ZERO, extents: slotDimsTemp });
                const rectOp = new LayoutOperation({
                    pos: pos,
                    fill: "#FFFFFF",
                    stroke: "#000000",
                    strokeWidth: invStrokeWidth,
                })
                group.add(new ResourceShape(rect), rectOp);
            }
        }

        const bgColorLightness = vis.get("cells.bgColorLightness");
        const bgColorDarken = vis.get("cells.bgColorDarken");
        const bgColorSaturation = vis.inkFriendly ? 0 : 100;
        const bgColor = new Color(Math.random()*360, bgColorSaturation, bgColorLightness);

        // for each cell, simply draw its rectangle (boundaries/cell) and its icon
        const cellStrokeWidth = vis.get("cells.strokeWidth") * this.cellSizeUnit;
        for(const cell of this.board.cells)
        {
            const pos = this.convertGridPosToRealPos(cell.pos);
            const posCenter = pos.clone().add(this.cellSizeHalf);

            const isOddCell = (cell.pos.x + cell.pos.y) % 2 == 1;
            let col = bgColor.clone();
            if(isOddCell) { col = colorDarken(col, bgColorDarken); }

            const rect = new Rectangle({ center: Vector2.ZERO, extents: this.cellSize });
            const rectOp = new LayoutOperation({
                pos: posCenter,
                fill: col,
                stroke: "#000000",
                strokeWidth: cellStrokeWidth,
            })
            group.add(new ResourceShape(rect), rectOp);

            const iconData = CONFIG.allTypes[cell.type];
            const icon = vis.getResource(iconData.textureKey);
            const iconDims = new Vector2(vis.get("cells.iconSize") * this.cellSizeUnit);
            const iconOp = new LayoutOperation({
                frame: iconData.frame,
                pos: posCenter,
                size: iconDims,
                pivot: Vector2.CENTER
            })
            group.add(icon, iconOp);
        }

        // draw slight decoration on top
        const cornerRes = vis.getResource("misc");
        const frame = MISC.corner_magnet.frame;
        const corners = [
            this.originGrid.clone(),
            new Vector2(this.originGrid.x + this.gridSize.x, this.originGrid.y),
            new Vector2(this.originGrid.x + this.gridSize.x, this.originGrid.y + this.gridSize.y),
            new Vector2(this.originGrid.x, this.originGrid.y + this.gridSize.y)
        ]
        const size = new Vector2(0.7 * this.cellSizeUnit);

        for(let i = 0; i < corners.length; i++)
        {
            const rot = 0.5 * Math.PI * i;
            let offset = new Vector2(-1,-1).rotate(rot);
            const pos = corners[i].move(offset.scale(-0.3725 * size.x));

            const cornerOp = new LayoutOperation({
                frame: frame,
                pos: pos,
                rot: rot,
                size: size,
                pivot: Vector2.CENTER
            });
            group.add(cornerRes, cornerOp);
        }
    }

    drawSidebar(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!CONFIG._settings.includeRules.value) { return; }

        // tutorial image at the top
        const tut = vis.getResource("sidebar");
        const tutWidth = this.sidebarSize.x;
        const tutDims = new Vector2(tutWidth, vis.get("sidebar.tutImageRatio") * tutWidth);
        const frame = CONFIG.beginnerMode ? 0 : 1;
        const tutOp = new LayoutOperation({
            frame: frame,
            pos: this.originSidebar,
            size: tutDims
        })
        group.add(tut, tutOp);

        // specific types explained below that
        const uniqueTypes = this.board.uniqueTypes;
        const ySpaceLeft = this.sidebarSize.y - tutDims.y;
        const maxYSpacePerItem = ySpaceLeft / uniqueTypes.length;
        const yPadding = vis.get("sidebar.iconYPadding") * maxYSpacePerItem;

        const iconDims = new Vector2(maxYSpacePerItem - yPadding);
        const iconDimsWithPadding = iconDims.clone().scale(vis.get("sidebar.iconScale"));
        const xPadding = vis.get("sidebar.iconPadding") * this.sidebarSize.x;
        const iconSimpleDims = iconDims.clone().scale(vis.get("sidebar.iconSimpleScale"));
        const entryDims = new Vector2(this.sidebarSize.x, iconDims.y);
        const textDims = entryDims.clone().sub(new Vector2(iconDims.x + 2*xPadding, 0));

        let pos = this.originSidebar.clone().move(new Vector2(0, tutDims.y));

        const fontSize = Math.min(vis.get("sidebar.fontSize") * textDims.y, vis.get("sidebar.maxFontSize"));
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            lineHeight: vis.get("sidebar.lineHeight"),
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE,
            resLoader: vis.resLoader
        })

        const rectOp = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: 4
        });
        const borderRadius = 0.1*iconDims.x;

        for(const type of uniqueTypes)
        {
            // draw the icon
            const data = CONFIG.allTypes[type];
            const icon = vis.getResource(data.textureKey);
            const iconPos = pos.clone().move(new Vector2(iconDims).scale(0.5));
            iconPos.x += xPadding;
            const iconOp = new LayoutOperation({
                frame: data.frame,
                pos: iconPos,
                size: iconDimsWithPadding,
                pivot: Vector2.CENTER
            })

            const rect = new RectangleRounded({ center: iconPos, extents: iconDims, radius: borderRadius });
            group.add(new ResourceShape(rect), rectOp);
            group.add(icon, iconOp);

            // draw the simplified icon on top
            const iconSimple = vis.getResource(data.textureKey + "_simplified");
            const iconSimplePos = iconPos.clone().move(new Vector2(iconDims).scale(-0.4));
            const iconSimpleOp = new LayoutOperation({
                frame: data.frame,
                pos: iconSimplePos,
                size: iconSimpleDims,
                pivot: Vector2.CENTER,
            })

            const rectSimple = new RectangleRounded({ center: iconSimplePos, extents: iconSimpleDims.clone().scale(1.1), radius: borderRadius });
            group.add(new ResourceShape(rectSimple), rectOp);
            group.add(iconSimple, iconSimpleOp);
            
            // add the text explaining how it scores
            let text = data.desc;
            if(Array.isArray(text)) { text = fromArray(text); }
            const textRes = new ResourceText({ text: text, textConfig: textConfig });
            const textPos = new Vector2(iconPos.x + 0.5*iconDims.x + xPadding, pos.y + 0.5*textDims.y);
            
            const innerTextPos = textPos.clone().move(new Vector2(xPadding, 0));
            const innerTextDims = textDims.clone().sub(new Vector2(xPadding*2, 0)); 

            const textOp = new LayoutOperation({
                fill: "#000000",
                size: innerTextDims,
                pos: innerTextPos,
                pivot: new Vector2(0, 0.5)
            })

            const rectCenter = new Vector2(textPos.x + 0.5*textDims.x, textPos.y);
            const rectText = new RectangleRounded({ center: rectCenter, extents: textDims, radius: borderRadius });
            group.add(new ResourceShape(rectText), rectOp);
            group.add(textRes, textOp);

            pos.y += iconDims.y + yPadding;
        }
    }
}