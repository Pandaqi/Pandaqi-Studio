import DISKS from "./diskData";
import BookCoverVisualizer from "lib/pq-games/tools/bookCovers/bookCoverVisualizer";
import { BookCoverComponent } from "lib/pq-games/tools/bookCovers/bookCoverGenerator";
import { Vector2, ResourceGroup, ResourceShape, Rectangle, LayoutOperation, TextConfig, ResourceText, TextWeight, StrokeAlign, TextStyle, TextAlign, DropShadowEffect, Color, createContext, ResourceImage } from "lib/pq-games";

const ADD_BACK_LOGO = false;

const convertToSmallCaps = (str:string, fontSize:number) =>
{
    const capSize = Math.ceil(fontSize * 1.215);
    const words = str.split(" ");
    const newWords = [];
    for(const word of words)
    {
        const firstLetterRaw = word.slice(0,1);
        const isCapitalized = firstLetterRaw.toLowerCase() != firstLetterRaw;
        let firstLetter = '<size num="' + capSize + '">' + firstLetterRaw.toUpperCase() + '</size>';
        if(!isCapitalized) { firstLetter = firstLetterRaw.toUpperCase(); }
        const remainder = word.slice(1).toUpperCase();
        newWords.push(firstLetter + remainder);
    }
    return newWords.join(" ");
}

const convertToBinary = (input:number) =>
{
    const fixedLength = 6;
    let bin = (input >>> 0).toString(2);
    while(bin.length < fixedLength)
    {
        bin = "0" + bin;
    }
    return bin;
}

const getDiskData = (vis:BookCoverVisualizer) =>
{
    return DISKS[vis.bookData.custom.disk ?? "handheld"];
}

const drawBackgroundRect = (vis:BookCoverVisualizer, size:Vector2, group:ResourceGroup) =>
{
    const rect = new ResourceShape( new Rectangle().fromTopLeft(new Vector2(), size) );
    const rectOp = new LayoutOperation({
        fill: getDiskData(vis).bg.color
    });
    group.add(rect, rectOp);
}

const drawElectricityLines = (vis:BookCoverVisualizer, size: Vector2, center: Vector2, group:ResourceGroup) =>
{
    const diskData = getDiskData(vis);
    const res = vis.getResource("electric_lines");
    const op = new LayoutOperation({
        pos: center,
        size: size,
        alpha: diskData.electricityLines.alpha,
        composite: diskData.electricityLines.composite,
        pivot: Vector2.CENTER
    })
    group.add(res, op)
}

const drawWildebyteBadge = (vis:BookCoverVisualizer, size: Vector2, center: Vector2, group: ResourceGroup) =>
{
    const diskData = getDiskData(vis);
    const pos = new Vector2(center.x, vis.getPageAnchorContent(BookCoverComponent.FRONT).y + diskData.badge.yPos * size.y);

    // badge itself
    const res = vis.getResource("wildebyte_badge");
    const badgeSize = res.getSize();
    const op = new LayoutOperation({
        pos: pos,
        size: badgeSize,
        pivot: Vector2.CENTER
    })
    group.add(res, op);

    // installment text tiny (decimal number between the horns)
    const textConfigSmall = new TextConfig({
        font: diskData.fonts.body,
        size: diskData.badge.smallFontSize
    }).alignCenter();

    const textSmall = "Book #" + vis.bookData.index;
    const resTextSmall = new ResourceText(textSmall, textConfigSmall);
    const opTextSmall = new LayoutOperation({
        pos: new Vector2(pos.x, pos.y + diskData.badge.smallTextOffsetY*res.getSize().y),
        size: new Vector2(badgeSize.x, 1.5*textConfigSmall.size),
        pivot: Vector2.CENTER,
        fill: diskData.badge.smallTextColor,
        composite: diskData.badge.composite
    })
    group.add(resTextSmall, opTextSmall);

    // installment text big (binary number, bold, below)
    const textConfigBig = new TextConfig({
        font: diskData.fonts.body,
        size: diskData.badge.bigFontSize,
        weight: TextWeight.BOLD
    }).alignCenter();

    const textBig = convertToBinary(vis.bookData.index - 1);
    const resTextBig = new ResourceText(textBig, textConfigBig);
    const opTextBig = new LayoutOperation({
        pos: new Vector2(pos.x, pos.y + diskData.badge.bigTextOffsetY*res.getSize().y),
        size: new Vector2(badgeSize.x, 1.5*textConfigBig.size),
        pivot: Vector2.CENTER,
        fill: diskData.badge.bigTextColor,
        composite: diskData.badge.composite
    })
    group.add(resTextBig, opTextBig);

    // optional toggle to show "choice story" graphics here (at bottom point of badge)!
    if(vis.bookData.choiceStory)
    {
        const resChoice = vis.getResource("choice_story");
        const opChoice = new LayoutOperation({
            pos: new Vector2(pos.x, pos.y + diskData.badge.choiceStoryOffsetY*res.getSize().y),
            size: resChoice.getSize(),
            pivot: Vector2.CENTER
        })
        group.add(resChoice, opChoice)
    }
}

