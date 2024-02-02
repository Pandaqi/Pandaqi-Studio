import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { CardType } from "./dictShared";
import createContext from "js/pq_games/layout/canvas/createContext";
import MaterialNaivigation from "./materialNaivigation";

const drawCardBackground = (vis, group, card, ctx) =>
{
    // main background color
    const tempData = card.getTemplateData();
    const bgColor = vis.inkFriendly ? "#FFFFFF" : (tempData.bgColor ?? "#FFFFFF");
    fillCanvas(ctx, bgColor);

    // the blobby shapes on the background
    const resBlobs = vis.getResource("bg_blobs");
    const blobFrame = rangeInteger(0, vis.get("cards.general.numBackgroundBlobs") - 1);
    const pos = new Point(0.5 * vis.sizeUnit);
    const dims = vis.get("cards.background.dims");
    const randRotationBlob = rangeInteger(0,3) * 0.5 * Math.PI;
    const blobsOp = new LayoutOperation({
        translate: pos,
        dims: dims,
        rotation: randRotationBlob,
        flipX: Math.random() <= 0.5,
        frame: blobFrame,
        composite: "overlay",
        alpha: vis.get("cards.background.blobAlpha"),
        pivot: Point.CENTER
    })

    group.add(resBlobs, blobsOp);

    // the overlaid pattern
    const resPattern = vis.getResource("misc");
    const frame = card.getMisc().game_pattern.frame;
    const randRotationPattern = rangeInteger(0,3) * 0.5 * Math.PI;
    const patternOp = new LayoutOperation({
        translate: pos,
        dims: dims,
        rotation: randRotationPattern,
        frame: frame,
        composite: "overlay",
        alpha: vis.get("cards.background.patternAlpha"),
        pivot: Point.CENTER
    });

    // Should be: F5A540
    // Is actually: D4AB77

    console.log(patternOp);

    group.add(resPattern, patternOp);
}

