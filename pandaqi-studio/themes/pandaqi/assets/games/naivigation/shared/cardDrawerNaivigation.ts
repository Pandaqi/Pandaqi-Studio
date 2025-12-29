

import { MaterialVisualizer, ResourceGroup, fillResourceGroup, rangeInteger, Vector2, Color, LayoutOperation, TintEffect, TextConfig, ResourceText, DropShadowEffect, StrokeAlign, ResourceShape, Rectangle, getRectangleCornersWithOffset, colorRotate, colorDarken, colorSaturate } from "lib/pq-games";
import { GPS_PENALTIES, GPS_REWARDS } from "./dict";
import { CardType, GPS_ICONS } from "./dictShared";
import MaterialNaivigation from "./materialNaivigation";

const drawBackground = (vis:MaterialVisualizer, group:ResourceGroup, card:MaterialNaivigation) =>
{
    const resCustom = card.getCustomBackground(vis, group);
    if(resCustom) { return; }
    drawCardBackground(vis, group, card);
    drawCardIcons(vis, group, card);
}

const drawCardBackground = (vis, group, card) =>
{
    // main background color
    const tempData = card.getTemplateData();
    const gameData = card.getGameData();
    let bgColor = gameData ? gameData.bgColor : tempData.bgColor;
    bgColor = vis.inkFriendly ? "#FFFFFF" : bgColor;
    fillResourceGroup(vis.size, group, bgColor);

    // the blobby shapes on the background
    if(!vis.inkFriendly)
    {
        const resBlobs = vis.getResource("bg_blobs");
        const blobFrame = rangeInteger(0, vis.get("cards.general.numBackgroundBlobs") - 1);
        const pos = new Vector2(0.5 * vis.sizeUnit);
        const size = vis.get("cards.background.size");
        const randRotationBlob = rangeInteger(0,3) * 0.5 * Math.PI;
        let blobsCol = new Color(bgColor);
        blobsCol = colorRotate(blobsCol, 6);
        blobsCol = colorSaturate(blobsCol, 10);
        blobsCol = colorDarken(blobsCol, 8);
    
        const blobsOp = new LayoutOperation({
            pos: pos,
            size: size,
            rot: randRotationBlob,
            flipX: Math.random() <= 0.5,
            frame: blobFrame,
            effects: [new TintEffect({ color: blobsCol })],
            //alpha: vis.get("cards.background.blobAlpha"),
            pivot: Vector2.CENTER
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
            pivot: Vector2.CENTER
        });
    
        group.add(resPattern, patternOp);
    }

    // the template behind text
    const resTemplate = vis.getResource("card_templates");
    let tempEffects = vis.inkFriendlyEffect;
    let tintColor = gameData ? gameData.tintColor : tempData.tintColor;
    if(!vis.inkFriendly)
    {
        if(card.type == CardType.VEHICLE || card.type == CardType.ACTION)
        {
            tempEffects = [new TintEffect(tintColor)];
        }
    }

    const templateOp = new LayoutOperation({
        pos: vis.size,
        size: new Vector2(vis.sizeUnit),
        frame: tempData.frameTemplate,
        effects: tempEffects,
        pivot: Vector2.ONE
    })

    group.add(resTemplate, templateOp);
}

