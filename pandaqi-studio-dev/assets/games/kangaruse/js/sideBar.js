import { CONFIG, GENERAL, CELLS } from "./dictionary"
import Point from "js/pq_games/tools/geometry/point";

export default class SideBar
{
    constructor(boardDisplay, boardState)
    {
        this.anchorPos = { 
            x: boardDisplay.outerMargin.x + boardDisplay.boardDimensions.x + boardDisplay.gapToSidebar, 
            y: boardDisplay.outerMargin.y 
        }

        this.dimensions = { 
            x: boardDisplay.originalPaperDimensions.x - boardDisplay.outerMargin.x - this.anchorPos.x, 
            y: boardDisplay.boardDimensions.y 
        }

        this.drawTutorials(boardDisplay, boardState);
        this.drawScoreSheets(boardDisplay);
    }

    drawTutorials(boardDisplay, boardState)
    {
        if(CONFIG.sideBarType != "rules") { return; }

        // @TODO: start with the one image that explains the game rules

        const types = boardState.getIncludedTypes();
        const tutorialHeight = CONFIG.sideBar.tutorialSpriteHeight * this.dimensions.y;
        for(const type of types)
        {
            this.drawTutorial(boardDisplay, tutorialHeight, type);
        }
    }

    drawTutorial(boardDisplay, tutorialHeight, type)
    {
        const pos = new Point().setXY(this.anchorPos.x, this.anchorPos.y);
        const sprite = boardDisplay.game.add.sprite(pos.x, pos.y, "general");
        sprite.setFrame(GENERAL.tutorialIcon.frame);
        sprite.displayWidth = tutorialHeight;
        sprite.displayHeight = tutorialHeight;

        const spriteIcon = boardDisplay.game.add.sprite(pos.x, pos.y, "cell_types");
        const frame = CELLS[type].frame;
        const iconSize = 0.5*tutorialHeight;
        spriteIcon.setFrame(frame)
        spriteIcon.displayWidth = iconSize;
        spriteIcon.displayHeight = iconSize;

        const gapBetween = 0.05*this.dimensions.x;
        const leftoverWidth = this.dimensions.x - sprite.displayWidth - gapBetween;
        const explanation = CELLS[type].desc;
        const txtCfg = CONFIG.sideBar.tutorialTextConfig;
        txtCfg.fontSize = (txtCfg.fontScaleFactor * this.dimensions.x) + 'px';
        txtCfg.wordWrap = {
            width: leftoverWidth,
            useAdvancedWrap: true
        }
        const txt = boardDisplay.game.add.text(pos.x + 0.5*sprite.displayWidth + gapBetween, pos.y, explanation, txtCfg);
        txt.setOrigin(0, 0.5);

        this.anchorPos.y += tutorialHeight;
    }

    drawScoreSheets(boardDisplay)
    {
        if(CONFIG.sideBarType != "score") { return; }

        const maxNumPlayers = CONFIG.maxNumPlayersForScoreSheets;
        const maxSheetHeightForYAxis = this.dimensions.y / maxNumPlayers;
        const sheetHeightForMaxWidth = this.dimensions.x / CONFIG.sideBar.scoreSheetRatio;
        const sheetHeight = Math.min(maxSheetHeightForYAxis, sheetHeightForMaxWidth);

        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.drawScoreSheet(boardDisplay, sheetHeight);
        }
    }

    drawScoreSheet(boardDisplay, sheetHeight)
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
}