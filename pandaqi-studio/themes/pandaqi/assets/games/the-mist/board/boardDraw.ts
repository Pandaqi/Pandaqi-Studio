
import { Vector2, LayoutEffect, MaterialVisualizer, GrayScaleEffect, ResourceGroup, fillResourceGroup, LayoutOperation, Color, closePath, Path, ResourceShape, Rectangle, Circle, rangeInteger, fromArray, TextConfig, TextAlign, RectangleRounded, ResourceText, DropShadowEffect, getPositionsCenteredAround, colorDarken } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { COLORS, MISC } from "../shared/dict";
import BoardState from "./boardState";
import Cell from "./cell";

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
    showTypeMetadata: boolean;
    defaultEffects: LayoutEffect[];

    board:BoardState;

    constructor(bs:BoardState)
    {
        this.board = bs;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
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

        this.fullSize = fullSize;
        this.sizeUnit = fullSizeUnit;
        this.originBoard = edgeMargin;
        this.originSidebar = new Vector2(this.originBoard.x + innerSize.x - sidebarSize.x, this.originBoard.y);

        this.boardSize = boardSize;
        this.sidebarSize = sidebarSize;

        this.cellSize = boardSize.clone().div(this.board.size);
        this.cellSizeHalf = this.cellSize.clone().scale(0.5);
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        this.defaultEffects = [];
        if(vis.inkFriendly) { this.defaultEffects.push(new GrayScaleEffect()); }

        let requiresMetadata = false;
        console.log("UNIQUE TYPES: ", this.board.uniqueTypes);
        for(const type of this.board.uniqueTypes)
        {
            if(CONFIG.allTypes[type].requiresMetadata) { requiresMetadata = true; break; }
        }

        this.showTypeMetadata = requiresMetadata;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const bgColor = vis.inkFriendly ? "#FFFFFF" : vis.get("bgColor");
        fillResourceGroup(this.fullSize, group, bgColor);

        if(!vis.inkFriendly)
        {
            const resBG = vis.getResource("bg_map");
            const opBG = new LayoutOperation({
                pos: this.fullSize.clone().scale(0.5),
                size: this.fullSize.clone().scale(vis.get("bg.mapScale")),
                alpha: vis.get("bg.mapAlpha"),
                pivot: Vector2.CENTER,
                //composite: "color-burn"
            })
            group.add(resBG, opBG);
        }
    }

    convertGridPosToRealPos(pos:Vector2)
    {
        return this.originBoard.clone().add( pos.clone().scale(this.cellSize) );
    }

    drawBoard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const bgColorLightness = vis.get("cells.bgColorLightness");
        const bgColorDarken = vis.get("cells.bgColorDarken");
        const bgColorSaturation = vis.inkFriendly ? 0 : 100;
        const bgColor = new Color(Math.random()*360, bgColorSaturation, bgColorLightness);

        const dotRadius = vis.get("cells.dotRadius") * this.cellSizeUnit;
        const iconDims = new Vector2(vis.get("cells.iconSize") * this.cellSizeUnit);
        const iconOffset = vis.get("cells.iconOffsetFromCenter") * 0.5 * this.cellSizeUnit;
        const positions = [
            Vector2.UP.clone().scale(iconOffset),
            Vector2.RIGHT.clone().scale(iconOffset),
            Vector2.DOWN.clone().scale(iconOffset),
            Vector2.LEFT.clone().scale(iconOffset)
        ];

        const iconOp = new LayoutOperation({
            size: iconDims,
            pivot: Vector2.CENTER,
            effects: this.defaultEffects
        })

        const cellStrokeWidth = vis.get("cells.strokeWidth") * this.cellSizeUnit;
        const rectOp = new LayoutOperation({
            stroke: vis.inkFriendly ? "#000000" : vis.get("cells.strokeColor"),
        })

        const dotStrokeWidth = vis.get("cells.dotStrokeWidth") * this.cellSizeUnit;
        const triangleStrokeWidth = vis.get("cells.triangleStrokeWidth") * this.cellSizeUnit;
        const triangleStrokeColor = vis.inkFriendly ? "#666666" : vis.get("cells.triangleStrokeColor");

        const startPosColor = vis.get("cells.fillColorStart");

        // for each cell, 
        for(const cell of this.board.cells)
        {
            // - draw its rectangle
            const pos = this.convertGridPosToRealPos(cell.pos);
            const posCenter = pos.clone().add(this.cellSizeHalf);

            const isOddCell = (cell.pos.x + cell.pos.y) % 2 == 1;
            let col = bgColor.clone();
            if(isOddCell) { col = colorDarken(col, bgColorDarken); }

            // - cell edge points for drawing triangles below
            const points = [
                pos.clone(),
                new Vector2(pos.x + this.cellSize.x, pos.y),
                new Vector2(pos.x + this.cellSize.x, pos.y + this.cellSize.y),
                new Vector2(pos.x, pos.y + this.cellSize.y)
            ]
        
            // - draw its 4 icons
            let counter = this.pickIdealIconStartingIndex(cell);
            for(const iconName of cell.icons)
            {
                const iconData = CONFIG.allTypes[iconName];

                const bgColor = vis.inkFriendly ? "#FFFFFF" : COLORS[iconData.color].light;
                const triangleOp = new LayoutOperation({
                    stroke: triangleStrokeColor,
                    strokeWidth: triangleStrokeWidth,
                    fill: bgColor,
                });

                let triangle = [points[counter], points[(counter + 1) % 4], posCenter.clone()];
                triangle = closePath(triangle);
                const path = new Path(triangle);
                group.add(new ResourceShape(path), triangleOp);

                const icon = vis.getResource(iconData.textureKey);
                const rot = counter * 0.5 * Math.PI;
                const pos = posCenter.clone().move(positions[counter]);
                iconOp.frame = iconData.frame;
                iconOp.pos = pos;
                iconOp.rot = rot;

                group.add(icon, iconOp.clone());
                counter = (counter + 1) % 4;
            }

            // - draw the writable dot in the center (a square instead if starting position)
            let circ = cell.isStartingPosition() ? 
                new Rectangle({ center: posCenter, extents: new Vector2(2*dotRadius) }) : 
                new Circle({ center: posCenter, radius: dotRadius });

            rectOp.setFill(cell.isStartingPosition() ? startPosColor : "#FFFFFF");
            rectOp.strokeWidth = dotStrokeWidth;
            group.add(new ResourceShape(circ), rectOp.clone());  

            const rect = new Rectangle({ center: posCenter, extents: this.cellSize });
            const tempRectOp = rectOp.clone();
            tempRectOp.setFill(Color.TRANSPARENT);
            tempRectOp.strokeWidth = cellStrokeWidth;

            group.add(new ResourceShape(rect), tempRectOp);

        }

        // add an extra layer of effects / thickening to signal starting locations
        const strokeMult = vis.get("cells.strokeWidthMultiplierStart");
        const startPosStrokeColor = vis.get("cells.strokeColorStart");
        const startRectOp = new LayoutOperation({
            stroke: startPosStrokeColor,
            strokeWidth: strokeMult * cellStrokeWidth,
        }) 

        const resMisc = vis.getResource("misc");
        for(const cell of this.board.startingPositions)
        {
            const pos = this.convertGridPosToRealPos(cell.pos);
            const posCenter = pos.clone().add(this.cellSizeHalf);

            // thickening of rectangle + effects
            const rect = new Rectangle({ center: posCenter, extents: this.cellSize });
            group.add(new ResourceShape(rect), startRectOp);

            // extra starting location icon (low alpha)
            const iconOp = new LayoutOperation({
                frame: MISC.starting_position.frame,
                pos: posCenter,
                size: new Vector2(2*(1.0-0.275)*dotRadius),
                alpha: 0.45,
                pivot: Vector2.CENTER
            })
            group.add(resMisc, iconOp);
        }
    }

    // We want to avoid icons that point OUTWARD (out of the edge of the board)
    // Because unless you have some special power, you can never pick those
    pickIdealIconStartingIndex(cell:Cell) : number
    {
        let val = rangeInteger(0,3);
        if(cell.getNeighbors().length >= 4) { return val; } // neighbors on all sides, anything goes!
        if(cell.countIcons() >= 4) { return val; } // all sides filled anyway, so it doesn't matter!

        const leftSide = cell.pos.x <= 0;
        const topSide = cell.pos.y <= 0;
        const rightSide = cell.pos.x >= (this.board.size.x-1);
        const bottomSide = cell.pos.y >= (this.board.size.y-1);

        let possibleSides = [0,1,2,3];
        if(leftSide) { possibleSides.splice(possibleSides.indexOf(3), 1); }
        if(topSide) { possibleSides.splice(possibleSides.indexOf(0), 1); }
        if(rightSide) { possibleSides.splice(possibleSides.indexOf(1), 1); }
        if(bottomSide) { possibleSides.splice(possibleSides.indexOf(2), 1); }

        if(possibleSides.length <= 0) { return val; }
        return fromArray(possibleSides);
    }

    drawSidebar(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!CONFIG._settings.includeRules.value) { return; }

        // tutorial image at the top
        const tut = vis.getResource("sidebar");
        const tutWidth = this.sidebarSize.x;
        const tutDims = new Vector2(tutWidth, vis.get("sidebar.tutImageRatio") * tutWidth);
        const frame = CONFIG.inSimpleMode ? 0 : 1;
        const tutOp = new LayoutOperation({
            frame: frame,
            pos: this.originSidebar,
            size: tutDims,
            effects: this.defaultEffects
        })

        group.add(tut, tutOp);

        // specific types explained below that
        const resMisc = vis.getResource("misc");
        const uniqueTypes = this.board.uniqueTypes;
        const ySpaceLeft = this.sidebarSize.y - tutDims.y;
        const maxYSpacePerItem = ySpaceLeft / uniqueTypes.length;
        const yPadding = vis.get("sidebar.iconYPadding") * maxYSpacePerItem;

        const iconDims = new Vector2(maxYSpacePerItem - yPadding);
        const iconDimsWithPadding = iconDims.clone().scale(vis.get("sidebar.iconScale"));
        const xPadding = vis.get("sidebar.iconPadding") * this.sidebarSize.x;
        const entryDims = new Vector2(this.sidebarSize.x, iconDims.y);
        const textDims = entryDims.clone().sub(new Vector2(iconDims.x + 2*xPadding, 0));

        let pos = this.originSidebar.clone().move(new Vector2(0, tutDims.y));

        const fontSize = Math.min(vis.get("sidebar.fontSize") * textDims.y, vis.get("sidebar.maxFontSize"));
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            lineHeight: vis.get("sidebar.lineHeight"),
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE ,
            resLoader: vis.resLoader
        })

        const rectOp = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: vis.get("sidebar.rectStrokeWidth") * this.sizeUnit
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
                pivot: Vector2.CENTER,
                effects: this.defaultEffects
            })

            const rect = new RectangleRounded({ center: iconPos, extents: iconDims, radius: borderRadius });
            group.add(new ResourceShape(rect), rectOp);
            group.add(icon, iconOp);

            // add the text explaining how it scores
            const text = "<sc>" + data.label + "</sc>: " + data.desc;
            const textRes = new ResourceText({ text: text, textConfig: textConfig });
            const textPos = new Vector2(iconPos.x + 0.5*iconDims.x + xPadding, pos.y + 0.5*textDims.y);
            
            const innerTextPos = textPos.clone().move(new Vector2(xPadding*2, 0));
            const innerTextDims = textDims.clone().sub(new Vector2(xPadding*4, 0)); 

            const textOp = new LayoutOperation({
                fill: "#000000",
                size: innerTextDims,
                pos: innerTextPos,
                pivot: new Vector2(0,0.5)
            })

            const rectCenter = new Vector2(textPos.x + 0.5*textDims.x, textPos.y);
            const rectText = new RectangleRounded({ center: rectCenter, extents: textDims, radius: borderRadius });

            group.add(new ResourceShape(rectText), rectOp);
            group.add(textRes, textOp);

            if(this.showTypeMetadata)
            {
                const arr = [];
                if(data.hazard) { arr.push("hazard"); }
                if(data.item) { arr.push("item"); }

                if(arr.length > 0)
                {

                    const metaDims = new Vector2(vis.get("sidebar.metadataScale") * iconDimsWithPadding.x);
                    const effects = [new DropShadowEffect({ blurRadius: 0.06 * metaDims.x }), this.defaultEffects].flat();
                    const anchorPos = new Vector2(iconPos.x, iconPos.y + 0.5*iconDimsWithPadding.y);
                    const pos = getPositionsCenteredAround({ pos: anchorPos, num: arr.length, size: metaDims })

                    for(let m = 0; m < arr.length; m++)
                    {
                        const metaOp = new LayoutOperation({
                            frame: MISC[arr[m]].frame,
                            size: metaDims,
                            pos: pos[m],
                            pivot: Vector2.CENTER,
                            effects: effects
                        })

                        group.add(resMisc, metaOp);
                    }
                    
                }
            }

            pos.y += iconDims.y + yPadding;
        }
    }
}