const drawCard = (vis, group, card) =>
{
    const data = card.getData();
    const tempData = card.getTemplateData();
    const isGPSCard = (card.type == CardType.GPS);
    const isTimeCard = (card.type == CardType.TIME);

    const text = (data.label ?? tempData.label) ?? "No Label";
    let titleFontSize = vis.get("cards.general.fontSize");
    const titleIsLong = text.length > 14;
    if(titleIsLong) { titleFontSize *= 0.75; }

    // card title + subtitle ( = type indicator)
    const textConfig = new TextConfig({
        font: vis.get("fonts.heading"),
        size: titleFontSize
    }).alignCenter();

    const resText = new ResourceText(text, textConfig);
    let textPos = vis.get("cards.general.textPos");
    if(tempData.titleTextPos)
    {
        textPos = tempData.titleTextPos.clone().scale(vis.size);
    }

    const shadowOffset = new Vector2(0, 0.1*textConfig.size);
    const eff = new DropShadowEffect({ color: "#000000AA", offset: shadowOffset });
    const textOp = new LayoutOperation({
        pos: textPos,
        size: new Vector2(vis.size.x, textConfig.size*2), 
        fill: "#000000",
        stroke: "#FFFFFF",
        effects: [eff],
        strokeWidth: vis.get("cards.general.strokeWidth"),
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: Vector2.CENTER
    });

    let textMeta = data.subText ?? tempData.subText;
    
    // @EXCEPTION: This is the only card that modifies subText that way, so just made it an exception
    if(isTimeCard)
    {
        const eventType = data.type ?? "none";
        textMeta = "TYPE " + eventType.toUpperCase();
    }

    const metaPos = textPos.clone().add(new Vector2(0, 0.5*textConfig.size + 0.5*vis.get("cards.general.fontSizeMeta") + shadowOffset.y));
    if(textMeta)
    {
        const textConfigMeta = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.general.fontSizeMeta")
        }).alignCenter();
        const resTextMeta = new ResourceText(textMeta, textConfigMeta);
        const textMetaOp = new LayoutOperation({
            pos: metaPos,
            size: new Vector2(vis.size.x, textConfigMeta.size*2),
            fill: "#000000",
            alpha: vis.get("cards.general.alphaMeta"),
            pivot: Vector2.CENTER
        })

        group.add(resTextMeta, textMetaOp);
    }

    // @NOTE: we place the main title AFTER the metadata, as that is more important to be visible (and looks better)
    group.add(resText, textOp);

    // card number (if needed)
    const textNumber = data.num;
    if(textNumber && tempData.extraNumberOffset)
    {
        const textConfigNumber = textConfig.clone();
        textConfigNumber.size = vis.get("cards.general.extraNumber.fontSize");
        const baseOffset = tempData.extraNumberOffset.clone().scale(vis.sizeUnit);
        const positions = [
            textPos.clone().add(new Vector2(-baseOffset.x, baseOffset.y)),
            textPos.clone().add(new Vector2(baseOffset.x, baseOffset.y))
        ]
        const dropShadowEff = new DropShadowEffect({ color: "#00000077", offset: new Vector2(0, 0.1 * textConfigNumber.size) });

        for(const pos of positions)
        {
            const resTextNumber = new ResourceText(textNumber.toString(), textConfigNumber);
            const textNumberOp = new LayoutOperation({
                pos: pos,
                size: new Vector2(textConfigNumber.size*2),
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: vis.get("cards.general.extraNumber.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Vector2.CENTER,
                effects: [dropShadowEff]
            })

            group.add(resTextNumber, textNumberOp);
        }
    }

    // main card content (if available)
    // @EXCEPTION: for GPS card, which has 2 randomly generated phrases at bottom
    let textContent = card.customData.desc ?? data.desc ?? tempData.desc;
    if(isGPSCard) 
    { 
        drawGPSText(vis, group, card);
        textContent = undefined; 
    }

    if(textContent)
    {
        const textConfigContent = textConfig.clone();
        textConfigContent.size = vis.get("cards.general.fontSizeContent");
        textConfigContent.font = vis.get("fonts.body");

        const contentPos = metaPos.clone().add(new Vector2(0, 0.5*(vis.size.y - metaPos.y)));

        const resTextContent = new ResourceText(textContent, textConfigContent);
        const textContentOp = new LayoutOperation({
            pos: contentPos,
            size: vis.get("cards.general.contentTextBox"),
            fill: "#000000",
            pivot: Vector2.CENTER
        });
        group.add(resTextContent, textContentOp);
    }
}

