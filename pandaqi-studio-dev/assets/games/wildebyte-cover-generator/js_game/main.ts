import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import Point from "js/pq_games/tools/geometry/point";
import BOOK_DATA from "./bookData";
import loadAssets from "./loadAssets";
import { PAGE_SIZE, TARGETS } from "./targetData";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DISKS from "./diskData";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import TextConfig, { TextAlign, TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
// @ts-ignore
import { jsPDF } from "js/pq_games/pdf/jspdf";
import Color from "js/pq_games/layout/color/color";

// @NOTE: the bookData.ts file is saved PER BOOK in their folder, so I can just copy-paste it into here to get all the book info

const CREATE_PDF = false;

let resLoader:ResourceLoader;

const insertLineBreaks = (str:string) =>
{
    // @ts-ignore
    return str.replaceAll(" ", "\n");
}

const convertToSmallCaps = (str:string, fontSize:number) =>
{
    str = str.toUpperCase();

    const capSize = Math.ceil(fontSize * 1.215);
    const words = str.split(" ");
    const newWords = [];
    for(const word of words)
    {
        const firstLetter = '<size num="' + capSize + '">' + word.slice(0, 1) + '</size>';
        const remainder = word.slice(1);
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

const convertInchesToPixels = (input:Point) =>
{
    return input.clone().scale(300).ceil();
}

const getSpineSizePixels = (target:string) =>
{
    return convertInchesToPixels(getSpineSize(target));
}

const getSpineSize = (target:string) =>
{
    let spineX = TARGETS[target].pageThickness * BOOK_DATA.numPages;
    if(BOOK_DATA.forcedSpineSize != null) { spineX = BOOK_DATA.forcedSpineSize; } // this must be inches too
    return new Point(spineX, getPageSize(target).y);
}

const getPageSizePixels = (target:string) =>
{
    return convertInchesToPixels(getPageSize(target));
}

const getPageSize = (target:string) =>
{
    const targetData = TARGETS[target];
    return new Point(
        1 * targetData.bleed + PAGE_SIZE.x,
        2 * targetData.bleed + PAGE_SIZE.y
    )
}

const getCoverSize = (target:string) =>
{
    const sizeInches = new Point(
        2 * getPageSize(target).x + getSpineSize(target).x,
        getPageSize(target).y
    )
    return convertInchesToPixels(sizeInches);
}

const drawBackgroundRect = (size:Point, group:ResourceGroup) =>
{
    const rect = new ResourceShape( new Rectangle().fromTopLeft(new Point(), size) );
    const rectOp = new LayoutOperation({
        fill: DISKS[BOOK_DATA.disk].bg.color
    });
    group.add(rect, rectOp);
}

const drawElectricityLines = (size: Point, center: Point, group:ResourceGroup) =>
{
    const diskData = DISKS[BOOK_DATA.disk];
    const res = resLoader.getResource("electric_lines");
    const op = new LayoutOperation({
        translate: center,
        dims: size,
        alpha: diskData.electricityLines.alpha,
        composite: diskData.electricityLines.composite,
        pivot: Point.CENTER
    })
    group.add(res, op)
}

const drawWildebyteBadge = (size: Point, center: Point, group: ResourceGroup) =>
{
    const diskData = DISKS[BOOK_DATA.disk];
    const pos = new Point(center.x, diskData.badge.yPos * size.y);

    // badge itself
    const res = resLoader.getResource("wildebyte_badge");
    const badgeSize = res.getSize();
    const op = new LayoutOperation({
        translate: pos,
        dims: badgeSize,
        pivot: Point.CENTER
    })
    group.add(res, op);

    // installment text tiny (decimal number between the horns)
    const textConfigSmall = new TextConfig({
        font: diskData.fonts.body,
        size: diskData.badge.smallFontSize
    }).alignCenter();

    const textSmall = "Book #" + BOOK_DATA.index;
    const resTextSmall = new ResourceText({ text: textSmall, textConfig: textConfigSmall });
    const opTextSmall = new LayoutOperation({
        translate: new Point(pos.x, pos.y + diskData.badge.smallTextOffsetY*res.getSize().y),
        dims: new Point(badgeSize.x, 1.5*textConfigSmall.size),
        pivot: Point.CENTER,
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

    const textBig = convertToBinary(BOOK_DATA.index - 1);
    const resTextBig = new ResourceText({ text: textBig, textConfig: textConfigBig });
    const opTextBig = new LayoutOperation({
        translate: new Point(pos.x, pos.y + diskData.badge.bigTextOffsetY*res.getSize().y),
        dims: new Point(badgeSize.x, 1.5*textConfigBig.size),
        pivot: Point.CENTER,
        fill: diskData.badge.bigTextColor,
        composite: diskData.badge.composite
    })
    group.add(resTextBig, opTextBig);

    // optional toggle to show "choice story" graphics here (at bottom point of badge)!
    if(BOOK_DATA.choiceStory)
    {
        const resChoice = resLoader.getResource("choice_story");
        const opChoice = new LayoutOperation({
            translate: new Point(pos.x, pos.y + diskData.badge.choiceStoryOffsetY*res.getSize().y),
            dims: resChoice.getSize(),
            pivot: Point.CENTER
        })
        group.add(resChoice, opChoice)
    }
}

const drawTopGradient = (size: Point, group: ResourceGroup) =>
{
    const res = resLoader.getResource("overlay_gradient");
    const op = new LayoutOperation({
        translate: new Point(),
        dims: size,
        alpha: DISKS[BOOK_DATA.disk].overlayGradient.alpha
    })
    group.add(res, op);
}

const drawBackSection = (sectionData, size: Point, pos:Point, index:number, group:ResourceGroup) =>
{
    const diskData = DISKS[BOOK_DATA.disk];

    console.log(pos);
    console.log(sectionData,index);

    // the sprite supporting the heading
    const resHeading = resLoader.getResource("back_heading");
    const headingSize = resHeading.getSize();
    const opHeading = new LayoutOperation({
        translate: pos,
        dims: headingSize,
        pivot: Point.CENTER,
        flipX: (index % 2 == 0) && diskData.back.alternateFlipHeadings
    });
    group.add(resHeading, opHeading);

    // the actual heading text
    const textConfigHeading = new TextConfig({
        font: diskData.fonts.heading,
        size: diskData.back.headingFontSize,
    }).alignCenter();

    const resHeadingText = new ResourceText({ text: sectionData.title, textConfig: textConfigHeading });
    const opHeadingText = new LayoutOperation({
        translate: pos,
        dims: headingSize,
        pivot: Point.CENTER,
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
    });

    // @TODO: not sure if I want to keep this system of "the unique game blurb is normal, everything else is italic"
    // If I do, it probably needs to be coded cleaner/saved somewhere better than here
    if(index != 0)
    {
        textConfig.style = TextStyle.ITALIC;
    }

    const textBoxDims = diskData.back.textBoxDims.clone().scale(size);
    const resText = new ResourceText({ text: sectionData.text, textConfig: textConfig });
    const opText = new LayoutOperation({
        translate: new Point(pos.x, pos.y + 0.6*resHeading.getSize().y),
        dims: textBoxDims,
        fill: diskData.back.textColor,
        pivot: new Point(0.5, 0)
    })
    group.add(resText, opText);
}

const drawTitleText = (size: Point, layer: string, group: ResourceGroup, titleTexts: string[], titlePositions: Point[]) =>
{
    const diskData = DISKS[BOOK_DATA.disk];

    const titleFontSize = diskData.titleText.fontSize;
    const lineHeight = diskData.titleText.lineHeight;
    const textBoxDims = new Point(0.9 * size.x, lineHeight*titleFontSize);
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
        const resTitleText = new ResourceText({ text: titleTexts[i], textConfig: textConfigTitle });
        const pos = titlePositions[i].clone().add(new Point(0, diskData.titleText.offsetY[layer]));
        const composite = (layer == "overlay") ? "overlay" : "source-over";
        const effects = addGradient ? glowEffect : [];
        const strokeColor = addGradient ? diskData.titleText.strokeColor : Color.TRANSPARENT;
        const strokeWidth = addGradient ? diskData.titleText.strokeWidth : 0;
        const opTitleText = new LayoutOperation({
            translate: pos,
            dims: textBoxDims,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: new Point(0.5, 0),
            composite: composite,
            effects: effects
        });
        group.add(resTitleText, opTitleText);

        if(addGradient)
        {
            const ctx = createContext({ size: textBoxDims });
            const opTextCopy = new LayoutOperation({
                translate: textBoxDims.clone().scale(0.5),
                dims: textBoxDims,
                fill: "#000000",
                pivot: Point.CENTER
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
                translate: pos,
                dims: textBoxDims,
                pivot: new Point(0.5, 0),
            });
            group.add(res, op);
        }

    }
}

const createBack = (size:Point, center:Point) =>
{
    const group = new ResourceGroup();
    const diskData = DISKS[BOOK_DATA.disk];

    drawBackgroundRect(size, group);
    drawElectricityLines(size, center, group);
    drawWildebyteBadge(size, center, group);

    const restartText = diskData.texts.restart.replace("%num%", "#" + BOOK_DATA.index);
    const sections = structuredClone(diskData.back.sections);
    sections[0].text = BOOK_DATA.blurb;
    sections[1].text = diskData.texts.author;
    sections[2].text = restartText;

    console.log(sections);

    for(let i = 0; i < sections.length; i++)
    {
        const sectionData = sections[i];
        const pos = new Point(center.x, (diskData.back.sectionStartY + i*diskData.back.sectionJumpY) * size.y);
        drawBackSection(sectionData, size, pos, i, group);
    }

    drawTopGradient(size, group);

    const ctx = createContext({ size: size });
    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

const createSpine = (size:Point, center: Point) =>
{
    const group = new ResourceGroup();
    const diskData = DISKS[BOOK_DATA.disk];
    const spineRot = 0.5*Math.PI;

    const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: diskData.spine.glowRadius });

    // the general textured background
    // @NOTE: it retains its size (larger than any spine will ever be) to prevent any ugly stretching
    const resBg = resLoader.getResource("spine_background");
    const opBg = new LayoutOperation({
        translate: center,
        dims: resBg.getSize(),
        pivot: Point.CENTER
    });
    group.add(resBg, opBg);

    // the unique icon for the book
    const resIcon = resLoader.getResource("spine_icon");
    const posIcon = new Point(center.x, diskData.spine.iconEdgeOffset * size.y);
    const iconSize = diskData.spine.iconSize; // just use consistent icon size for all books; scaling per book will be wonky
    const opIcon = new LayoutOperation({
        translate: posIcon,
        dims: iconSize,
        rotation: spineRot,
        pivot: Point.CENTER,
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
    const bookTitle = convertToSmallCaps(BOOK_DATA.name, textConfigTitle.size);
    const resTextTitle = new ResourceText({ text: bookTitle, textConfig: textConfigTitle });
    const marginIconToText = 1.0*iconSize.x;
    const opTextTitle = new LayoutOperation({
        translate: new Point(posIcon.x, posIcon.y + marginIconToText),
        dims: new Point(0.5*size.y, 1.5*textConfigTitle.size),
        fill: diskData.spine.textColor,
        stroke: diskData.spine.strokeColor,
        strokeWidth: diskData.spine.strokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: new Point(0, 0.5),
        rotation: spineRot,
        effects: [glowEffect]
    });
    group.add(resTextTitle, opTextTitle);

    // the author's name
    const textConfigAuthor = textConfigTitle.clone();
    textConfigAuthor.alignHorizontal = TextAlign.END;
    textConfigAuthor.size = diskData.spine.authorFontSize;

    const authorText = convertToSmallCaps("Tiamo Pastoor", textConfigAuthor.size);
    const resTextAuthor = new ResourceText({ text: authorText, textConfig: textConfigAuthor });
    const opTextAuthor = new LayoutOperation({
        translate: new Point(posIcon.x, size.y - posIcon.y - marginIconToText),
        dims: new Point(0.5*size.y, 1.5*textConfigAuthor.size),
        fill: diskData.spine.textColor,
        stroke: diskData.spine.strokeColor,
        strokeWidth: diskData.spine.strokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: new Point(1, 0.5),
        rotation: spineRot,
        alpha: diskData.spine.authorAlpha,
        effects: [glowEffect]
    });
    group.add(resTextAuthor, opTextAuthor);

    // finally, place simple wildebyte icon at the end
    const resWBIcon = resLoader.getResource("wildebyte_logo_simplified");
    const posWBIcon = new Point(center.x, size.y - diskData.spine.iconEdgeOffset * size.y);
    const opWBIcon = new LayoutOperation({
        translate: posWBIcon,
        dims: iconSize,
        rotation: spineRot,
        pivot: Point.CENTER,
        effects: [glowEffect]
    })
    group.add(resWBIcon, opWBIcon);

    const ctx = createContext({ size: size });
    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

const createFront = (size:Point, center: Point) =>
{
    const group = new ResourceGroup();
    const diskData = DISKS[BOOK_DATA.disk];

    drawBackgroundRect(size, group);

    // the unique full_painting for this book (as background)
    const bgPainting = resLoader.getResource("full_painting") as ResourceImage;
    const bgPaintingOp = new LayoutOperation({
        translate: center,
        dims: bgPainting.getSize(),
        alpha: diskData.bg.paintingAlpha,
        pivot: Point.CENTER
    });
    group.add(bgPainting, bgPaintingOp)

    drawElectricityLines(size, center, group);

    // the unique full_painting again, but now at forefront, locked inside framing graphic
    const resFraming = resLoader.getResource("framing_graphic");
    const framingPos = new Point(center.x, diskData.framing.yPos * size.y);
    const idealPaintingDims = resFraming.getSize().clone().scale(diskData.framing.fullPaintingScaleFactor);
    const paintingDims = new Point(idealPaintingDims.y * bgPainting.getRatio(), idealPaintingDims.y);
    const paintingOp = new LayoutOperation({
        translate: framingPos,
        dims: paintingDims,
        pivot: Point.CENTER
    })
    group.add(bgPainting, paintingOp);

    const framingOp = new LayoutOperation({
        translate: framingPos,
        dims: resFraming.getSize(),
        pivot: Point.CENTER
    });
    group.add(resFraming, framingOp);

    // the metadata graphic (which is entirely fixed per disk, so just one simple image)
    const resMetadata = resLoader.getResource("metadata");
    const opMetadata = new LayoutOperation({
        translate: new Point(center.x, diskData.metadata.yPos * size.y),
        dims: resMetadata.getSize(),
        pivot: Point.CENTER
    });
    group.add(resMetadata, opMetadata);

    const posTitle = new Point(center.x, diskData.titleText.posY * size.y);
    const titleFontSize = diskData.titleText.fontSize;
    const lineHeight = diskData.titleText.lineHeight;

    const titleTexts = BOOK_DATA.name.split(" ");
    const titlePositions = [];
    for(let i = 0; i < titleTexts.length; i++)
    {
        titleTexts[i] = convertToSmallCaps(titleTexts[i], titleFontSize);
        titlePositions[i] = posTitle.clone();
        posTitle.add(new Point(0, lineHeight*titleFontSize))
    }

    const titleTextLayers = ["overlay", "shadow", "front"];
    for(const layer of titleTextLayers)
    {
        drawTitleText(size, layer, group, titleTexts, titlePositions);
    }

    drawWildebyteBadge(size, center, group);
    drawTopGradient(size, group);

    const ctx = createContext({ size: size });
    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

const createStandaloneCover = async () =>
{
    const pageSize = convertInchesToPixels(PAGE_SIZE);
    const ctx = createContext({ size: pageSize });
    const center = pageSize.clone().scale(0.5);
    const resFront = createFront(pageSize, center);
    resFront.toCanvas(ctx);

    const img = await convertCanvasToImage(ctx.canvas);
    img.style.maxWidth = "100%";
    img.title = "Wildebyte Cover (" + BOOK_DATA.name + ")";
    document.body.appendChild(img);
}

const createPrintWraparound = async (target:string) =>
{
    const size = getCoverSize(target);
    const ctx = createContext({ size: size });
    const group = new ResourceGroup();

    const pageSize = getPageSizePixels(target);
    const bleedSize = convertInchesToPixels(new Point(TARGETS[target].bleed));
    const centerBack = new Point(bleedSize.x + 0.5 * (pageSize.x - bleedSize.x), 0.5 * pageSize.y);
    const resBack = createBack(pageSize, centerBack);
    group.add(resBack);

    const spineSize = getSpineSizePixels(target)
    const centerSpine = spineSize.clone().scale(0.5);
    const resSpine = createSpine(spineSize, centerSpine);
    const opSpine = new LayoutOperation({ translate: new Point(pageSize.x, 0) });
    group.add(resSpine, opSpine);

    const centerFront = new Point(0.5 * (pageSize.x - bleedSize.x), 0.5 * pageSize.y);
    const resFront = createFront(pageSize, centerFront);
    const opFront = new LayoutOperation({ translate: new Point(pageSize.x + spineSize.x, 0) });
    group.add(resFront, opFront);

    // actually draw the entire thing we prepared
    group.toCanvas(ctx);

    // create the raw image to use however
    const img = await convertCanvasToImage(ctx.canvas);
    img.style.maxWidth = "100%";
    img.title = "Wildebyte Print Wraparound (" + BOOK_DATA.name + ") for target " + target;
    document.body.appendChild(img);

    // also create a PDF automatically
    downloadPDF(img);
}

const downloadPDF = (img:HTMLImageElement) =>
{
    if(!CREATE_PDF) { return; }

    const fileName = "Wildebyte Print Wraparound (" + BOOK_DATA.name + ")";
    const size = new Point(img.naturalWidth, img.naturalHeight);
    const pdfConfig = {
        unit: 'px',
        orientation: "landscape",
        format: [size.x, size.y],
        hotfixes: ["px_scaling"]
    }

    const doc = new jsPDF(pdfConfig);
    // DOC: addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    // compression values = NONE, FAST, MEDIUM, SLOW
    doc.addImage(img, 'png', 0, 0, size.x, size.y, undefined, 'MEDIUM');
    doc.save(fileName);
}

const start = async () =>
{
    resLoader = new ResourceLoader({ base: "/wildebyte-cover-generator/assets/" });
    await loadAssets(resLoader);

    for(const key of Object.keys(TARGETS))
    {
        createPrintWraparound(key);
    }

    createStandaloneCover();
}

start();