
import { MaterialVisualizer, createContext, ResourceGroup, fillCanvas, TintEffect, LayoutOperation, getRectangleCornersWithOffset, Vector2, TextConfig, TextWeight, ResourceText, TextAlign } from "lib/pq-games";
import { CATEGORIES, Category } from "../shared/dict";

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
    
    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawCategory(vis, group);
        this.drawText(vis, group);
        this.drawMetaText(vis, group);
        
        group.toCanvas(ctx);

        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group: ResourceGroup, ctx)
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
            pivot: Vector2.ZERO,
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

    drawCategory(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // category icons in 4 corners
        const res = vis.resLoader.getResource("categories");
        const cornerOffset = vis.get("cards.category.iconOffset").clone().scale(vis.sizeUnit);
        const corners = getRectangleCornersWithOffset(vis.size, cornerOffset);
        const data = this.getCategoryData();
        const iconDims = new Vector2(vis.get("cards.category.iconSize") * vis.sizeUnit);

        for(let i = 0; i < corners.length; i++)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                pos: corners[i],
                flipY: (i <= 1),
                size: iconDims,
                effects: vis.inkFriendlyEffect,
                pivot: Vector2.CENTER
            });
            group.add(res, resOp);
        }

        // much bigger (but faded) icons above and below text
        const bigIconDims = new Vector2(vis.get("cards.category.iconSizeBig") * vis.sizeUnit);
        const bigYPos = vis.get("cards.category.bigIconYPos") * vis.size.y;
        const positions = [
            new Vector2(vis.center.x, bigYPos),
            new Vector2(vis.center.x, vis.size.y - bigYPos)
        ];

        for(let i = 0; i < positions.length; i++)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                pos: positions[i],
                flipY: (i <= 0),
                size: bigIconDims,
                effects: vis.inkFriendlyEffect,
                pivot: Vector2.CENTER
            })
            if(vis.inkFriendly) { 
                resOp.alpha = 0.4; 
            } else {
                resOp.composite = "overlay"; 
            }
            group.add(res, resOp);
        }
        
    }

    drawText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const text = this.text;
        const textLength = text.length;

        const textData = vis.get("cards.text");
        let fontSizeRaw = textData.fontSize.large;
        if(textLength >= textData.fontSizeCutoffs.large) { fontSizeRaw = textData.fontSize.medium; }
        if(textLength >= textData.fontSizeCutoffs.medium) { fontSizeRaw = textData.fontSize.small; }
        if(textLength >= textData.fontSizeCutoffs.small)
        {
            console.error("A card has text that's too long for any font size (" + textLength + " characters): ", text);
        }

        const fontSize = fontSizeRaw * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            weight: TextWeight.BOLD
        }).alignCenter();

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = vis.get("cards.text.size").clone().scale(vis.size);
        const categoryData = this.getCategoryData();
        const colorText = vis.inkFriendly ? "#000000" : (categoryData.colorText ?? "#000000");

        const textOp = new LayoutOperation({
            pos: vis.center,
            size: textDims,
            fill: colorText,
            pivot: Vector2.CENTER
        });
        group.add(resText, textOp);
    }

    drawMetaText(vis:MaterialVisualizer, group: ResourceGroup)
    {
        const texts = ["Category: " + this.category, "Pack: " + this.pack];
        const fontSize = vis.get("cards.textMeta.fontSize") * vis.sizeUnit;
        const yPos = vis.get("cards.textMeta.yPos") * vis.size.y;
        const size = new Vector2(vis.get("cards.textMeta.textBlockWidth") * vis.size.x, 1.5*fontSize);
        const positions = [
            new Vector2(vis.center.x, yPos),
            new Vector2(vis.center.x, vis.size.y-yPos)
        ]

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();

        const textConfigLeft = textConfig.clone();
        textConfigLeft.alignHorizontal = TextAlign.START;

        const textConfigRight = textConfig.clone();
        textConfigRight.alignHorizontal = TextAlign.END;
        const textConfigs = [textConfigLeft, textConfigRight];

        const textOp = new LayoutOperation({
            fill: vis.inkFriendly ? "#212121" : "#FFFFFF",
            pivot: Vector2.CENTER,
            size: size
        })

        const subGroupOp = new LayoutOperation({
            pos: positions[0],
            rot: Math.PI,
            pivot: Vector2.CENTER,
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
}