const drawGPSText = (vis:MaterialVisualizer, group:ResourceGroup, card:MaterialNaivigation) =>
{
    const textConfigGPS = new TextConfig({
        size: vis.get("cards.general.gps.fontSize"),
        font: vis.get("fonts.body")
    }).alignCenter();

    const iconOffsetX = vis.get("cards.general.gps.iconOffset");
    const resIcon = vis.getResource("misc_shared");

    if(card.customData.reward)
    {
        const str = GPS_REWARDS[card.customData.reward].desc;
        const resText = new ResourceText(str, textConfigGPS);
        const op = new LayoutOperation({
            pos: vis.get("cards.general.gps.posReward"),
            fill: vis.get("cards.general.gps.fontColor"),
            size: vis.get("cards.general.gps.textBoxDims"),
            pivot: Vector2.CENTER
        });
        group.add(resText, op);

        const iconOp = new LayoutOperation({
            pos: new Vector2(iconOffsetX, op.pos.y),
            frame: GPS_ICONS.reward.frame,
            size: vis.get("cards.general.gps.textBoxIconDims"),
            pivot: Vector2.CENTER
        })

        group.add(resIcon, iconOp);
    }

    if(card.customData.penalty)
    {
        const str = GPS_PENALTIES[card.customData.penalty].desc;
        const resText = new ResourceText(str, textConfigGPS);
        const op = new LayoutOperation({
            pos: vis.get("cards.general.gps.posPenalty"),
            fill: vis.get("cards.general.gps.fontColor"),
            size: vis.get("cards.general.gps.textBoxDims"),
            pivot: Vector2.CENTER
        });
        group.add(resText, op);

        const iconOp = new LayoutOperation({
            pos: new Vector2(iconOffsetX, op.pos.y),
            frame: GPS_ICONS.penalty.frame,
            size: vis.get("cards.general.gps.textBoxIconDims"),
            pivot: Vector2.CENTER
        })
        group.add(resIcon, iconOp);
    }
}

const drawGPSGrid = (vis:MaterialVisualizer, group:ResourceGroup, card:MaterialNaivigation) =>
{
    const gridRawDims = card.customData.gridDims;
    const gridPixelDims = vis.get("cards.general.gps.gridDims")
    const resIcons = vis.getResource("misc_shared");
    const gridGroup = new ResourceGroup();
    const cellSize = gridPixelDims.clone().div(gridRawDims);

    const iconScaledown = vis.get("cards.general.gps.gridIconSizeFactor");
    const iconAlpha = vis.get("cards.general.gps.gridIconAlpha");

    for(let x = 0; x < gridRawDims.x; x++)
    {
        for(let y = 0; y < gridRawDims.y; y++)
        {
            const id = x + y * gridRawDims.x;
            const pixelPos = new Vector2(x,y).scale(cellSize);
            const resShape = new ResourceShape( new Rectangle().fromTopLeft(pixelPos, cellSize) );
            const isReward = card.customData.rewardSquares.includes(id);
            const isPenalty = card.customData.penaltySquares.includes(id);
            const isCenterPos = (x == Math.floor(0.5*gridRawDims.x) && y == Math.floor(0.5*gridRawDims.y));

            const cellOp = new LayoutOperation({
                fill: vis.get("cards.general.gps.cellColors.neutral"),
                stroke: vis.get("cards.general.gps.strokeColor"),
                strokeWidth: vis.get("cards.general.gps.strokeWidth"),
                alpha: vis.get("cards.general.gps.alpha")
            })

            if(!isReward && !isPenalty && !isCenterPos) { gridGroup.add(resShape, cellOp); continue; }

            // if highlighted, add rectangle of correct color
            let spriteFrame = GPS_ICONS.reward.frame;
            let fill = vis.get("cards.general.gps.cellColors.reward");
            if(isPenalty) { fill = vis.get("cards.general.gps.cellColors.penalty"); spriteFrame = GPS_ICONS.penalty.frame; }
            if(isCenterPos) { fill = vis.get("cards.general.gps.cellColors.arrow"); spriteFrame = GPS_ICONS.arrow.frame; }
            cellOp.setFill(fill);
            gridGroup.add(resShape, cellOp);

            // and then sprite to back it up
            const centerPos = pixelPos.add(new Vector2(0.5, 0.5).scale(cellSize));
            const iconOp = new LayoutOperation({
                pos: centerPos,
                frame: spriteFrame,
                size: cellSize.clone().scale(iconScaledown),
                alpha: iconAlpha,
                pivot: Vector2.CENTER
            })
            gridGroup.add(resIcons, iconOp);
        }
    }

    const gridOp = new LayoutOperation({
        pos: vis.get("cards.general.illustration.mainPos"),
        size: gridPixelDims,
        pivot: Vector2.CENTER
    })
    group.add(gridGroup, gridOp);
}

