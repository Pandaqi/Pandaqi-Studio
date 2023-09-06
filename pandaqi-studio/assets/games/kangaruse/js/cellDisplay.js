import { CELLS, CONFIG, GENERAL, NB_OFFSETS, CORNER_OFFSETS } from "./dictionary"
import Point from "js/pq_games/tools/geometry/point";
import Random from "js/pq_games/tools/random/main";


export default class CellDisplay
{
    constructor(cell)
    {
        this.cell = cell;
        this.boardDisplay = null;
    }

    showBackground() { return false; } // @TODO?
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

        var txtCfg = CONFIG.types.textConfig;
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

        const useSimplified = CONFIG.inkFriendly;
        let textureKey = "cell_types";
        if(useSimplified) { textureKey += "_simplified"; }

        const typeSprite = this.boardDisplay.game.add.sprite(0, 0, textureKey);
        const spriteSize = CONFIG.types.iconScale * this.boardDisplay.cellSizeUnit;
        typeSprite.setOrigin(0.5);
        typeSprite.displayWidth = spriteSize;
        typeSprite.displayHeight = spriteSize;
        typeSprite.flipX = Math.random() <= 0.5;

        const frame = CELLS[this.cell.type].frame;
        typeSprite.setFrame(frame);
        return typeSprite
    }

    placeAtCenter(obj)
    {
        if(!obj) { return; }

        const pos = this.getRealPosition();
        obj.x = pos.x;
        obj.y = pos.y;
    }

    placeAtCorner(obj, corner)
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

    draw(boardDisplay)
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

        if(this.showBackground())
        {
            rect.setFillStyle(cfg.color, cfg.alpha);
        }

        if(this.showBorder())
        {
            const lineWidth = cfg.widthStroke * this.boardDisplay.cellSizeUnit;
            rect.setStrokeStyle(lineWidth, cfg.colorStroke, cfg.alphaStroke);
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