const drawTopGradient = (vis:BookCoverVisualizer, size: Vector2, group: ResourceGroup) =>
{
    const res = vis.getResource("overlay_gradient");
    const op = new LayoutOperation({
        pos: new Vector2(),
        size: size,
        alpha: getDiskData(vis).overlayGradient.alpha
    })
    group.add(res, op);
}

const drawBackSection = (vis:BookCoverVisualizer, sectionData, size: Vector2, pos:Vector2, index:number, group:ResourceGroup) =>
{
    const diskData = getDiskData(vis);

    // the sprite supporting the heading
    const resHeading = vis.getResource("back_heading");
    const headingSize = resHeading.getSize();
    const opHeading = new LayoutOperation({
        pos: pos,
        size: headingSize,
        pivot: Vector2.CENTER,
        flipX: (index % 2 == 0) && diskData.back.alternateFlipHeadings
    });
    group.add(resHeading, opHeading);

    // the actual heading text
    const textConfigHeading = new TextConfig({
        font: diskData.fonts.heading,
        size: diskData.back.headingFontSize,
    }).alignCenter();

    const resHeadingText = new ResourceText(sectionData.title, textConfigHeading);
    const opHeadingText = new LayoutOperation({
        pos: pos,
        size: headingSize,
        pivot: Vector2.CENTER,
        fill: diskData.back.textColor,
        stroke: diskData.back.textStrokeColor,
        strokeWidth: diskData.back.textStrokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE
    });
    group.add(resHeadingText, opHeadingText);

    // the text below
    const textConfig = new TextConfig({
        font: diskData.fonts.body,
        size: diskData.back.contentFontSize,
        style: TextStyle.NORMAL,
    });

    // @TODO: not sure if I want to keep this system of "the unique game blurb is normal, everything else is italic"
    // If I do, it probably needs to be coded cleaner/saved somewhere better than here
    if(sectionData.title != "NEW GAME")
    {
        textConfig.style = TextStyle.ITALIC;
    }

    const textBoxDims = diskData.back.textBoxDims.clone().scale(size);
    const resText = new ResourceText(sectionData.text, textConfig);
    const opText = new LayoutOperation({
        pos: new Vector2(pos.x, pos.y + 0.6*resHeading.getSize().y),
        size: textBoxDims,
        fill: diskData.back.textColor,
        pivot: new Vector2(0.5, 0)
    })
    group.add(resText, opText);
}

