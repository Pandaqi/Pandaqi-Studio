import Color from "js/pq_games/layout/color/color";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";
import Path from "js/pq_games/tools/geometry/paths/path";
import roundPath from "js/pq_games/tools/geometry/paths/roundPath";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { CELLS, COLOR_GROUPS, GENERAL } from "../js_shared/dictionary";
import BoardDisplay from "./boardDisplay";
import BoardState from "./boardState";
import CONFIG from "./config";

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
    }

    draw(vis: BoardVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay, boardState:BoardState)
    {
        this.drawBackground(vis, group, boardDisplay);
        this.drawTutorials(vis, group, boardDisplay, boardState);
        this.drawScoreSheets(vis, group, boardDisplay);
    }

    drawBackground(vis: BoardVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay)
    {
        const borderRadius = CONFIG.sideBar.borderRadius * this.dimensions.x;
        const col = CONFIG.inkFriendly ? "#EDEDED" : CONFIG.sideBar.backgroundColor;

        const op = new LayoutOperation({ fill: col });
        const rectPath = new Rectangle().fromTopLeft(this.anchorPos, this.dimensions);
        const pathRounded = new Path( roundPath(rectPath, borderRadius) );
        group.add(new ResourceShape(pathRounded), op);
    }

    drawTutorials(vis: BoardVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay, boardState:BoardState)
    {
        if(CONFIG.sideBarType != "rules") { return; }

        this.anchorPos.move(this.padding);

        const res = vis.getResource("sidebar_tutorial");
        const tutRatio = (1067.0/895);
        const tutSizeX = this.dimensions.x - 2*this.padding;
        const tutSizeY = tutRatio * tutSizeX;
        const op = new LayoutOperation({
            pos: this.anchorPos.clone(),
            pivot: new Point(),
            size: new Point(tutSizeX, tutSizeY)
        })
        group.add(res, op);

        this.anchorPos.y += tutSizeY;

        const types = boardState.getIncludedTypes();
        const tutorialHeight = CONFIG.sideBar.tutorialSpriteHeight * this.dimensions.y;
        for(const type of types)
        {
            this.drawTutorial(vis, group, boardDisplay, tutorialHeight, type);
        }
    }

    drawTutorial(vis: BoardVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay, tutorialHeight:number, type:string)
    {
        const pos = new Point().setXY(
            this.anchorPos.x + 0.5*tutorialHeight, 
            this.anchorPos.y + 0.5*tutorialHeight
        );

        const tutorialWidth = tutorialHeight;
        const res = vis.getResource("general_spritesheet");
        const op = new LayoutOperation({
            pos: pos,
            size: new Point(tutorialHeight),
            frame: GENERAL.tutorialIcon.frame,
            pivot: Point.CENTER
        });
        group.add(res, op);

        const resIcon = vis.getResource(CONFIG.cellTexture);
        const frame = CELLS[type].frame;
        const iconSize = 0.5*tutorialHeight;
        const opIcon = new LayoutOperation({
            pos: pos,
            size: new Point(iconSize),
            frame: frame,
            pivot: Point.CENTER
        });
        group.add(resIcon, opIcon);

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
            pos: textPos,
            size: new Point(leftoverWidth, tutorialHeight),
            fill: txtCfg.color,
            pivot: new Point(0, 0.5)
        })
        const resText = new ResourceText({ text: explanation, textConfig: textConfig });
        group.add(resText, opText);

        this.anchorPos.y += tutorialHeight;
    }

    drawScoreSheets(vis: BoardVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay)
    {
        if(CONFIG.sideBarType != "score") { return; }

        const maxNumPlayers = CONFIG.maxNumPlayers;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.drawScoreSheet(vis, group, boardDisplay);
        }
    }

    drawScoreSheet(vis: BoardVisualizer, group:ResourceGroup, boardDisplay:BoardDisplay)
    {
        this.anchorPos.y += this.padding;

        const yPosHeader = this.anchorPos.y + 0.05*this.dimensions.x;
        const xPosHeader = this.anchorPos.x + 0.5*this.dimensions.x;
        const posHeader = new Point(xPosHeader, yPosHeader);
        const sizeHeader = new Point(0.5 * this.dimensions.x);
        const resGeneral = vis.getResource("general_spritesheet");
        const opHeader = new LayoutOperation({
            pos: posHeader,
            size: sizeHeader,
            frame: GENERAL.header.frame,
            pivot: Point.CENTER
        });
        group.add(resGeneral, opHeader);
        
        this.anchorPos.y += 0.25*sizeHeader.y;

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
            group.add(new ResourceShape(pathRounded), opRect);
            
            // the type being scored
            const resIcon = vis.getResource(CONFIG.cellTexture);
            const opIcon = new LayoutOperation({
                pos: new Point(xPos, this.anchorPos.y),
                frame: CELLS[type].frame,
                size: new Point(iconSize)
            });
            group.add(resIcon, opIcon);

            // the empty spaces for doing so
            for(let i = 0; i < 10; i++)
            {
                xPos += iconSize;

                const opBox = new LayoutOperation({
                    pos: new Point(xPos, this.anchorPos.y),
                    frame: GENERAL.writingSpace.frame,
                    size: new Point(iconSize)
                });
                group.add(resGeneral, opBox);

                let value = null;
                if(type == "chests") { value = i * 5; }
                else if(type == "toys") { value = (Math.floor(i / 3) + 1) * 5; }
                else if(type == "gems") { value = CELLS.gems.scoreValues[i]; }

                if(value != null)
                {
                    const opText = new LayoutOperation({
                        pos: new Point(opBox.pos.x + 0.5*iconSize, opBox.pos.y + 0.5*iconSize),
                        size: new Point(iconSize),
                        fill: txtCfg.color,
                        pivot: Point.CENTER,
                        alpha: alpha
                    });
                    const resText = new ResourceText({ text: value.toString(), textConfig: textConfig });
                    group.add(resText, opText);
                }
            }

            this.anchorPos.y += iconSize;

        }

    }
}