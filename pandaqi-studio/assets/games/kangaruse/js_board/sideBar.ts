import { GENERAL, CELLS, COLOR_GROUPS } from "../js_shared/dictionary"
import CONFIG from "./config"
import Point from "js/pq_games/tools/geometry/point";
import BoardDisplay from "./boardDisplay"
import BoardState from "./boardState"
import Color from "js/pq_games/layout/color/color";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Path from "js/pq_games/tools/geometry/paths/path";
import roundPath from "js/pq_games/tools/geometry/paths/roundPath";
import { pathToPhaser } from "js/pq_games/phaser/shapeToPhaser";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import imageToPhaser from "js/pq_games/phaser/imageToPhaser";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import textToPhaser from "js/pq_games/phaser/textToPhaser";

export default class SideBar
{
    anchorPos:Point
    dimensions:Point
    padding: number;

    constructor(boardDisplay:BoardDisplay, boardState:BoardState)
    {
        this.anchorPos = new Point(
            boardDisplay.getAnchorPos().x + boardDisplay.boardDimensions.x + boardDisplay.gapToSidebar, 
            boardDisplay.outerMargin.y 
        );

        this.dimensions = new Point( 
            boardDisplay.originalPaperDimensions.x - boardDisplay.getAnchorPos().x - this.anchorPos.x, 
            boardDisplay.originalPaperDimensions.y - boardDisplay.outerMargin.y*2 
        );

        this.padding = CONFIG.sideBar.padding * this.dimensions.x;

        this.drawBackground(boardDisplay);
        this.drawTutorials(boardDisplay, boardState);
        this.drawScoreSheets(boardDisplay);
    }

    drawBackground(boardDisplay:BoardDisplay)
    {
        const borderRadius = CONFIG.sideBar.borderRadius * this.dimensions.x;
        const col = CONFIG.inkFriendly ? "#EDEDED" : CONFIG.sideBar.backgroundColor;

        const op = new LayoutOperation({ fill: col });
        const rectPath = new Rectangle().fromTopLeft(this.anchorPos, this.dimensions);
        const pathRounded = new Path( roundPath(rectPath, borderRadius) );
        pathToPhaser(pathRounded, op, boardDisplay.graphics);
    }

