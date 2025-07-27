import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_TEMPLATES, CardType, ColorType, DYNAMIC_STRINGS, MATERIAL, TYPES } from "../shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import Color from "js/pq_games/layout/color/color";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import RectangleRounded from "js/pq_games/tools/geometry/rectangleRounded";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";

export default class Card
{
    type: CardType;
    action: string;
    actionString: string;
    color: ColorType;
    scoreValue: number = null;
    dynamicValues: any[] = [];

    constructor(type:CardType)
    {
        this.type = type;
    }

    setColor(c:ColorType)
    {
        this.color = c;
    }

    setAction(key:string)
    {
        this.action = key;

        let str = this.getActionData().desc;
        const replacements = structuredClone(DYNAMIC_STRINGS);
        
        let replacedSomething = true;
        while(replacedSomething)
        {
            replacedSomething = false;

            for(const [needle,options] of Object.entries(replacements))
            {
                if(!str.includes(needle)) { continue; }

                const option = shuffle(options).pop().toString();
                str = str.replace(needle, option);
                replacedSomething = true;

                // track the exact values for the interactive rulebook example/simulation
                this.dynamicValues.push(!isNaN(parseInt(option)) ? parseInt(option) : option);

                // @NOTE: track score numbers within text, which always represent point values on regular cards
                if(this.type == CardType.REGULAR)
                {
                    const isNumber = !isNaN( parseInt(option) );
                    if(!this.scoreValue && isNumber) { this.scoreValue = parseInt(option); }
                }
            }
        }

        this.actionString = str;
    }

    getActionData()
    {
        return MATERIAL[this.type][this.action] ?? {};
    }

    hasSpecialAction()
    {
        return Object.keys(this.getActionData()).length > 0;
    }

    getTemplateData()
    {
        const key = this.type == CardType.MISSION ? CardType.MISSION : this.color;
        return CARD_TEMPLATES[key];
    }

    isEmpty()
    {
        return (this.getActionData().desc ?? "").length <= 0;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        this.drawBackground(vis, group);
        this.drawType(vis, group);
        this.drawAction(vis, group);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        fillResourceGroup(vis.size, group, "#FFFFFF");

        // to fill that gap with the same color on empty cards
        const tempData = this.getTemplateData();
        if(this.isEmpty() && !vis.inkFriendly)
        {
            fillResourceGroup(vis.size, group, tempData.hex);
        }
        
        // the color + pattern background
        const res = vis.getResource("card_templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: tempData.frame,
            alpha: vis.inkFriendly ? 0.4 : 1.0
        });
        group.add(res, op);

        let colLight = new Color(tempData.hex).lighten(45);
        let colDark = new Color(tempData.hex).darken(45);
        if(vis.inkFriendly)
        {
            colLight = new Color("#FFFFFF");
            colDark = new Color("#222222");
        }

        if(this.type == CardType.MISSION)
        {
            colLight = colDark;
            colDark = new Color(tempData.hex);
        }


        // the title of the card
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.title.fontSize")
        }).alignCenter();
        const label = this.type == CardType.MISSION ? "Mission" : this.getActionData().label;
        const resText = new ResourceText(label, textConfig);
        const opText = new LayoutOperation({
            pos: vis.get("cards.title.pos"),
            size: vis.get("cards.title.textBoxSize"),
            fill: colLight,
            stroke: colDark,
            strokeWidth: vis.get("cards.title.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        group.add(resText, opText);

    }

    drawType(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.isEmpty()) { return; }

        const tempData = this.getTemplateData();

        const shouldShowScoreValue = this.scoreValue != null;

        const rectSize = vis.get("cards.corners.rectSize");
        const cornerRadius = vis.get("cards.corners.rectRadius");
        const resRect = new ResourceShape(new RectangleRounded({ center: new Point(), extents: rectSize, radius: cornerRadius }));

        const strokeColor = tempData.hex;
        const strokeWidth = vis.get("cards.corners.strokeWidth");

        const resType = vis.getResource("types");
        const iconSize = vis.get("cards.corners.iconSize");

        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.corners.offset"));
        for(let i = 0; i < positions.length; i++)
        {
            const showScore = i % 2 == 1;
            if(showScore && !shouldShowScoreValue) { continue; }

            const fillColor = showScore ? "#000000" : "#FFFFFF";

            const opRect = new LayoutOperation({
                pos: positions[i],
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE
            });
            if(vis.inkFriendly) { opRect.strokeWidth = 0; }
            group.add(resRect, opRect);

            if(showScore) {
                const textConfig = new TextConfig({
                    font: vis.get("fonts.heading"),
                    size: vis.get("cards.corners.fontSize")
                }).alignCenter();

                const resText = new ResourceText(this.scoreValue.toString(), textConfig);
                const opText = new LayoutOperation({
                    pos: positions[i],
                    size: rectSize,
                    pivot: Point.CENTER,
                    fill: "#FFFFFF"
                });
                group.add(resText, opText);
            } else {
                const opType = new LayoutOperation({
                    pos: positions[i], 
                    size: iconSize,
                    pivot: Point.CENTER,
                    frame: TYPES[this.type].frame
                });
                group.add(resType, opType);
            }
        }

        // add "composite overlay" downwards type written
        const textConfigType = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.corners.type.fontSize"),
            lineHeight: 0.9,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.START,
        })
        let typeVertical = "";
        for(let i = 0; i < this.type.length; i++)
        {
            typeVertical += this.type.charAt(i).toUpperCase() + "\n";
        }

        const resText = new ResourceText(typeVertical, textConfigType);
        const typeTextOffset = vis.get("cards.corners.type.offset");
        const anchors = [
            typeTextOffset,
            vis.size.clone().sub(typeTextOffset)
        ]
        for(let i = 0; i < 2; i++)
        {
            const opText = new LayoutOperation({
                pos: anchors[i],
                rot: i * Math.PI,
                size: new Point(2.0 * textConfigType.size, 0.5*vis.size.y),
                pivot: new Point(0.5, 0),
                fill: "#FFFFFF",
                composite: "overlay",
                alpha: vis.get("cards.corners.type.alpha")
            });
            group.add(resText, opText);
        }
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasSpecialAction()) { return; }

        const actionData = this.getActionData();

        // the specific icon
        const hasIcon = this.type != CardType.MISSION;
        const iconSize = vis.get("cards.icon.size");
        const effects = [new DropShadowEffect({ color: "#000000AA", blur: 0.05 * iconSize.x }), vis.inkFriendlyEffect].flat();
        if(hasIcon)
        {
            const iconKey = this.type + "_cards";
            console.log(iconKey);
            const res = vis.getResource(iconKey);
            const op = new LayoutOperation({
                pos: vis.get("cards.icon.pos"),
                frame: actionData.frame,
                size: iconSize,
                pivot: Point.CENTER,
                effects: effects
            });
            group.add(res, op);
        }

        // the action text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.fontSize")
        }).alignCenter();
        const resText = new ResourceText(this.actionString, textConfig);
        const opText = new LayoutOperation({
            pos: vis.get("cards.action.pos"),
            size: vis.get("cards.action.textBoxSize"),
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }
}