const drawTitleText = (vis:BookCoverVisualizer, size: Vector2, layer: string, group: ResourceGroup, titleTexts: string[], titlePositions: Vector2[]) =>
{
    const diskData = getDiskData(vis);

    const titleFontSize = diskData.titleText.fontSize;
    const lineHeight = diskData.titleText.lineHeight;
    const textBoxDims = new Vector2(0.9 * size.x, lineHeight*titleFontSize);
    const textConfigTitle = new TextConfig({
        font: diskData.fonts.heading,
        size: titleFontSize,
        alignHorizontal: TextAlign.MIDDLE,
        alignVertical: TextAlign.START
    })

    const glowEffect = [new DropShadowEffect({ color: "#FFFFFF", blurRadius: diskData.titleText.glowRadius })];
    const fillColor = (layer == "overlay") ? diskData.titleText.textColorOverlay : diskData.titleText.textColor;

    const addGradient = (layer == "front");
    const gradientColors = diskData.titleText.gradientColors;

    for(let i = 0; i < titleTexts.length; i++)
    {
        const resTitleText = new ResourceText(titleTexts[i], textConfigTitle);
        const pos = titlePositions[i].clone().add(new Vector2(0, diskData.titleText.offsetY[layer]));
        const composite = (layer == "overlay") ? "overlay" : "source-over";
        const effects = addGradient ? glowEffect : [];
        const strokeColor = addGradient ? diskData.titleText.strokeColor : Color.TRANSPARENT;
        const strokeWidth = addGradient ? diskData.titleText.strokeWidth : 0;
        const opTitleText = new LayoutOperation({
            pos: pos,
            size: textBoxDims,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: new Vector2(0.5, 0),
            composite: composite,
            effects: effects
        });
        group.add(resTitleText, opTitleText);

        if(addGradient)
        {
            const ctx = createContext({ size: textBoxDims });
            const opTextCopy = new LayoutOperation({
                pos: textBoxDims.clone().scale(0.5),
                size: textBoxDims,
                fill: "#000000",
                pivot: Vector2.CENTER
            });

            resTitleText.toCanvas(ctx, opTextCopy);

            const gradient = ctx.createLinearGradient(0, 0, 0, textBoxDims.y);
            gradient.addColorStop(0, gradientColors[0]);
            gradient.addColorStop(1, gradientColors[1]);
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, textBoxDims.x, textBoxDims.y);

            const res = new ResourceImage(ctx.canvas);
            const op = new LayoutOperation({
                pos: pos,
                size: textBoxDims,
                pivot: new Vector2(0.5, 0),
            });
            group.add(res, op);
        }

    }
}

