import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import Color from "js/pq_games/layout/color/color";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import Circle from "js/pq_games/tools/geometry/circle";
import closePath from "js/pq_games/tools/geometry/paths/closePath";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import RectangleRounded from "js/pq_games/tools/geometry/rectangleRounded";
import fromArray from "js/pq_games/tools/random/fromArray";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";
import CONFIG from "../js_shared/config";
import { COLORS, MISC } from "../js_shared/dict";
import BoardState from "./boardState";
import Cell from "./cell";

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
    defaultEffects: LayoutEffect[];

    async draw(vis:BoardVisualizer, bs:BoardState)
    {
        const group = this.prepare(vis, bs);
        this.drawBackground(vis, group);
        this.drawBoard(vis, group, bs);
        this.drawSidebar(vis, group, bs);
        return [group];
    }

    prepare(vis:BoardVisualizer, bs:BoardState)
    {
        const fullSize = vis.size;
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

        this.cellSize = boardSize.clone().div(bs.size);
        this.cellSizeHalf = this.cellSize.clone().scale(0.5);
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        this.defaultEffects = [];
        if(CONFIG.inkFriendly) { this.defaultEffects.push(new GrayScaleEffect()); }

        let requiresMetadata = false;
        console.log("UNIQUE TYPES: ", bs.uniqueTypes);
        for(const type of bs.uniqueTypes)
        {
            if(CONFIG.allTypes[type].requiresMetadata) { requiresMetadata = true; break; }
        }

        this.showTypeMetadata = requiresMetadata;

        const drawGroup = new ResourceGroup();
        return drawGroup
    }

    async drawBackground(vis:BoardVisualizer, group:ResourceGroup)
    {
        const bgColor = CONFIG.inkFriendly ? "#FFFFFF" : CONFIG.draw.bgColor;
        fillResourceGroup(this.fullSize, group, bgColor);

        if(!CONFIG.inkFriendly)
        {
            const resBG = vis.getResource("bg_map");
            const opBG = new LayoutOperation({
                pos: this.fullSize.clone().scale(0.5),
                size: this.fullSize.clone().scale(CONFIG.draw.bg.mapScale),
                alpha: CONFIG.draw.bg.mapAlpha,
                pivot: Point.CENTER,
                //composite: "color-burn"
            })
            group.add(resBG, opBG);
        }
    }

    convertGridPosToRealPos(pos:Point)
    {
        return this.originBoard.clone().add( pos.clone().scale(this.cellSize) );
    }

    async drawBoard(vis:BoardVisualizer, group:ResourceGroup, bs:BoardState)
    {
        const bgColorLightness = CONFIG.draw.cells.bgColorLightness;
        const bgColorDarken = CONFIG.draw.cells.bgColorDarken;
        const bgColorSaturation = CONFIG.inkFriendly ? 0 : 100;
        const bgColor = new Color(Math.random()*360, bgColorSaturation, bgColorLightness);

        const dotRadius = CONFIG.draw.cells.dotRadius * this.cellSizeUnit;
        const iconDims = new Point(CONFIG.draw.cells.iconSize * this.cellSizeUnit);
        const iconOffset = CONFIG.draw.cells.iconOffsetFromCenter * 0.5 * this.cellSizeUnit;
        const positions = [
            Point.UP.clone().scale(iconOffset),
            Point.RIGHT.clone().scale(iconOffset),
            Point.DOWN.clone().scale(iconOffset),
            Point.LEFT.clone().scale(iconOffset)
        ];

        const iconOp = new LayoutOperation({
            size: iconDims,
            pivot: Point.CENTER,
            effects: this.defaultEffects
        })

        const cellStrokeWidth = CONFIG.draw.cells.strokeWidth * this.cellSizeUnit;
        const rectOp = new LayoutOperation({
            stroke: CONFIG.inkFriendly ? "#000000" : CONFIG.draw.cells.strokeColor,
        })

        const dotStrokeWidth = CONFIG.draw.cells.dotStrokeWidth * this.cellSizeUnit;
        const triangleStrokeWidth = CONFIG.draw.cells.triangleStrokeWidth * this.cellSizeUnit;
        const triangleStrokeColor = CONFIG.inkFriendly ? "#666666" : CONFIG.draw.cells.triangleStrokeColor;

        const startPosColor = CONFIG.draw.cells.fillColorStart;

        // for each cell, 
        for(const cell of bs.cells)
        {
            // - draw its rectangle
            const pos = this.convertGridPosToRealPos(cell.pos);
            const posCenter = pos.clone().add(this.cellSizeHalf);

            const isOddCell = (cell.pos.x + cell.pos.y) % 2 == 1;
            let col = bgColor.clone();
            if(isOddCell) { col = col.darken(bgColorDarken); }

            // - cell edge points for drawing triangles below
            const points = [
                pos.clone(),
                new Point(pos.x + this.cellSize.x, pos.y),
                new Point(pos.x + this.cellSize.x, pos.y + this.cellSize.y),
                new Point(pos.x, pos.y + this.cellSize.y)
            ]
        
            // - draw its 4 icons
            let counter = this.pickIdealIconStartingIndex(cell, bs);
            for(const iconName of cell.icons)
            {
                const iconData = CONFIG.allTypes[iconName];

                const bgColor = CONFIG.inkFriendly ? "#FFFFFF" : COLORS[iconData.color].light;
                const triangleOp = new LayoutOperation({
                    stroke: triangleStrokeColor,
                    strokeWidth: triangleStrokeWidth,
                    fill: bgColor,
                });

                let triangle = [points[counter], points[(counter + 1) % 4], posCenter.clone()];
                triangle = closePath(triangle);
                const path = new Path({points:triangle});
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
                new Rectangle({ center: posCenter, extents: new Point(2*dotRadius) }) : 
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
        const strokeMult = CONFIG.draw.cells.strokeWidthMultiplierStart;
        const startPosStrokeColor = CONFIG.draw.cells.strokeColorStart;
        const startRectOp = new LayoutOperation({
            stroke: startPosStrokeColor,
            strokeWidth: strokeMult * cellStrokeWidth,
        }) 

        const resMisc = vis.getResource("misc");
        for(const cell of bs.startingPositions)
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
                size: new Point(2*(1.0-0.275)*dotRadius),
                alpha: 0.45,
                pivot: Point.CENTER
            })
            group.add(resMisc, iconOp);
        }
    }

    // We want to avoid icons that point OUTWARD (out of the edge of the board)
    // Because unless you have some special power, you can never pick those
    pickIdealIconStartingIndex(cell:Cell, bs:BoardState) : number
    {
        let val = rangeInteger(0,3);
        if(cell.getNeighbors().length >= 4) { return val; } // neighbors on all sides, anything goes!
        if(cell.countIcons() >= 4) { return val; } // all sides filled anyway, so it doesn't matter!

        const leftSide = cell.pos.x <= 0;
        const topSide = cell.pos.y <= 0;
        const rightSide = cell.pos.x >= (bs.size.x-1);
        const bottomSide = cell.pos.y >= (bs.size.y-1);

        let possibleSides = [0,1,2,3];
        if(leftSide) { possibleSides.splice(possibleSides.indexOf(3), 1); }
        if(topSide) { possibleSides.splice(possibleSides.indexOf(0), 1); }
        if(rightSide) { possibleSides.splice(possibleSides.indexOf(1), 1); }
        if(bottomSide) { possibleSides.splice(possibleSides.indexOf(2), 1); }

        if(possibleSides.length <= 0) { return val; }
        return fromArray(possibleSides);
    }

    async drawSidebar(vis:BoardVisualizer, group:ResourceGroup, bs:BoardState)
    {
        if(!CONFIG.includeRules) { return; }

        // tutorial image at the top
        const tut = vis.getResource("sidebar");
        const tutWidth = this.sidebarSize.x;
        const tutDims = new Point(tutWidth, CONFIG.draw.sidebar.tutImageRatio * tutWidth);
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
        const uniqueTypes = bs.uniqueTypes;
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
            resLoader: vis.resLoader
        })

        const rectOp = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: CONFIG.draw.sidebar.rectStrokeWidth * this.sizeUnit
        });
        const borderRadius = 0.1*iconDims.x;

        for(const type of uniqueTypes)
        {
            // draw the icon
            const data = CONFIG.allTypes[type];
            const icon = vis.getResource(data.textureKey);
            const iconPos = pos.clone().move(new Point(iconDims).scale(0.5));
            iconPos.x += xPadding;
            const iconOp = new LayoutOperation({
                frame: data.frame,
                pos: iconPos,
                size: iconDimsWithPadding,
                pivot: Point.CENTER,
                effects: this.defaultEffects
            })

            const rect = new RectangleRounded({ center: iconPos, extents: iconDims, radius: borderRadius });
            group.add(new ResourceShape(rect), rectOp);
            group.add(icon, iconOp);

            // add the text explaining how it scores
            const text = "<sc>" + data.label + "</sc>: " + data.desc;
            const textRes = new ResourceText({ text: text, textConfig: textConfig });
            const textPos = new Point(iconPos.x + 0.5*iconDims.x + xPadding, pos.y + 0.5*textDims.y);
            
            const innerTextPos = textPos.clone().move(new Point(xPadding*2, 0));
            const innerTextDims = textDims.clone().sub(new Point(xPadding*4, 0)); 

            const textOp = new LayoutOperation({
                fill: "#000000",
                size: innerTextDims,
                pos: innerTextPos,
                pivot: new Point(0,0.5)
            })

            const rectCenter = new Point(textPos.x + 0.5*textDims.x, textPos.y);
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

                    const metaDims = new Point(CONFIG.draw.sidebar.metadataScale * iconDimsWithPadding.x);
                    const effects = [new DropShadowEffect({ blurRadius: 0.06 * metaDims.x }), this.defaultEffects].flat();
                    const anchorPos = new Point(iconPos.x, iconPos.y + 0.5*iconDimsWithPadding.y);
                    const pos = getPositionsCenteredAround({ pos: anchorPos, num: arr.length, size: metaDims })

                    for(let m = 0; m < arr.length; m++)
                    {
                        const metaOp = new LayoutOperation({
                            frame: MISC[arr[m]].frame,
                            size: metaDims,
                            pos: pos[m],
                            pivot: Point.CENTER,
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