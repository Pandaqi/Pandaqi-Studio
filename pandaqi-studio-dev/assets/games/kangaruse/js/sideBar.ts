// @ts-ignore
import { Display } from "js/pq_games/phaser.esm"
import { GENERAL, CELLS, COLOR_GROUPS } from "./dictionary"
import CONFIG from "./config"
import Point from "js/pq_games/tools/geometry/point";
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"

export default class SideBar
{
    anchorPos:Point
    dimensions:Point
    padding: number;

    constructor(boardDisplay:BoardDisplay, boardState:BoardState)
    {
        this.anchorPos = new Point({ 
            x: boardDisplay.getAnchorPos().x + boardDisplay.boardDimensions.x + boardDisplay.gapToSidebar, 
            y: boardDisplay.outerMargin.y 
        });

        this.dimensions = new Point({ 
            x: boardDisplay.originalPaperDimensions.x - boardDisplay.getAnchorPos().x - this.anchorPos.x, 
            y: boardDisplay.originalPaperDimensions.y - boardDisplay.outerMargin.y*2 
        });

        this.padding = CONFIG.sideBar.padding * this.dimensions.x;

        this.drawBackground(boardDisplay);
        this.drawTutorials(boardDisplay, boardState);
        this.drawScoreSheets(boardDisplay);
    }

    drawBackground(boardDisplay:BoardDisplay)
    {
        const borderRadius = CONFIG.sideBar.borderRadius * this.dimensions.x;
        const col = CONFIG.inkFriendly ? 0xEDEDED : CONFIG.sideBar.backgroundColor;

        boardDisplay.graphics.fillStyle(col, 1.0);
        boardDisplay.graphics.fillRoundedRect(this.anchorPos.x, this.anchorPos.y, this.dimensions.x, this.dimensions.y, borderRadius);
    }

    drawTutorials(boardDisplay:BoardDisplay, boardState:BoardState)
    {
        if(CONFIG.sideBarType != "rules") { return; }

        this.anchorPos.move(this.padding);

        const tut = boardDisplay.game.add.sprite(this.anchorPos.x, this.anchorPos.y, "sidebar_tutorial");
        const tutRatio = (1067.0/895);
        tut.setOrigin(0);
        tut.displayWidth = this.dimensions.x - 2*this.padding;
        tut.displayHeight = tutRatio * tut.displayWidth;

        this.anchorPos.y += tut.displayHeight;

        const types = boardState.getIncludedTypes();
        const tutorialHeight = CONFIG.sideBar.tutorialSpriteHeight * this.dimensions.y;
        for(const type of types)
        {
            this.drawTutorial(boardDisplay, tutorialHeight, type);
        }
    }

    drawTutorial(boardDisplay:BoardDisplay, tutorialHeight:number, type:string)
    {
        const pos = new Point().setXY(
            this.anchorPos.x + 0.5*tutorialHeight, 
            this.anchorPos.y + 0.5*tutorialHeight
        );
        const sprite = boardDisplay.game.add.sprite(pos.x, pos.y, "general");
        sprite.setFrame(GENERAL.tutorialIcon.frame);
        sprite.displayWidth = tutorialHeight;
        sprite.displayHeight = tutorialHeight;

        const spriteIcon = boardDisplay.game.add.sprite(pos.x, pos.y, CONFIG.cellTexture);
        const frame = CELLS[type].frame;
        const iconSize = 0.5*tutorialHeight;
        spriteIcon.setFrame(frame)
        spriteIcon.displayWidth = iconSize;
        spriteIcon.displayHeight = iconSize;

        const gapBetween = 0.05*this.dimensions.x;
        const leftoverWidth = this.dimensions.x - sprite.displayWidth - gapBetween - 2*this.padding;
        const explanation = CELLS[type].desc;
        const txtCfg:any = CONFIG.sideBar.tutorialTextConfig;
        txtCfg.fontSize = (txtCfg.fontScaleFactor * this.dimensions.x) + 'px';
        txtCfg.wordWrap = {
            width: leftoverWidth,
            useAdvancedWrap: true
        }
        const txt = boardDisplay.game.add.text(pos.x + 0.5*sprite.displayWidth + gapBetween, pos.y, explanation, txtCfg);
        txt.setOrigin(0, 0.5);

        this.anchorPos.y += tutorialHeight;
    }

