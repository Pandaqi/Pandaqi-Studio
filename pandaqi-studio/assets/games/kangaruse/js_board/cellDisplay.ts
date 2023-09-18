// @ts-ignore
import { Display } from "js/pq_games/phaser.esm"
import { CELLS, GENERAL, COLOR_GROUPS, CORNER_OFFSETS } from "../js_shared/dictionary"
import CONFIG from "./config"
import Point from "js/pq_games/tools/geometry/point";
import Random from "js/pq_games/tools/random/main";
import Cell from "./cell"
import BoardDisplay from "./boardDisplay"

export default class CellDisplay
{
    cell: Cell
    boardDisplay: BoardDisplay

    constructor(cell)
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

    createNumText()
    {
        if(!this.showNum()) { return null; }

        let txtCfg:any = CONFIG.types.textConfig;
        const fontSize = (txtCfg.fontScaleFactor * this.boardDisplay.cellSizeUnit);
        txtCfg.fontSize = fontSize + "px";
        txtCfg.strokeThickness = (txtCfg.strokeScaleFactor * fontSize);

        const txt = this.boardDisplay.game.add.text(0, 0, this.cell.getNum().toString(), txtCfg);
        txt.setOrigin(0.5);
        return txt;
    }

    createWritingSpace()
    {
        const sprite = this.boardDisplay.game.add.sprite(0, 0, "general");
        sprite.setOrigin(0.5);
        sprite.setFrame(GENERAL.writingSpace.frame);
        sprite.setVisible(this.showWritingSpace());
        return sprite;
    }

    createTypeIcon()
    {
        if(!this.showType()) { return null; }

        const typeSprite = this.boardDisplay.game.add.sprite(0, 0, CONFIG.cellTexture);
        const spriteSize = CONFIG.types.iconScale * this.boardDisplay.cellSizeUnit;
        typeSprite.setOrigin(0.5);
        typeSprite.displayWidth = spriteSize;
        typeSprite.displayHeight = spriteSize;
        typeSprite.flipX = Math.random() <= 0.5;

        const frame = CELLS[this.cell.type].frame;
        typeSprite.setFrame(frame);
        return typeSprite
    }

    placeAtCenter(obj:any)
    {
        if(!obj) { return; }

        const pos = this.getRealPosition();
        obj.x = pos.x;
        obj.y = pos.y;
    }

    placeAtCorner(obj:any, corner:string)
    {
        if(!obj) { return; }

        const centerPos = this.getRealPosition();

        const cs = this.boardDisplay.cellSize;
        const csu = this.boardDisplay.cellSizeUnit;
        const margin = CONFIG.board.cellDisplay.cornerMargin * csu;

        const cornerOffset = CORNER_OFFSETS[corner].clone();
        const offsetX = cornerOffset.x * 0.5 * (cs.x - obj.displayWidth - margin);
        const offsetY = cornerOffset.y * 0.5 * (cs.y - obj.displayHeight - margin);

        const offsetVec = new Point().setXY(offsetX, offsetY);
        const offsetPos = centerPos.move(offsetVec);

        obj.x = offsetPos.x;
        obj.y = offsetPos.y;
    }

    getColorGroup() : string
    {
        return this.cell.getData().colorGroup;
    }

    getColor() : number
    {
        return new Display.Color.HexStringToColor( COLOR_GROUPS[this.getColorGroup()] ).color;
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
        const rect = this.boardDisplay.game.add.rectangle(0, 0, size.x, size.y);
        this.placeAtCenter(rect);

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
            this.boardDisplay.graphics.fillStyle(this.getColor(), alpha);
            this.boardDisplay.graphics.fillRoundedRect(pos.x, pos.y, sizeScaled.x, sizeScaled.y, borderRadius);

        }

        if(this.showBorder())
        {
            const lineWidth = strokeData.width * this.boardDisplay.cellSizeUnit;
            rect.setStrokeStyle(lineWidth, strokeData.color, strokeData.alpha);
        }
    }

    drawInnerConfiguration()
    {
        const data = CONFIG.board.cellDisplay;
        const csu = this.boardDisplay.cellSizeUnit;
        let multiPosition = false;

        // place icon that reveals cell type
        const icon = this.createTypeIcon();
        if(icon)
        {
            const iconSize = data.icon.scale * csu;
            icon.displayWidth = iconSize;
            icon.displayHeight = iconSize;
            this.placeAtCorner(icon, data.icon.corner);
            multiPosition = CELLS[this.cell.getType()].multiPosition;
        }

        // place the space for writing your symbol/marking where you've been
        if(this.showWritingSpace())
        {
            let corners = [data.space.corner];
            if(multiPosition) { 
                corners = ["bottom right", "bottom left", "top left", "top right"];
                const randMax = Random.rangeInteger(2,4);
                corners = corners.slice(0, randMax);
            }

            for(const corner of corners)
            {
                const writingSpace = this.createWritingSpace();
                const spaceSize = data.space.scale * csu;
                writingSpace.displayWidth = spaceSize;
                writingSpace.displayHeight = spaceSize;
                this.placeAtCorner(writingSpace, corner);
            }
        }

        // add a number on top (only used by score at the moment)
        const text = this.createNumText();
        if(text)
        {
            this.placeAtCorner(text, data.text.corner);
        }
        


        // small icon in all four corners, all empty space around it is for writing
        /*if(type == "iconCorners")
        {
            const iconSize = configData.iconCornersSpriteScale * csu;
            const corners = Object.keys(CORNER_OFFSETS);
            for(let i = 0; i < 4; i++)
            {
                const icon = this.createTypeIcon();
                icon.displayWidth = iconSize;
                icon.displayHeight = iconSize;
                this.placeAtCorner(icon, corners[i]);
            }
        }*/

    }
}