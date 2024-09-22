import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import { CATEGORIES, Category } from "../js_shared/dict";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig, { TextAlign, TextWeight } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TintEffect from "js/pq_games/layout/effects/tintEffect";

export default class Card
{
    type: Category;
    category: Category;
    text: string;
    pack: string;

    constructor(c: Category, text: string, pack: string)
    {
        this.category = c;
        this.type = this.category; // this is merely to use my automatic system for drawing that only does one per "type"
        this.text = text;
        this.pack = pack;
    }

    getCategoryData() { return CATEGORIES[this.category]; }
    
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawCategory(vis, group);
        this.drawText(vis, group);
        this.drawMetaText(vis, group);
        
        group.toCanvas(ctx);
        this.drawOutline(vis, ctx);

        return ctx.canvas;
    }

    drawBackground(vis:Visualizer, group: ResourceGroup, ctx)
    {
        // complete fill with dark color
        const data = this.getCategoryData();
        let col = vis.inkFriendly ? "#FFFFFF" : data.colorText;
        fillCanvas(ctx, col);

        // overlay tintable templates
        // first the light one that will contain text
        const res = vis.resLoader.getResource("tintable_templates");
        const effects = vis.inkFriendly ? [] : [new TintEffect({ color: data.colorBG })]
        const resOp = new LayoutOperation({
            frame: 0,
            effects: effects,
            size: vis.size,
        });
        group.add(res, resOp.clone());

        // then the darker one with decorations + bubbly clouds
        resOp.frame = 1;
        resOp.effects = vis.inkFriendly ? [] : [new TintEffect({ color: data.colorMid })];
        group.add(res, resOp.clone());
    }

    drawCategory(vis:Visualizer, group:ResourceGroup)
    {
        // category icons in 4 corners
        const res = vis.resLoader.getResource("categories");
        const cornerOffset = CONFIG.cards.category.iconOffset.clone().scale(vis.sizeUnit);
        const corners = getRectangleCornersWithOffset(vis.size, cornerOffset);
        const data = this.getCategoryData();
        const iconDims = new Point(CONFIG.cards.category.iconSize * vis.sizeUnit);

        for(let i = 0; i < corners.length; i++)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                pos: corners[i],
                flipY: (i <= 1),
                size: iconDims,
                effects: vis.effects,
                pivot: Point.CENTER
            });
            group.add(res, resOp);
        }

        // much bigger (but faded) icons above and below text
        const bigIconDims = new Point(CONFIG.cards.category.iconSizeBig * vis.sizeUnit);
        const bigYPos = CONFIG.cards.category.bigIconYPos * vis.size.y;
        const positions = [
            new Point(vis.center.x, bigYPos),
            new Point(vis.center.x, vis.size.y - bigYPos)
        ];

        for(let i = 0; i < positions.length; i++)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                pos: positions[i],
                flipY: (i <= 0),
                size: bigIconDims,
                effects: vis.effects,
                pivot: Point.CENTER
            })
            if(vis.inkFriendly) { 
                resOp.alpha = 0.4; 
            } else {
                resOp.composite = "overlay"; 
            }
            group.add(res, resOp);
        }
        
    }

    drawText(vis:Visualizer, group:ResourceGroup)
    {
        const text = this.text;
        const textLength = text.length;
        let fontSizeRaw = CONFIG.cards.text.fontSize.large;
        if(textLength >= CONFIG.cards.text.fontSizeCutoffs.large) { fontSizeRaw = CONFIG.cards.text.fontSize.medium; }
        if(textLength >= CONFIG.cards.text.fontSizeCutoffs.medium) { fontSizeRaw = CONFIG.cards.text.fontSize.small; }
        if(textLength >= CONFIG.cards.text.fontSizeCutoffs.small)
        {
            console.error("A card has text that's too long for any font size (" + textLength + " characters): ", text);
        }

        const fontSize = fontSizeRaw * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            weight: TextWeight.BOLD
        }).alignCenter();

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = CONFIG.cards.text.size.clone().scale(vis.size);
        const categoryData = this.getCategoryData();
        const colorText = vis.inkFriendly ? "#000000" : (categoryData.colorText ?? "#000000");

        const textOp = new LayoutOperation({
            pos: vis.center,
            size: textDims,
            fill: colorText,
            pivot: Point.CENTER
        });
        group.add(resText, textOp);
    }

    drawMetaText(vis:Visualizer, group: ResourceGroup)
    {
        const texts = ["Category: " + this.category, "Pack: " + this.pack];
        const fontSize = CONFIG.cards.textMeta.fontSize * vis.sizeUnit;
        const yPos = CONFIG.cards.textMeta.yPos * vis.size.y;
        const size = new Point(CONFIG.cards.textMeta.textBlockWidth * vis.size.x, 1.5*fontSize);
        const positions = [
            new Point(vis.center.x, yPos),
            new Point(vis.center.x, vis.size.y-yPos)
        ]

        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
        }).alignCenter();

        const textConfigLeft = textConfig.clone();
        textConfigLeft.alignHorizontal = TextAlign.START;

        const textConfigRight = textConfig.clone();
        textConfigRight.alignHorizontal = TextAlign.END;
        const textConfigs = [textConfigLeft, textConfigRight];

        const textOp = new LayoutOperation({
            fill: vis.inkFriendly ? "#212121" : "#FFFFFF",
            pivot: Point.CENTER,
            size: size
        })

        const subGroupOp = new LayoutOperation({
            pos: positions[0],
            rot: Math.PI,
            pivot: Point.CENTER,
        })

        const subGroup = new ResourceGroup();
        for(let a = 0; a < 2; a++)
        {
            const resText = new ResourceText({ text: texts[a], textConfig: textConfigs[a] });
            subGroup.add(resText, textOp);
        }

        group.add(subGroup, subGroupOp.clone());

        subGroupOp.pos = positions[1];
        subGroupOp.rot = 0;
        group.add(subGroup, subGroupOp.clone());
    }

    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}