const drawCard = (vis, group, card) =>
{
    const data = card.getData();
    const tempData = card.getTemplateData();

    // the template behind text
    const resTemplate = vis.getResource("card_templates");
    const tempEffects = [];
    if(card.type == CardType.VEHICLE || card.type == CardType.ACTION)
    {
        tempEffects.push(new TintEffect(tempData.tintColor));
    }

    const templateOp = new LayoutOperation({
        translate: vis.size,
        dims: new Point(vis.sizeUnit),
        frame: tempData.frameTemplate,
        effects: tempEffects,
        pivot: Point.ONE
    })

    group.add(resTemplate, templateOp);

    // card title + subtitle ( = type indicator)
    const textConfig = new TextConfig({
        font: vis.get("fonts.heading"),
        size: vis.get("cards.general.fontSize")
    }).alignCenter();

    const text = (data.label ?? tempData.label) ?? "No Label";
    const resText = new ResourceText({ text: text, textConfig: textConfig });
    const textPos = vis.get("cards.general.textPos");
    const textOp = new LayoutOperation({
        translate: textPos,
        dims: new Point(vis.size.x, textConfig.size*2), 
        fill: "#000000",
        stroke: "#FFFFFF",
        strokeWidth: vis.get("cards.general.strokeWidth"),
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: Point.CENTER
    });

    group.add(resText, textOp);

    const textMeta = data.subText ?? tempData.subText;
    const metaPos = textPos.clone().add(new Point(0, 0.5*textConfig.size + 0.5*vis.get("cards.general.fontSizeMeta")));
    if(textMeta)
    {
        const textConfigMeta = textConfig.clone();
        textConfigMeta.size = vis.get("cards.general.fontSizeMeta");
        const resTextMeta = new ResourceText({ text: textMeta, textConfig: textConfigMeta });
        const textMetaOp = new LayoutOperation({
            translate: metaPos,
            dims: new Point(vis.size.x, textConfigMeta.size*2),
            fill: "#000000",
            alpha: vis.get("cards.general.alphaMeta"),
            pivot: Point.CENTER
        })

        group.add(resTextMeta, textMetaOp);
    }

    // card number (if needed)
    const textNumber = data.num + "";
    if(textNumber && tempData.extraNumberOffset)
    {
        const textConfigNumber = textConfig.clone();
        textConfigNumber.size = vis.get("cards.general.extraNumber.fontSize");
        const baseOffset = tempData.extraNumberOffset.clone().scale(vis.sizeUnit);
        const positions = [
            textPos.clone().add(new Point(-baseOffset.x, baseOffset.y)),
            textPos.clone().add(new Point(baseOffset.x, baseOffset.y))
        ]

        for(const pos of positions)
        {
            const resTextNumber = new ResourceText({ text: textNumber, textConfig: textConfigNumber });
            const textNumberOp = new LayoutOperation({
                translate: pos,
                dims: new Point(textConfigNumber.size*2),
                fill: "#000000", // @TODO: correct colors
                stroke: "#FFFFFF",
                strokeWidth: vis.get("cards.general.extraNumber.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER
            })

            group.add(resTextNumber, textNumberOp);
        }
    }

    // main card content (if available)
    const textContent = data.desc ?? tempData.desc;
    if(textContent)
    {
        const textConfigContent = textConfig.clone();
        textConfigContent.size = vis.get("cards.general.fontSizeContent");
        textConfigContent.font = vis.get("fonts.body");

        const contentPos = metaPos.clone().add(new Point(0, 0.5*(vis.size.y - metaPos.y)));

        const resTextContent = new ResourceText({ text: textContent, textConfig: textConfigContent });
        const textContentOp = new LayoutOperation({
            translate: contentPos,
            dims: vis.get("cards.general.contentTextBox"),
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resTextContent, textContentOp);

        // @TODO: exception for GPS card, which has 2 randomly generated phrases at bottom
    }
}

const drawCardIcons = (vis, group, card) =>
{
    // the main illustration at the top
    const typeData = card.getData();
    const tempData = card.getTemplateData();
    const resSprite = vis.getResource("icons");
    const spriteFrame = tempData.frameIcon ?? typeData.frame;
    const spriteOp = new LayoutOperation({
        translate: vis.get("cards.general.illustration.mainPos"),
        frame: spriteFrame,
        dims: vis.get("cards.general.illustration.mainDims"),
        pivot: Point.CENTER
    });

    group.add(resSprite, spriteOp);

    // smaller illustrations, usually to the sides of title
    // (how many/at which position they're placed depends on the card type)
    const hasSmallIcons = tempData.smallIconOffset;
    if(hasSmallIcons)
    {
        const smallDims = vis.get("cards.general.illustration.smallDims");
        const anchorPos = vis.get("cards.general.textPos");
        const anchorOffset = tempData.smallIconOffset.clone().scale(vis.sizeUnit);
        
        const smallPositions = [
            anchorPos.clone().add(new Point(-anchorOffset.x, anchorOffset.y)),
            anchorPos.clone().add(new Point(anchorOffset.x, anchorOffset.y))
        ]
        
        for(const pos of smallPositions)
        {
            const onRightSide = pos.x > vis.center.x;
            const spriteOpSmall = new LayoutOperation({
                translate: pos,
                frame: spriteFrame,
                dims: smallDims,
                pivot: Point.CENTER,
                flipX: onRightSide
            })

            if(card.type == CardType.ACTION) { spriteOpSmall.composite = "overlay"; }
    
            group.add(resSprite, spriteOpSmall)
        }
    }
    
    // illustrations to show GAME TYPE
    // (how many/at which positions they're placed depends on the card type)
    const resIcon = vis.getResource("misc");
    const iconPositions = [];
    const iconDims = vis.get("cards.general.gameIcon.dims");

    const defaultPos =  vis.get("cards.general.gameIcon.posDefault");
    const offset = iconDims.clone();
    const cornerPositions = getRectangleCornersWithOffset(vis.size, offset);
    
    if(card.type == CardType.VEHICLE || card.type == CardType.HEALTH || card.type == CardType.ACTION)
    {
        iconPositions.push(defaultPos);
    }

    iconPositions.push(cornerPositions[0]);
    iconPositions.push(cornerPositions[1]);

    for(const pos of iconPositions)
    {
        const onRightSide = pos.x > vis.center.x;
        const onBottomSide = pos.y > 0.75*vis.size.y;
        const iconOp = new LayoutOperation({
            translate: pos,
            frame: card.getMisc().game_icon.frame,
            dims: iconDims,
            pivot: Point.CENTER,
            flipX: onRightSide,
            flipY: onBottomSide,
        })
        group.add(resIcon, iconOp);
    }   
}

// This is the default card drawer for all types, used by shared material. 
// It's what most other games and variants need, but not all of them
// Which is why I decided each game has to manually call it, instead of making this 100% automatic for each game
// The Card object holds the functions/data to grab the correct dictionaries/resources it needs
export default (vis:MaterialVisualizer, card:MaterialNaivigation) =>
{
    const ctx = createContext({ size: vis.size });
    const group = new ResourceGroup();

    drawCardBackground(vis, group, card, ctx);
    drawCard(vis, group, card);
    drawCardIcons(vis, group, card);

    group.toCanvas(ctx);
    return ctx.canvas;
}