import { MaterialVisualizer, ResourceGroup, Vector2, TextConfig, LayoutOperation, StrokeAlign, ResourceText, Color, Rectangle, Path, roundPath, ResourceShape, rangeInteger, rand } from "lib/pq-games";
import { CELLS, COLOR_GROUPS, CORNER_OFFSETS, GENERAL } from "../shared/dict";
import BoardDisplay from "./boardDisplay";
import Cell from "./cell";
import { CONFIG } from "./config";

export default class CellDisplay
{
    cell: Cell
    boardDisplay: BoardDisplay

    constructor(cell:Cell)
    {
        this.cell = cell;
        this.boardDisplay = null;
    }

    showBackground(vis:MaterialVisualizer) { return this.getColorGroup() != null && !vis.inkFriendly; }
    showBorder() { return !this.cell.isHole(); }
    showType() { return this.cell.type; }
    showNum() { return this.cell.hasNum(); }
    showWritingSpace() { return !this.cell.isHole(); }
    getRealPosition(pos = this.cell.getPositionCenter())
    {
        return this.boardDisplay.convertToRealUnits(pos);
    }

    createNumText(vis: MaterialVisualizer, group:ResourceGroup, corner: string)
    {
        if(!this.showNum()) { return null; }

        const fontSize = vis.get("types.fontSize");
        const strokeThickness = vis.get("types.strokeWidth");

        const size = new Vector2(2*fontSize);
        const pos = this.placeAtCorner(vis, size, corner);

        const str = this.cell.getNum().toString();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize
        }).alignCenter();
        const opText = new LayoutOperation({
            pos: pos,
            size: size,
            fill: vis.get("types.color"),
            stroke: vis.get("types.strokeColor"),
            strokeWidth: strokeThickness,
            strokeAlign: StrokeAlign.OUTSIDE
        });

        const resText = new ResourceText({ text: str, textConfig: textConfig });
        group.add(resText, opText);
    }

    createWritingSpace(vis: MaterialVisualizer, group:ResourceGroup, size:Vector2, corner:string)
    {
        const res = vis.getResource("general_spritesheet");
        const alpha = this.showWritingSpace() ? 1.0 : 0.0;
        const pos = this.placeAtCorner(vis, size, corner);
        const op = new LayoutOperation({
            pos: pos,
            size: size,
            frame: GENERAL.writingSpace.frame,
            alpha: alpha,
            depth: 1000
        });
        group.add(res, op);
    }

    createTypeIcon(vis: MaterialVisualizer, group:ResourceGroup, size:Vector2, corner:string)
    {
        if(!this.showType()) { return null; }

        const frame = CELLS[this.cell.type].frame;
        const res = vis.getResource(CONFIG.cellTexture);
        const pos = this.placeAtCorner(vis, size, corner);
        const op = new LayoutOperation({
            pos: pos,
            size: size,
            flipX: (rand() <= 0.5),
            frame: frame
        });
        group.add(res, op);
        return true;
    }

    placeAtCorner(vis: MaterialVisualizer, size:Vector2, corner:string) : Vector2
    {
        const centerPos = this.getRealPosition();

        const cs = this.boardDisplay.cellSize;
        const margin = vis.get("board.cellDisplay.cornerMargin");

        const cornerOffset = CORNER_OFFSETS[corner].clone();
        const offsetX = cornerOffset.x * 0.5 * (cs.x - size.x - margin);
        const offsetY = cornerOffset.y * 0.5 * (cs.y - size.y - margin);

        const offsetVec = new Vector2(offsetX, offsetY);
        const offsetPos = centerPos.move(offsetVec);

        return offsetPos;
    }

    getColorGroup() : string
    {
        return this.cell.getData().colorGroup;
    }

    getColor() : Color
    {
        return new Color( COLOR_GROUPS[this.getColorGroup()] );
    }

    draw(vis: MaterialVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay)
    {
        this.boardDisplay = boardDisplay;

        this.drawSquare(vis, group);
        this.drawInnerConfiguration(vis, group);
    }

    drawSquare(vis: MaterialVisualizer, group:ResourceGroup)
    {
        const size = this.boardDisplay.cellSize
        const rect = new Rectangle({ center: this.getRealPosition(), extents: size });

        const borderRadius = vis.get("board.cellDisplay.borderRadius");
        const maxOffsetBG = vis.get("board.cellDisplay.maxOffsetBG");
        const scaleBG = vis.get("board.cellDisplay.scaleBG");

        const strokePrefix = vis.inkFriendly ? "board.cellDisplay.strokeInkfriendly" : "board.cellDisplay.stroke";

        if(this.showBackground(vis))
        {   
            const pos = this.getRealPosition();
            pos.sub(size.clone().scale(0.5*scaleBG));
            const sizeScaled = size.clone().scale(scaleBG);

            const randOffset = new Vector2().random().scaleFactor(maxOffsetBG);
            pos.move(randOffset);
            
            let alpha = 1.0;
            if(this.cell.hole || this.cell.river) { alpha = 0.33; }

            const finalColor = this.getColor();
            finalColor.a = alpha;

            const op = new LayoutOperation({ fill: finalColor });
            const rectPath = new Rectangle().fromTopLeft(pos, sizeScaled).toPathArray();
            const pathRounded = new Path( roundPath(rectPath, borderRadius) );
            group.add(new ResourceShape(pathRounded), op);
        }

        if(this.showBorder())
        {
            const op = new LayoutOperation({
                stroke: vis.get(strokePrefix + ".color"),
                strokeWidth: vis.get(strokePrefix + ".width"),
                alpha: vis.get(strokePrefix + ".alpha")
            })
            group.add(new ResourceShape(rect), op);
        }
    }

    drawInnerConfiguration(vis: MaterialVisualizer, group:ResourceGroup)
    {
        const csu = this.boardDisplay.cellSizeUnit;
        let multiPosition = false;

        // place icon that reveals cell type
        const iconSize = new Vector2(vis.get("board.cellDisplay.icon.scale") * csu);
        const icon = this.createTypeIcon(vis, group, iconSize, vis.get("board.cellDisplay.icon.corner"));
        if(icon) { multiPosition = CELLS[this.cell.getType()].multiPosition; }

        // place the space for writing your symbol/marking where you've been
        if(this.showWritingSpace())
        {
            let corners = [vis.get("board.cellDisplay.space.corner")];
            
            if(multiPosition) 
            { 
                corners = ["bottom right", "bottom left", "top left", "top right"];
                const randMax = rangeInteger(2,4);
                corners = corners.slice(0, randMax);
            }

            for(const corner of corners)
            {
                const size = new Vector2(vis.get("board.cellDisplay.space.scale") * csu);
                this.createWritingSpace(vis, group, size, corner);
            }
        }

        // add a number on top (only used by score at the moment)
        this.createNumText(vis, group, vis.get("board.cellDisplay.text.corner"));
    }
}