const drawCardIcons = (vis:MaterialVisualizer, group:ResourceGroup, card:MaterialNaivigation) =>
{
    // the main illustration at the top
    const typeData = card.getData() ?? {};
    const tempData = card.getTemplateData();
    let resSpriteKey = typeData.textureKey ?? tempData.textureKey ?? "icons";

    // this is an ugly exception to make shared material pick the right spritesheet; but it's fine as long as it remains a SINGLE exception
    const useSharedIcons = typeData.shared && (card.type == CardType.VEHICLE || card.type == CardType.ACTION);
    if(useSharedIcons) { resSpriteKey = "icons_shared"; }
    
    const resSprite = vis.getResource(resSpriteKey);
    const spriteFrame = tempData.frameIcon ?? typeData.frame;
    const flipX = card.customData.iconFlipX ?? false;
    const flipY = card.customData.iconFlipY ?? false;
    const eff = new DropShadowEffect({ color: "#000000", blurRadius: vis.get("cards.general.illustration.shadowBlur") });

    const mainIconSize = vis.get("cards.general.illustration.mainDims").clone();
    const sizeFactor = tempData.iconScale ?? Vector2.ONE;
    mainIconSize.scale(sizeFactor);

    const mainIconPos = vis.get("cards.general.illustration.mainPos").clone();
    if(tempData.iconOffset) { mainIconPos.add(tempData.iconOffset.clone().scale(vis.size)) }

    const spriteOp = new LayoutOperation({
        pos: mainIconPos,
        size: mainIconSize,
        effects: [eff],
        flipX: flipX,
        flipY: flipY,
        frame: spriteFrame,
        pivot: Vector2.CENTER
    });

    // override with a custom illustration, IF that function returned anything
    let resIllu = resSprite;
    const resTempCustom = card.getCustomIllustration(vis, spriteOp);
    if(resTempCustom) { resIllu = resTempCustom; spriteOp.frame = 0; spriteOp.size = Vector2.ZERO; }
    group.add(resIllu, spriteOp);

    // GPS cards draw that dynamic grid on top of the usual main illu
    const isGPSCard = card.type == CardType.GPS;
    if(isGPSCard)
    {
        drawGPSGrid(vis, group, card);
    }

    // smaller illustrations, usually to the sides of title
    // (how many/at which position they're placed depends on the card type)
    const hasSmallIcons = tempData.smallIconOffset;
    if(hasSmallIcons)
    {
        const smallDims = vis.get("cards.general.illustration.smallDims");
        const anchorPos = vis.get("cards.general.textPos");
        const anchorOffset = tempData.smallIconOffset.clone().scale(vis.sizeUnit);
        const effSmall = [new DropShadowEffect({ color: "#000000", blurRadius: vis.get("cards.general.illustration.smallShadowBlur") }), vis.inkFriendlyEffect].flat();
        
        const smallPositions = [
            anchorPos.clone().add(new Vector2(-anchorOffset.x, anchorOffset.y)),
            anchorPos.clone().add(new Vector2(anchorOffset.x, anchorOffset.y))
        ]
        
        for(const pos of smallPositions)
        {
            const onRightSide = pos.x > vis.center.x;
            const spriteOpSmall = new LayoutOperation({
                pos: pos,
                frame: spriteFrame,
                size: smallDims,
                pivot: Vector2.CENTER,
                flipX: onRightSide,
                effects: effSmall
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
    const gameIconEff = [new DropShadowEffect({ color: "#FFFFFF", blurRadius: vis.get("cards.general.gameIcon.glowBlur") }), vis.inkFriendlyEffect].flat();
    
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
            pivot: Vector2.CENTER,
            flipX: onRightSide,
            flipY: onBottomSide,
            effects: gameIconEff
        })
        group.add(resIcon, iconOp);
    }   
}

const drawForeground = (vis:MaterialVisualizer, group:ResourceGroup, card:MaterialNaivigation) =>
{
    const resCustom = card.getCustomBackground(vis, group);
    if(resCustom) { return; }

    // @MPROV: perhaps reshuffle when stuff is drawn to actually get a "foreground" layer on these cards
}

// This is the default card drawer for all types, used by shared material. 
// It's what most other games and variants need, but not all of them
// Which is why I decided each game has to manually call it, instead of making this 100% automatic for each game
// The Card object holds the functions/data to grab the correct dictionaries/resources it needs
export default (vis:MaterialVisualizer, group:ResourceGroup, card:MaterialNaivigation) =>
{
    drawBackground(vis, group, card);
    drawCard(vis, group, card);
    drawForeground(vis, group, card);
}