import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import Color from "js/pq_games/layout/color/color";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { CardType, GPS_ICONS } from "./dictShared";
import MaterialNaivigation from "./materialNaivigation";

const drawCardBackground = (vis, group, card) =>
{
    // main background color
    const tempData = card.getTemplateData();
    const gameData = card.getGameData();
    let bgColor = gameData ? gameData.bgColor : tempData.bgColor;
    bgColor = vis.inkFriendly ? "#FFFFFF" : bgColor;
    fillResourceGroup(vis.size, group, bgColor);

    // the blobby shapes on the background
    const resBlobs = vis.getResource("bg_blobs");
    const blobFrame = rangeInteger(0, vis.get("cards.general.numBackgroundBlobs") - 1);
    const pos = new Point(0.5 * vis.sizeUnit);
    const size = vis.get("cards.background.size");
    const randRotationBlob = rangeInteger(0,3) * 0.5 * Math.PI;
    let blobsCol = new Color(bgColor);
    blobsCol = blobsCol.rotate(6);
    blobsCol = blobsCol.saturate(10);
    blobsCol = blobsCol.darken(8);

    const blobsOp = new LayoutOperation({
        pos: pos,
        size: size,
        rot: randRotationBlob,
        flipX: Math.random() <= 0.5,
        frame: blobFrame,
        effects: [new TintEffect({ color: blobsCol })],
        //alpha: vis.get("cards.background.blobAlpha"),
        pivot: Point.CENTER
    })

    group.add(resBlobs, blobsOp);

    // the overlaid pattern
    const resPattern = vis.getResource("misc");
    const frame = card.getMisc().game_pattern.frame;
    const randRotationPattern = rangeInteger(0,3) * 0.5 * Math.PI;
    const patternOp = new LayoutOperation({
        pos: pos,
        size: size,
        rot: randRotationPattern,
        frame: frame,
        composite: "overlay",
        alpha: vis.get("cards.background.patternAlpha"),
        pivot: Point.CENTER
    });

    group.add(resPattern, patternOp);

    // the template behind text
    const resTemplate = vis.getResource("card_templates");
    const tempEffects = [];
    let tintColor = gameData ? gameData.tintColor : tempData.tintColor;
    if(!vis.inkFriendly)
    {
        if(card.type == CardType.VEHICLE || card.type == CardType.ACTION)
        {
            tempEffects.push(new TintEffect(tintColor));
        }
    }

    const templateOp = new LayoutOperation({
        pos: vis.size,
        size: new Point(vis.sizeUnit),
        frame: tempData.frameTemplate,
        effects: tempEffects,
        pivot: Point.ONE
    })

    group.add(resTemplate, templateOp);
}