    drawScoreSheets(boardDisplay:BoardDisplay)
    {
        if(CONFIG.sideBarType != "score") { return; }

        const maxNumPlayers = CONFIG.maxNumPlayers;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.drawScoreSheet(boardDisplay);
        }
    }

    drawScoreSheet(boardDisplay:BoardDisplay)
    {
        this.anchorPos.y += this.padding;

        const yPosHeader = this.anchorPos.y + 0.05*this.dimensions.x;
        const xPosHeader = this.anchorPos.x + 0.5*this.dimensions.x;
        const header = boardDisplay.game.add.sprite(xPosHeader, yPosHeader, "general");
        header.setFrame(GENERAL.header.frame);
        header.setOrigin(0.5, 0.5);
        header.displayWidth = 0.5*this.dimensions.x;
        header.displayHeight = header.displayWidth;
        
        this.anchorPos.y += 0.25*header.displayHeight;

        const scoreTypes = boardDisplay.board.getTypesWithProperty("score");
        const NUM_ICONS = 10;
        const iconSize = (this.dimensions.x - 2*this.padding) / (NUM_ICONS + 1);

        for(const type of scoreTypes)
        {
            let xPos = this.anchorPos.x + this.padding;

            const alpha = CONFIG.sideBar.scoreTextAlpha;
            const txtCfg = CONFIG.sideBar.scoreTextConfig;
            txtCfg.fontSize = txtCfg.fontScaleFactor * this.dimensions.x;

            
            const colorHex = COLOR_GROUPS[CELLS[type].colorGroup];
            const color = new Display.Color.HexStringToColor(colorHex).color;
            const borderRadius = 10;
            const alphaBG = 0.66;
            
            boardDisplay.graphics.fillStyle(color, alphaBG);
            boardDisplay.graphics.fillRoundedRect(xPos-0.5*this.padding, this.anchorPos.y-2, this.dimensions.x-this.padding, iconSize+4, borderRadius);
            
            // the type being scored
            const typeIcon = boardDisplay.game.add.sprite(xPos, this.anchorPos.y, CONFIG.cellTexture);
            typeIcon.setFrame(CELLS[type].frame);
            typeIcon.setOrigin(0,0);
            typeIcon.displayWidth = iconSize;
            typeIcon.displayHeight = iconSize;

            // the empty spaces for doing so
            for(let i = 0; i < 10; i++)
            {
                xPos += iconSize;
                const emptyBox = boardDisplay.game.add.sprite(xPos, this.anchorPos.y, "general");
                emptyBox.setFrame(GENERAL.writingSpace.frame);
                emptyBox.setOrigin(0,0);
                emptyBox.displayWidth = iconSize;
                emptyBox.displayHeight = iconSize;

                let value = null;
                if(type == "chests") { value = i * 5; }
                else if(type == "toys") { value = (Math.floor(i / 3) + 1) * 5; }
                else if(type == "gems") { value = CELLS.gems.scoreValues[i]; }

                if(value != null)
                {
                    const txt = boardDisplay.game.add.text(
                        emptyBox.x + 0.5*iconSize, emptyBox.y + 0.5*iconSize, 
                        value.toString(), 
                        txtCfg
                    );
                    txt.setOrigin(0.5);
                    txt.setAlpha(alpha);
                }
            }

            this.anchorPos.y += iconSize;

        }

    }

    /*
    drawScoreSheet(boardDisplay:BoardDisplay, sheetHeight:number)
    {
        const h = sheetHeight
        const w = sheetHeight * CONFIG.sideBar.scoreSheetRatio;
        const xPos = this.anchorPos.x + 0.5*this.dimensions.x;

        const pos = new Point().setXY(xPos, this.anchorPos.y);
        const sprite = boardDisplay.game.add.sprite(pos.x, pos.y, CONFIG.sideBar.scoreSheetTexture);
        sprite.setOrigin(0.5,0);
        sprite.displayWidth = w;
        sprite.displayHeight = h;

        this.anchorPos.y += sheetHeight;
    }
    */
}