const createBack = (vis:BookCoverVisualizer) =>
{
    const group = new ResourceGroup();
    const diskData = getDiskData(vis);

    const pageSize = vis.getPageSizePixels();
    const pageSizeContent = vis.getPageSizeContentPixels();
    const pageCenterContent = vis.getPageCenterContent(BookCoverComponent.BACK);
    const pageAnchorContent = vis.getPageAnchorContent(BookCoverComponent.BACK); // the "real" top-left

    drawBackgroundRect(vis, pageSize, group);
    drawElectricityLines(vis, pageSizeContent, pageCenterContent, group);

    if(ADD_BACK_LOGO)
    {
        drawWildebyteBadge(vis, pageSizeContent, pageCenterContent, group);
    }

    const restartText = diskData.texts.restart.replace("%num%", "#" + vis.bookData.index);
    const sections = structuredClone(diskData.back.sections);
    sections[0].text = vis.bookData.blurb;
    sections[1].text = diskData.texts.author;
    sections[2].text = restartText;

    console.log(sections);

    for(let i = 0; i < sections.length; i++)
    {
        const sectionData = sections[i];
        const pos = new Vector2(pageCenterContent.x, pageAnchorContent.y + (diskData.back.sectionStartY + i*diskData.back.sectionJumpY) * pageSizeContent.y);
        drawBackSection(vis, sectionData, pageSizeContent, pos, i, group);
    }

    drawTopGradient(vis, pageSize, group);

    const ctx = createContext({ size: pageSize });
    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

const createSpine = (vis:BookCoverVisualizer) =>
{
    const group = new ResourceGroup();
    const diskData = getDiskData(vis);
    const spineRot = 0.5*Math.PI;

    const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: diskData.spine.glowRadius });

    const spineSize = vis.getSpineSizePixels();
    const spineSizeContent = vis.getSpineSizeContentPixels();
    const spineCenter = vis.getSpineCenterContent();
    const spineAnchorContent = vis.getSpineAnchorContent(); // the "real" top-left for content

    // the general textured background
    // @NOTE: it retains its size (larger than any spine will ever be) to prevent any ugly stretching
    const resBg = vis.getResource("spine_background");
    const realBGSize = resBg.getSize();
    const opBg = new LayoutOperation({
        pos: spineCenter,
        size: new Vector2(realBGSize.x, spineSize.y),
        pivot: Vector2.CENTER
    });
    group.add(resBg, opBg);

    // the unique icon for the book
    const resIcon = vis.getResource("spine_icon");
    const posIcon = new Vector2(spineCenter.x, spineAnchorContent.y + diskData.spine.iconEdgeOffset * spineSizeContent.y);
    const iconSize = diskData.spine.iconSize; // just use consistent icon size for all books; scaling per book will be wonky
    const opIcon = new LayoutOperation({
        pos: posIcon,
        size: iconSize,
        rot: spineRot,
        pivot: Vector2.CENTER,
        effects: [glowEffect]
    })
    group.add(resIcon, opIcon);

    // the book title
    const textConfigTitle = new TextConfig({
        font: diskData.fonts.heading,
        size: diskData.spine.titleFontSize,
        alignHorizontal: TextAlign.START,
        alignVertical: TextAlign.MIDDLE
    })
    const bookTitle = convertToSmallCaps(vis.bookData.name, textConfigTitle.size);
    const resTextTitle = new ResourceText(bookTitle, textConfigTitle);
    const marginIconToText = 1.0*iconSize.x;
    const opTextTitleStroke = new LayoutOperation({
        pos: new Vector2(posIcon.x, posIcon.y + marginIconToText),
        size: new Vector2(0.5*spineSizeContent.y, 1.5*textConfigTitle.size),
        fill: diskData.spine.textColor,
        stroke: diskData.spine.strokeColor,
        strokeWidth: diskData.spine.strokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: new Vector2(0, 0.5),
        rot: spineRot,
        effects: [glowEffect]
    });
    const opTextTitle = opTextTitleStroke.clone();
    opTextTitle.strokeWidth = 0;
    opTextTitle.effects = [];
    group.add(resTextTitle, opTextTitleStroke); // @NOTE: this is split to ONLY apply the glow to the STROKE, not the fill, which keeps it more readable (and the glow less overwhelming)
    group.add(resTextTitle, opTextTitle);

    // the author's name
    const textConfigAuthor = new TextConfig({
        font: diskData.fonts.heading,
        size: diskData.spine.authorFontSize,
        alignHorizontal: TextAlign.END,
        alignVertical: TextAlign.MIDDLE,
    })

    const authorText = convertToSmallCaps("Tiamo Pastoor", textConfigAuthor.size);
    const posWBIcon = new Vector2(spineCenter.x, spineAnchorContent.y + spineSizeContent.y - diskData.spine.iconEdgeOffset * spineSizeContent.y);
    const resTextAuthor = new ResourceText(authorText, textConfigAuthor);
    const opTextAuthorStroke = new LayoutOperation({
        pos: new Vector2(posWBIcon.x, posWBIcon.y - marginIconToText),
        size: new Vector2(0.5*spineSizeContent.y, 1.5*textConfigAuthor.size),
        fill: diskData.spine.textColor,
        stroke: diskData.spine.strokeColor,
        strokeWidth: diskData.spine.strokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: new Vector2(1, 0.5),
        rot: spineRot,
        alpha: diskData.spine.authorAlpha,
        effects: [glowEffect]
    });
    const opTextAuthor = opTextAuthorStroke.clone();
    opTextAuthor.strokeWidth = 0;
    opTextAuthor.effects = [];
    group.add(resTextAuthor, opTextAuthorStroke);
    group.add(resTextAuthor, opTextAuthor);

    // finally, place simple wildebyte icon at the end
    const resWBIcon = vis.getResource("wildebyte_logo_simplified");
    const opWBIcon = new LayoutOperation({
        pos: posWBIcon,
        size: iconSize,
        rot: spineRot,
        pivot: Vector2.CENTER,
        effects: [glowEffect]
    })
    group.add(resWBIcon, opWBIcon);

    const ctx = createContext({ size: spineSize });
    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