const drawCard = (vis, group, card) =>
{
    const data = card.getData();
    const tempData = card.getTemplateData();

    // card title + subtitle ( = type indicator)
    const textConfig = new TextConfig({
        font: vis.get("fonts.heading"),
        size: vis.get("cards.general.fontSize")
    }).alignCenter();

    const text = (data.label ?? tempData.label) ?? "No Label";
    const resText = new ResourceText({ text: text, textConfig: textConfig });
    const textPos = vis.get("cards.general.textPos");
    const shadowOffset = new Point(0, 0.1*textConfig.size);
    const eff = new DropShadowEffect({ color: "#000000AA", offset: shadowOffset });
    const textOp = new LayoutOperation({
        pos: textPos,
        size: new Point(vis.size.x, textConfig.size*2), 
        fill: "#000000",
        stroke: "#FFFFFF",
        effects: [eff],
        strokeWidth: vis.get("cards.general.strokeWidth"),
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: Point.CENTER
    });

    group.add(resText, textOp);

    const textMeta = data.subText ?? tempData.subText;
    const metaPos = textPos.clone().add(new Point(0, 0.5*textConfig.size + 0.5*vis.get("cards.general.fontSizeMeta") + shadowOffset.y));
    if(textMeta)
    {
        const textConfigMeta = textConfig.clone();
        textConfigMeta.size = vis.get("cards.general.fontSizeMeta");
        const resTextMeta = new ResourceText({ text: textMeta, textConfig: textConfigMeta });
        const textMetaOp = new LayoutOperation({
            pos: metaPos,
            size: new Point(vis.size.x, textConfigMeta.size*2),
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
        const dropShadowEff = new DropShadowEffect({ color: "#00000077", offset: new Point(0, 0.1 * textConfigNumber.size) });

        for(const pos of positions)
        {
            const resTextNumber = new ResourceText({ text: textNumber, textConfig: textConfigNumber });
            const textNumberOp = new LayoutOperation({
                pos: pos,
                size: new Point(textConfigNumber.size*2),
                fill: "#000000", // @TODO: correct colors
                stroke: "#FFFFFF",
                strokeWidth: vis.get("cards.general.extraNumber.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Point.CENTER,
                effects: [dropShadowEff]
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
            pos: contentPos,
            size: vis.get("cards.general.contentTextBox"),
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resTextContent, textContentOp);

        // @TODO: exception for GPS card, which has 2 randomly generated phrases at bottom
    }

    const isGPSCard = (card.type == CardType.GPS);
    if(isGPSCard)
    {
        const textConfigGPS = new TextConfig({
            size: vis.get("cards.general.gps.fontSize"),
            font: vis.get("fonts.body")
        }).alignCenter();

        const op = new LayoutOperation({
            fill: vis.get("cards.general.gps.fontColor"),
            size: vis.get("cards.general.gps.textBoxDims"),
            pivot: Point.CENTER
        });

        const iconOffsetX = vis.get("cards.general.gps.iconOffset");
        const resIcon = vis.getResource("icons");
        const iconOp = new LayoutOperation({
            size: vis.get("cards.general.gps.textBoxIconDims"),
            pivot: Point.CENTER
        })

        if(card.customData.reward)
        {
            const resText = new ResourceText({ text: card.customData.reward, textConfig: textConfigGPS });
            const tempOp = op.clone();
            tempOp.pos = vis.get("cards.general.gps.posReward");
            group.add(resText, tempOp);

            const tempIconOp = iconOp.clone();
            tempIconOp.pos = new Point(iconOffsetX, tempOp.pos.y);
            tempIconOp.frame = GPS_ICONS.reward.frame;
            group.add(resIcon, tempIconOp);
        }

        if(card.customData.penalty)
        {
            const resText = new ResourceText({ text: card.customData.penalty, textConfig: textConfigGPS });
            const tempOp = op.clone();
            tempOp.pos = vis.get("cards.general.gps.posPenalty");
            group.add(resText, tempOp);

            const tempIconOp = iconOp.clone();
            tempIconOp.pos = new Point(iconOffsetX, tempOp.pos.y);
            tempIconOp.frame = GPS_ICONS.penalty.frame;
            group.add(resIcon, tempIconOp);
        }
    }
}

const drawCardIcons = (vis, group, card) =>
{
    // the main illustration at the top
    const typeData = card.getData();
    const tempData = card.getTemplateData();
    let resSprite = vis.getResource("icons");
    if(typeData && typeData.shared) { resSprite = vis.getResource("icons_shared"); }

    const spriteFrame = tempData.frameIcon ?? typeData.frame;
    const eff = new DropShadowEffect({ color: "#000000", blurRadius: vis.get("cards.general.illustration.shadowBlur") });
    const spriteOp = new LayoutOperation({
        pos: vis.get("cards.general.illustration.mainPos"),
        size: vis.get("cards.general.illustration.mainDims"),
        effects: [eff],
        frame: spriteFrame,
        pivot: Point.CENTER
    });

    let resIllu = resSprite;
    if(card.getCustomIllustration) {
        const resTemp = card.getCustomIllustration(vis, card, spriteOp);
        if(resTemp) { resIllu = resTemp; spriteOp.frame = 0; }
    }

    group.add(resIllu, spriteOp);

    // GPS cards draw that dynamic grid on top of the usual main illu
    const isGPSCard = card.type == CardType.GPS;
    if(isGPSCard)
    {
        const gridRawDims = card.customData.gridDims;
        const gridPixelDims = vis.get("cards.general.gps.gridDims")
        const resIcons = vis.getResource("icons");
        const gridGroup = new ResourceGroup();
        const cellSize = gridPixelDims.clone().div(gridRawDims);

        const cellOp = new LayoutOperation({
            fill: vis.get("cards.general.gps.cellColors.neutral"),
            stroke: vis.get("cards.general.gps.strokeColor"),
            strokeWidth: vis.get("cards.general.gps.strokeWidth"),
            alpha: vis.get("cards.general.gps.alpha")
        })

        for(let x = 0; x < gridRawDims.x; x++)
        {
            for(let y = 0; y < gridRawDims.y; y++)
            {
                const id = x + y * gridRawDims.x;
                const pixelPos = new Point(x,y).scale(cellSize);
                const resShape = new ResourceShape( new Rectangle().fromTopLeft(pixelPos, cellSize) );
                const isReward = card.customData.rewardSquares.includes(id);
                const isPenalty = card.customData.penaltySquares.includes(id);
                const isCenterPos = (x == Math.floor(0.5*gridRawDims.x) && y == Math.floor(0.5*gridRawDims.y));
                if(!isReward && !isPenalty && !isCenterPos) { gridGroup.add(resShape, cellOp); continue; }

                // if highlighted, add rectangle of correct color
                const tempOp = cellOp.clone();
                tempOp.fill = vis.get("cards.general.gps.cellColors.reward")
                let spriteFrame = GPS_ICONS.reward.frame;
                if(isPenalty) { tempOp.fill = vis.get("cards.general.gps.cellColors.penalty"); spriteFrame = GPS_ICONS.penalty.frame; }
                if(isCenterPos) { tempOp.fill = vis.get("cards.general.gps.cellColors.arrow"); spriteFrame = GPS_ICONS.arrow.frame; }
                gridGroup.add(resShape, tempOp);

                // and then sprite to back it up
                const centerPos = pixelPos.add(new Point(0.5, 0.5).scale(cellSize));
                const iconOp = new LayoutOperation({
                    pos: centerPos,
                    frame: spriteFrame,
                    size: cellSize.clone().scale(0.8),
                    pivot: Point.CENTER
                })
                gridGroup.add(resIcons, iconOp);
            }
        }

        const gridOp = new LayoutOperation({
            pos: spriteOp.pos.clone(),
            size: gridPixelDims,
            pivot: Point.CENTER
        })
        group.add(gridGroup, gridOp);

    }

    // smaller illustrations, usually to the sides of title
    // (how many/at which position they're placed depends on the card type)
    const hasSmallIcons = tempData.smallIconOffset;
    if(hasSmallIcons)
    {
        const smallDims = vis.get("cards.general.illustration.smallDims");
        const anchorPos = vis.get("cards.general.textPos");
        const anchorOffset = tempData.smallIconOffset.clone().scale(vis.sizeUnit);
        const effSmall = new DropShadowEffect({ color: "#000000", blurRadius: vis.get("cards.general.illustration.smallShadowBlur") });
        
        const smallPositions = [
            anchorPos.clone().add(new Point(-anchorOffset.x, anchorOffset.y)),
            anchorPos.clone().add(new Point(anchorOffset.x, anchorOffset.y))
        ]
        
        for(const pos of smallPositions)
        {
            const onRightSide = pos.x > vis.center.x;
            const spriteOpSmall = new LayoutOperation({
                pos: pos,
                frame: spriteFrame,
                size: smallDims,
                pivot: Point.CENTER,
                flipX: onRightSide,
                effects: [effSmall]
            })

            if(card.type == CardType.ACTION) 
            { 
                spriteOpSmall.composite = "luminosity"; 
                spriteOpSmall.effects = []; 
                spriteOpSmall.alpha = 0.5;
            }
    
            group.add(resSprite, spriteOpSmall)
        }
    }
    
    // illustrations to show GAME TYPE
    // (how many/at which positions they're placed depends on the card type)
    const resIcon = vis.getResource("misc");
    const iconPositions = [];
    const iconDims = vis.get("cards.general.gameIcon.size");

    const defaultPos =  vis.get("cards.general.gameIcon.posDefault");
    const offset = iconDims.clone().scale(vis.get("cards.general.gameIcon.edgeOffsetFactor"));
    const cornerPositions = getRectangleCornersWithOffset(vis.size, offset);
    const gameIconEff = new DropShadowEffect({ color: "#FFFFFF", blurRadius: vis.get("cards.general.gameIcon.glowBlur") });
    
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
            pos: pos,
            frame: card.getMisc().game_icon.frame,
            size: iconDims,
            pivot: Point.CENTER,
            flipX: onRightSide,
            flipY: onBottomSide,
            effects: [gameIconEff]
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
    const group = vis.renderer.prepareDraw();

    drawCardBackground(vis, group, card);
    drawCardIcons(vis, group, card);
    drawCard(vis, group, card);

    return vis.renderer.finishDraw({ group: group, size: vis.size });
}