    drawTutorials(boardDisplay:BoardDisplay, boardState:BoardState)
    {
        if(CONFIG.sideBarType != "rules") { return; }

        this.anchorPos.move(this.padding);

        const res = CONFIG.resLoader.getResource("sidebar_tutorial");
        const tutRatio = (1067.0/895);
        const tutSizeX = this.dimensions.x - 2*this.padding;
        const tutSizeY = tutRatio * tutSizeX;
        const op = new LayoutOperation({
            translate: this.anchorPos,
            pivot: new Point(),
            dims: new Point(tutSizeX, tutSizeY)
        })
        imageToPhaser(res, op, boardDisplay.game);

        this.anchorPos.y += tutSizeY;

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

        const tutorialWidth = tutorialHeight;
        const res = CONFIG.resLoader.getResource("general_spritesheet");
        const op = new LayoutOperation({
            translate: pos,
            dims: new Point(tutorialHeight),
            frame: GENERAL.tutorialIcon.frame,
            pivot: Point.CENTER
        });
        imageToPhaser(res, op, boardDisplay.game);

        const resIcon = CONFIG.resLoader.getResource(CONFIG.cellTexture);
        const frame = CELLS[type].frame;
        const iconSize = 0.5*tutorialHeight;
        const opIcon = new LayoutOperation({
            translate: pos,
            dims: new Point(iconSize),
            frame: frame,
            pivot: Point.CENTER
        });
        imageToPhaser(resIcon, opIcon, boardDisplay.game);


        const gapBetween = 0.05*this.dimensions.x;
        const leftoverWidth = this.dimensions.x - tutorialWidth - gapBetween - 2*this.padding;
        const explanation = CELLS[type].desc;
        const txtCfg = CONFIG.sideBar.tutorialTextConfig;
        const fontSize = (txtCfg.fontScaleFactor * this.dimensions.x);
        
        const textConfig = new TextConfig({
            font: txtCfg.fontFamily,
            size: fontSize,
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE,
            lineHeight: 1.0
        });

        const textPos = new Point(pos.x + 0.5*tutorialWidth + gapBetween, pos.y);
        const opText = new LayoutOperation({
            translate: textPos,
            dims: new Point(leftoverWidth, tutorialHeight),
            fill: txtCfg.color,
            pivot: new Point(0, 0.5)
        })
        const resText = new ResourceText({ text: explanation, textConfig: textConfig });
        textToPhaser(resText, opText, boardDisplay.game);

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
        const posHeader = new Point(xPosHeader, yPosHeader);
        const dimsHeader = new Point(0.5 * this.dimensions.x);
        const resGeneral = CONFIG.resLoader.getResource("general_spritesheet");
        const opHeader = new LayoutOperation({
            translate: posHeader,
            dims: dimsHeader,
            frame: GENERAL.header.frame,
            pivot: Point.CENTER
        });
        imageToPhaser(resGeneral, opHeader, boardDisplay.game);
        
        this.anchorPos.y += 0.25*dimsHeader.y;

        const scoreTypes = boardDisplay.board.getTypesWithProperty("score");
        const NUM_ICONS = 10;
        const iconSize = (this.dimensions.x - 2*this.padding) / (NUM_ICONS + 1);

        const txtCfg = CONFIG.sideBar.scoreTextConfig;
        const fontSize = txtCfg.fontScaleFactor * this.dimensions.x;
        const textConfig = new TextConfig({
            font: txtCfg.fontFamily,
            size: fontSize
        }).alignCenter();

        for(const type of scoreTypes)
        {
            let xPos = this.anchorPos.x + this.padding;

            const alpha = CONFIG.sideBar.scoreTextAlpha;

            const colorHex = COLOR_GROUPS[CELLS[type].colorGroup];
            const borderRadius = 10;
            const color = new Color(colorHex);
            const alphaBG = 0.66;
            color.a = alphaBG;

            // create the rounded rectangle behind it
            const opRect = new LayoutOperation({ fill: color });
            const rectPos = new Point(xPos-0.5*this.padding, this.anchorPos.y-2);
            const rectSize = new Point(this.dimensions.x-this.padding, iconSize+4);
            const rectPath = new Rectangle().fromTopLeft(rectPos, rectSize).toPath();
            const pathRounded = new Path( roundPath(rectPath, borderRadius) );
            pathToPhaser(pathRounded, opRect, boardDisplay.graphics);
            
            // the type being scored
            const resIcon = CONFIG.resLoader.getResource(CONFIG.cellTexture);
            const opIcon = new LayoutOperation({
                translate: new Point(xPos, this.anchorPos.y),
                frame: CELLS[type].frame,
                dims: new Point(iconSize)
            });
            imageToPhaser(resIcon, opIcon, boardDisplay.game);

            // the empty spaces for doing so
            for(let i = 0; i < 10; i++)
            {
                xPos += iconSize;

                const opBox = new LayoutOperation({
                    translate: new Point(xPos, this.anchorPos.y),
                    frame: GENERAL.writingSpace.frame,
                    dims: new Point(iconSize)
                });
                imageToPhaser(resGeneral, opBox, boardDisplay.game);

                let value = null;
                if(type == "chests") { value = i * 5; }
                else if(type == "toys") { value = (Math.floor(i / 3) + 1) * 5; }
                else if(type == "gems") { value = CELLS.gems.scoreValues[i]; }

                if(value != null)
                {
                    const opText = new LayoutOperation({
                        translate: new Point(opBox.translate.x + 0.5*iconSize, opBox.translate.y + 0.5*iconSize),
                        dims: new Point(iconSize),
                        fill: txtCfg.color,
                        pivot: Point.CENTER,
                        alpha: alpha
                    });
                    const resText = new ResourceText({ text: value.toString(), textConfig: textConfig });
                    textToPhaser(resText, opText, boardDisplay.game);
                }
            }

            this.anchorPos.y += iconSize;

        }

    }
}