const createFront = (vis:BookCoverVisualizer) =>
{
    const group = new ResourceGroup();
    const diskData = getDiskData(vis);

    const pageSize = vis.getPageSizePixels();
    const pageSizeContent = vis.getPageSizeContentPixels();
    const pageCenterContent = vis.getPageCenterContent(BookCoverComponent.FRONT);
    const pageAnchorContent = vis.getPageAnchorContent(BookCoverComponent.FRONT); // the "real" top-left

    drawBackgroundRect(vis, pageSize, group);

    // the unique full_painting for this book (as background)
    const bgPainting = vis.getResource("full_painting") as ResourceImage;
    const bgPaintingOp = new LayoutOperation({
        pos: vis.getPageCenter(),
        size: pageSize,
        alpha: diskData.bg.paintingAlpha,
        pivot: Vector2.CENTER
    });
    group.add(bgPainting, bgPaintingOp)

    drawElectricityLines(vis, pageSizeContent, pageCenterContent, group);

    // the unique full_painting again, but now at forefront, locked inside framing graphic
    const resFraming = vis.getResource("framing_graphic");
    const framingOffset = vis.bookData.custom.framePaintingOffset ?? 0;
    const framingPos = new Vector2(pageCenterContent.x, pageAnchorContent.y + diskData.framing.yPos * pageSizeContent.y);
    const framingPosPainting = framingPos.clone().add(new Vector2(0, framingOffset*pageSizeContent.y));
    const idealPaintingDims = resFraming.getSize().clone().scale(diskData.framing.fullPaintingScaleFactor);
    const paintingDims = new Vector2(idealPaintingDims.y * bgPainting.getRatio(), idealPaintingDims.y);
    const framingImageSize = resFraming.getSize().clone().scale(diskData.framing.frameScaleFactor ?? 1.0);
    const paintingOp = new LayoutOperation({
        pos: framingPosPainting,
        size: paintingDims,
        pivot: Vector2.CENTER,
        clip: new Rectangle().fromTopLeft(framingPos.clone().sub(framingImageSize.clone().scale(0.5)), framingImageSize),
    })
    group.add(bgPainting, paintingOp);

    const framingOp = new LayoutOperation({
        pos: framingPos,
        size: framingImageSize,
        pivot: Vector2.CENTER
    });
    group.add(resFraming, framingOp);

    // the metadata graphic (which is entirely fixed per disk, so just one simple image)
    const resMetadata = vis.getResource("metadata");
    const opMetadata = new LayoutOperation({
        pos: new Vector2(pageCenterContent.x, pageAnchorContent.y + diskData.metadata.yPos * pageSizeContent.y),
        size: resMetadata.getSize(),
        pivot: Vector2.CENTER
    });
    group.add(resMetadata, opMetadata);

    const posTitle = new Vector2(pageCenterContent.x, pageAnchorContent.y + diskData.titleText.posY * pageSizeContent.y);
    const titleFontSize = diskData.titleText.fontSize;
    const lineHeight = diskData.titleText.lineHeight;
    const lineHeightLowerCase = diskData.titleText.lineHeightLowerCase;

    const titleTexts = vis.bookData.name.split(" ");
    const titlePositions = [];
    for(let i = 0; i < titleTexts.length; i++)
    {
        titleTexts[i] = convertToSmallCaps(titleTexts[i], titleFontSize);
        titlePositions[i] = posTitle.clone();

        const isCapitalized = titleTexts[i].includes("</size>");
        const lh = isCapitalized ? lineHeight : lineHeightLowerCase;
        posTitle.add(new Vector2(0, lh*titleFontSize))
    }

    const titleTextLayers = ["overlay", "shadow", "front"];
    for(const layer of titleTextLayers)
    {
        drawTitleText(vis, pageSizeContent, layer, group, titleTexts, titlePositions);
    }

    drawWildebyteBadge(vis, pageSizeContent, pageCenterContent, group);
    drawTopGradient(vis, pageSize, group);

    const ctx = createContext({ size: pageSize });
    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

const CALLBACKS =
{
    back: createBack,
    spine: createSpine,
    front: createFront
}
export default CALLBACKS