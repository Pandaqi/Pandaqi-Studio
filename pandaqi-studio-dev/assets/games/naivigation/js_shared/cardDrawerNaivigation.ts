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

    let textMeta = data.subText ?? tempData.subText;
    
    // @EXCEPTION: This is the only card that modifies subText that way, so just made it an exception
    if(isTimeCard)
    {
        const eventType = data.type ?? "none";
        textMeta = "TYPE " + eventType.toUpperCase();
    }

    const metaPos = textPos.clone().add(new Point(0, 0.5*textConfig.size + 0.5*vis.get("cards.general.fontSizeMeta") + shadowOffset.y));
    if(textMeta)
    {
        const textConfigMeta = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.general.fontSizeMeta")
        }).alignCenter();
        const resTextMeta = new ResourceText(textMeta, textConfigMeta);
        const textMetaOp = new LayoutOperation({
            pos: metaPos,
            size: new Point(vis.size.x, textConfigMeta.size*2),
            fill: "#000000",
            alpha: vis.get("cards.general.alphaMeta"),
            pivot: Point.CENTER
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
            textPos.clone().add(new Point(-baseOffset.x, baseOffset.y)),
            textPos.clone().add(new Point(baseOffset.x, baseOffset.y))
        ]
        const dropShadowEff = new DropShadowEffect({ color: "#00000077", offset: new Point(0, 0.1 * textConfigNumber.size) });

        for(const pos of positions)
        {
            const resTextNumber = new ResourceText(textNumber.toString(), textConfigNumber);
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

        const contentPos = metaPos.clone().add(new Point(0, 0.5*(vis.size.y - metaPos.y)));

        const resTextContent = new ResourceText(textContent, textConfigContent);
        const textContentOp = new LayoutOperation({
            pos: contentPos,
            size: vis.get("cards.general.contentTextBox"),
            fill: "#000000",
            pivot: Point.CENTER
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

    // @TODO: generalize the dictionary (instead of only using GPS_REWARDS/GPS_ICONS, use `getGPSData()` function or something)
    if(card.customData.reward)
    {
        const str = GPS_REWARDS[card.customData.reward].desc;
        const resText = new ResourceText(str, textConfigGPS);
        const op = new LayoutOperation({
            pos: vis.get("cards.general.gps.posReward"),
            fill: vis.get("cards.general.gps.fontColor"),
            size: vis.get("cards.general.gps.textBoxDims"),
            pivot: Point.CENTER
        });
        group.add(resText, op);

        const iconOp = new LayoutOperation({
            pos: new Point(iconOffsetX, op.pos.y),
            frame: GPS_ICONS.reward.frame,
            size: vis.get("cards.general.gps.textBoxIconDims"),
            pivot: Point.CENTER
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
            pivot: Point.CENTER
        });
        group.add(resText, op);

        const iconOp = new LayoutOperation({
            pos: new Point(iconOffsetX, op.pos.y),
            frame: GPS_ICONS.penalty.frame,
            size: vis.get("cards.general.gps.textBoxIconDims"),
            pivot: Point.CENTER
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
            const pixelPos = new Point(x,y).scale(cellSize);
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
            const centerPos = pixelPos.add(new Point(0.5, 0.5).scale(cellSize));
            const iconOp = new LayoutOperation({
                pos: centerPos,
                frame: spriteFrame,
                size: cellSize.clone().scale(iconScaledown),
                alpha: iconAlpha,
                pivot: Point.CENTER
            })
            gridGroup.add(resIcons, iconOp);
        }
    }

    const gridOp = new LayoutOperation({
        pos: vis.get("cards.general.illustration.mainPos"),
        size: gridPixelDims,
        pivot: Point.CENTER
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
    const sizeFactor = tempData.iconScale ?? Point.ONE;
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
        pivot: Point.CENTER
    });

    // override with a custom illustration, IF that function returned anything
    let resIllu = resSprite;
    const resTempCustom = card.getCustomIllustration(vis, spriteOp);
    if(resTempCustom) { resIllu = resTempCustom; spriteOp.frame = 0; spriteOp.size = new Point(); }
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
            pivot: Point.CENTER,
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

    // @TODO: perhaps reshuffle when stuff is drawn to actually get a "foreground" layer on these cards
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