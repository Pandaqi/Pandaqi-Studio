import { CELLS, GENERAL, COLOR_GROUPS, CORNER_OFFSETS } from "../js_shared/dictionary"
import CONFIG from "./config"
import Point from "js/pq_games/tools/geometry/point";
import Random from "js/pq_games/tools/random/main";
import Cell from "./cell"
import BoardDisplay from "./boardDisplay"
import Color from "js/pq_games/layout/color/color";
import imageToPhaser from "js/pq_games/phaser/imageToPhaser";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import textToPhaser from "js/pq_games/phaser/textToPhaser";
import { pathToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser";
import roundPath from "js/pq_games/tools/geometry/paths/roundPath";
import Path from "js/pq_games/tools/geometry/paths/path";

export default class CellDisplay
{
    cell: Cell
    boardDisplay: BoardDisplay

    constructor(cell:Cell)
    {
        this.cell = cell;
        this.boardDisplay = null;
    }

    showBackground() { return this.getColorGroup() != null && !CONFIG.inkFriendly; }
    showBorder() { return !this.cell.isHole(); }
    showType() { return this.cell.type; }
    showNum() { return this.cell.hasNum(); }
    showWritingSpace() { return !this.cell.isHole(); }
    getRealPosition(pos = this.cell.getPositionCenter())
    {
        return this.boardDisplay.convertToRealUnits(pos);
    }

    createNumText(corner: string)
    {
        if(!this.showNum()) { return null; }

        const txtCfg = CONFIG.types.textConfig;
        const fontSize = (txtCfg.fontScaleFactor * this.boardDisplay.cellSizeUnit);
        const strokeThickness = (txtCfg.strokeScaleFactor * fontSize);

        const dims = new Point(2*fontSize);
        const pos = this.placeAtCorner(dims, corner);

        const str = this.cell.getNum().toString();
        const textConfig = new TextConfig({
            font: txtCfg.fontFamily,
            size: fontSize
        }).alignCenter();
        const opText = new LayoutOperation({
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            fill: txtCfg.color,
            stroke: txtCfg.stroke,
            strokeWidth: strokeThickness
        });

        const resText = new ResourceText({ text: str, textConfig: textConfig });
        return textToPhaser(resText, opText, this.boardDisplay.game);
    }

    createWritingSpace(dims:Point, corner:string)
    {
        const res = CONFIG.visualizer.resLoader.getResource("general_spritesheet");
        const alpha = this.showWritingSpace() ? 1.0 : 0.0;
        const pos = this.placeAtCorner(dims, corner);
        const op = new LayoutOperation({
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            frame: GENERAL.writingSpace.frame,
            alpha: alpha
        });
        return imageToPhaser(res, op, this.boardDisplay.game);
    }

    createTypeIcon(dims:Point, corner:string)
    {
        if(!this.showType()) { return null; }

        const frame = CELLS[this.cell.type].frame;
        const res = CONFIG.visualizer.resLoader.getResource(CONFIG.cellTexture);
        const pos = this.placeAtCorner(dims, corner);
        const op = new LayoutOperation({
            translate: pos,
            pivot: Point.CENTER,
            dims: dims,
            flipX: (Math.random() <= 0.5),
            frame: frame
        });

        return imageToPhaser(res, op, this.boardDisplay.game);
    }

    placeAtCorner(dims:Point, corner:string) : Point
    {
        const centerPos = this.getRealPosition();

        const cs = this.boardDisplay.cellSize;
        const csu = this.boardDisplay.cellSizeUnit;
        const margin = CONFIG.board.cellDisplay.cornerMargin * csu;

        const cornerOffset = CORNER_OFFSETS[corner].clone();
        const offsetX = cornerOffset.x * 0.5 * (cs.x - dims.x - margin);
        const offsetY = cornerOffset.y * 0.5 * (cs.y - dims.y - margin);

        const offsetVec = new Point().setXY(offsetX, offsetY);
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

    draw(boardDisplay:BoardDisplay)
    {
        this.boardDisplay = boardDisplay;

        this.drawSquare();
        this.drawInnerConfiguration();
    }

    drawSquare()
    {
        const size = this.boardDisplay.cellSize
        const rect = new Rectangle({ center: this.getRealPosition(), extents: size });

        const cfg = CONFIG.board.cellDisplay;
        const borderRadius = CONFIG.board.cellDisplay.borderRadius * this.boardDisplay.cellSizeUnit;
        const maxOffsetBG = CONFIG.board.cellDisplay.maxOffsetBG * this.boardDisplay.cellSizeUnit;
        const scaleBG = CONFIG.board.cellDisplay.scaleBG;

        const strokeData = CONFIG.inkFriendly ? cfg.strokeInkfriendly : cfg.stroke;

        if(this.showBackground())
        {   
            const pos = this.getRealPosition();
            pos.sub(size.clone().scale(0.5*scaleBG));
            const sizeScaled = size.clone().scale(scaleBG);

            const randOffset = new Point().random().scaleFactor(maxOffsetBG);
            pos.move(randOffset);
            
            let alpha = 1.0;
            if(this.cell.hole || this.cell.river) { alpha = 0.33; }

            const finalColor = this.getColor();
            finalColor.a = alpha;

            const op = new LayoutOperation({ fill: finalColor });
            const rectPath = new Rectangle().fromTopLeft(pos, sizeScaled).toPath();
            const pathRounded = new Path( roundPath(rectPath, borderRadius) );
            pathToPhaser(pathRounded, op, this.boardDisplay.graphics);
        }

        if(this.showBorder())
        {
            const lineWidth = strokeData.width * this.boardDisplay.cellSizeUnit;
            const col = new Color(strokeData.color);
            col.a = strokeData.alpha;
            const op = new LayoutOperation({
                stroke: col,
                strokeWidth: lineWidth
            })
            rectToPhaser(rect, op, this.boardDisplay.graphics);
        }
    }

    drawInnerConfiguration()
    {
        const data = CONFIG.board.cellDisplay;
        const csu = this.boardDisplay.cellSizeUnit;
        let multiPosition = false;

        // place icon that reveals cell type
        const iconSize = new Point(data.icon.scale * csu);
        const icon = this.createTypeIcon(iconSize, data.icon.corner);
        if(icon) { multiPosition = CELLS[this.cell.getType()].multiPosition; }

        // place the space for writing your symbol/marking where you've been
        if(this.showWritingSpace())
        {
            let corners = [data.space.corner];
            
            if(multiPosition) 
            { 
                corners = ["bottom right", "bottom left", "top left", "top right"];
                const randMax = Random.rangeInteger(2,4);
                corners = corners.slice(0, randMax);
            }

            for(const corner of corners)
            {
                const dims = new Point(data.space.scale * csu);
                this.createWritingSpace(dims, corner);
            }
        }

        // add a number on top (only used by score at the moment)
        this.createNumText(data.text.corner);
    }
}