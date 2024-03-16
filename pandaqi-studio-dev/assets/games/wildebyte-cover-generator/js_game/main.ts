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

// @NOTE: the bookData.ts file is saved PER BOOK in their folder, so I can just copy-paste it into here to get all the book info

const resLoader = new ResourceLoader({ base: "/wildebyte-cover-generator/assets/" });
loadAssets(resLoader);

const insertLineBreaks = (str:string) =>
{
    // @ts-ignore
    return str.replaceAll(" ", "\n");
}

const convertToSmallCaps = (str:string, fontSize:number) =>
{
    str = str.toUpperCase();

    const capSize = fontSize * 1.164;
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
    return (input >>> 0).toString(2);
}

const convertInchesToPixels = (input:Point) =>
{
    return input.clone().scale(300).ceil();
}

const getSpineSize = (target:string) =>
{
    return new Point(TARGETS[target].pageThickness * BOOK_DATA.numPages, getPageSize(target).y);
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

const drawElectricityLines = (size: Point, group:ResourceGroup) =>
{
    const center = size.clone().scale(0.5);
    const diskData = DISKS[BOOK_DATA.disk];
    const res = resLoader.getResource("electricity_lines");
    const op = new LayoutOperation({
        translate: center,
        dims: size,
        alpha: diskData.electricityLines.alpha,
        composite: diskData.electricityLines.composite,
        pivot: Point.CENTER
    })
    group.add(res, op)
}

const drawWildebyteBadge = (size: Point, group: ResourceGroup) =>
{
    const diskData = DISKS[BOOK_DATA.disk];
    const pos = new Point(0.5 * size.x, diskData.badge.yPos * size.y);

    // badge itself
    const res = resLoader.getResource("wildebyte_badge");
    const op = new LayoutOperation({
        translate: pos,
        dims: res.getSize(),
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
        pivot: Point.CENTER,
        fill: diskData.badge.smallTextColor,
        composite: diskData.badge.composite
    })
    group.add(resTextSmall, opTextSmall);

    // installment text big (binary number, bold, below)
    const textConfigBig = new TextConfig({
        font: diskData.fonts.body,
        size: diskData.badge.largeFontSize,
        weight: TextWeight.BOLD
    }).alignCenter();

    const textBig = convertToBinary(BOOK_DATA.index - 1);
    const resTextBig = new ResourceText({ text: textBig, textConfig: textConfigBig });
    const opTextBig = new LayoutOperation({
        translate: new Point(pos.x, pos.y + diskData.badge.bigTextOffsetY*res.getSize().y),
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

    // the sprite supporting the heading
    const resHeading = resLoader.getResource("back_heading");
    const opHeading = new LayoutOperation({
        translate: pos,
        dims: resHeading.getSize(),
        pivot: Point.CENTER,
        flipX: (index % 2 == 0) && diskData.back.alternateFlipHeadings
    });
    group.add(resHeading, opHeading);

    // the actual heading text
    // @TODO: needs stroke or shadow, see original covers
    const textConfigHeading = new TextConfig({
        font: diskData.fonts.heading,
        size: diskData.back.headingFontSize,
    }).alignCenter();

    const resHeadingText = new ResourceText({ text: sectionData.title, textConfig: textConfigHeading });
    const opHeadingText = new LayoutOperation({
        translate: pos,
        dims: resHeading.getSize(),
        pivot: Point.CENTER,
        fill: diskData.back.textColor
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

    const resText = new ResourceText({ text: sectionData.text, textConfig: textConfig });
    const opText = new LayoutOperation({
        translate: new Point(pos.x, pos.y + 0.66*resHeading.getSize().y),
        dims: new Point(0.75 * size.x, 0.5 * size.y),
        fill: diskData.back.textColor
    })
    group.add(resText, opText);
}

const createBack = (size:Point) =>
{
    const group = new ResourceGroup();
    const diskData = DISKS[BOOK_DATA.disk];

    drawBackgroundRect(size, group);
    drawElectricityLines(size, group);
    drawWildebyteBadge(size, group);

    const restartText = diskData.texts.restart.replace("%num%", "#" + BOOK_DATA.index);
    const sections = structuredClone(diskData.back.sections);
    sections[0].text = BOOK_DATA.blurb;
    sections[2].text = restartText;

    for(let i = 0; i < sections.length; i++)
    {
        const sectionData = sections[i];
        const pos = new Point(0.5 * size.x, (diskData.sectionStartY + i*diskData.sectionJumpY) * size.y);
        drawBackSection(sectionData, size, pos, i, group);
    }

    drawTopGradient(size, group);
    return group;
}

const createSpine = (size:Point) =>
{
    const group = new ResourceGroup();
    const diskData = DISKS[BOOK_DATA.disk];
    const spineRot = 0.5*Math.PI;

    // the general textured background
    // @NOTE: it retains its size (larger than any spine will ever be) to prevent any ugly stretching
    const center = size.clone().scale(0.5);
    const resBg = resLoader.getResource("spine_background");
    const opBg = new LayoutOperation({
        translate: center,
        dims: resBg.getSize(),
        pivot: Point.CENTER
    });
    group.add(resBg, opBg);

    // the unique icon for the book
    const resIcon = resLoader.getResource("spine_icon");
    const posIcon = new Point(0.5 * size.x, diskData.spine.iconEdgeOffset * size.y);
    const iconSize = resIcon.getSize();
    const opIcon = new LayoutOperation({
        translate: posIcon,
        dims: iconSize, // @TODO: just use consistent icon size for all books? scaling per book will be wonky I guess
        rotation: spineRot,
        pivot: Point.CENTER
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
    const opTextTitle = new LayoutOperation({
        translate: new Point(posIcon.x, posIcon.y + 0.66*iconSize.x),
        dims: new Point(0.5*size.y, 1.5*textConfigTitle.size),
        fill: diskData.spine.textColor,
        stroke: diskData.spine.strokeColor,
        strokeWidth: diskData.spine.strokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: new Point(0, 0.5),
        rotation: spineRot
    });
    group.add(resTextTitle, opTextTitle);

    // the author's name
    const textConfigAuthor = textConfigTitle.clone();
    textConfigAuthor.alignHorizontal = TextAlign.END;
    textConfigAuthor.size = diskData.spine.authorFontSize;

    const authorText = convertToSmallCaps("Tiamo Pastoor", textConfigAuthor.size);
    const resTextAuthor = new ResourceText({ text: authorText, textConfig: textConfigAuthor });
    const opTextAuthor = new LayoutOperation({
        translate: new Point(posIcon.x, size.y - posIcon.y - 0.66*resIcon.getSize().x),
        dims: new Point(0.5*size.y, 1.5*textConfigAuthor.size),
        fill: diskData.spine.textColor,
        stroke: diskData.spine.strokeColor,
        strokeWidth: diskData.spine.strokeWidth,
        strokeAlign: StrokeAlign.OUTSIDE,
        pivot: new Point(1, 0.5),
        rotation: -spineRot,
        alpha: 0.75
    });
    group.add(resTextAuthor, opTextAuthor);

    // finally, place simple wildebyte icon at the end
    const resWBIcon = resLoader.getResource("wildebyte_logo_simplified");
    const posWBIcon = new Point(0.5 * size.x, size.y - diskData.spine.iconEdgeOffset * size.y);
    const opWBIcon = new LayoutOperation({
        translate: posWBIcon,
        dims: iconSize, 
        rotation: spineRot,
        pivot: Point.CENTER
    })
    group.add(resWBIcon, opWBIcon);

    return group;
}

const createFront = (size:Point) =>
{
    const group = new ResourceGroup();
    const center = size.clone().scale(0.5);
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

    drawElectricityLines(size, group);

    // the unique full_painting again, but now at forefront, locked inside framing graphic
    const resFraming = resLoader.getResource("framing_graphic");
    const framingPos = new Point(0.5 * size.x, diskData.framing.yPos * size.y);
    const paintingDims = resFraming.getSize().clone().scale(diskData.framing.fullPaintingScaleFactor);
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
        translate: new Point(0.5 * size.x, diskData.badge.yPos * size.y),
        dims: resMetadata.getSize(),
        pivot: Point.CENTER
    });
    group.add(resMetadata, opMetadata);
   
    // @TODO: Place the book text on top with all the old effects
    //  -> the major issue here is the gradient per line; can I build an automatic system for that?
    //  -> SOLUTION = Do the text with NEW RESOURCE PER LINE, and just use simple linear gradient to fill each
    //  -> the other issue is the repetition with effects behind it; how to do that cleanly?
    //  -> SOLUTION = Just make one function to draw title text, which allows sending in params for how exactly to do it
    //  -> otherwise, I generally need to add stroke + glow/shadow effects around text everywhere
    const posTitle = new Point(0.5 * size.x, diskData.titleText.posY * size.y);
    const textConfigTitle = new TextConfig({
        font: diskData.fonts.heading,
        size: diskData.titleText.fontSize,
        alignHorizontal: TextAlign.MIDDLE,
        alignVertical: TextAlign.START
    })
    const titleText = insertLineBreaks(convertToSmallCaps(BOOK_DATA.name, textConfigTitle.size));
    const resTitleText = new ResourceText({ text: titleText, textConfig: textConfigTitle });
    const opTitleText = new LayoutOperation({
        translate: posTitle,
        dims: new Point(0.9 * size.x, 0.75 * size.y), // @TODO: just a rough guess here
        fill: "#000000",
        pivot: new Point(0.5, 0)
    });
    group.add(resTitleText, opTitleText)

    drawWildebyteBadge(size, group);
    drawTopGradient(size, group);
    return group;
}

const createCover = async (target:string) =>
{
    const size = getCoverSize(target);
    const ctx = createContext({ size: size });
    const group = new ResourceGroup();

    // @TODO: now all of these groups will draw some stuff outside of boundaries
    // perhaps it's better if each function draws to its own canvas (of limited size), and all we get back is one ResourceImage to draw?
    const groupBack = createBack(getPageSize(target));
    group.add(groupBack);

    const groupSpine = createSpine(getSpineSize(target));
    const spineOp = new LayoutOperation({ translate: new Point(getPageSize(target).x, 0) });
    group.add(groupSpine, spineOp);
    
    const groupFront = createFront(getPageSize(target));
    const frontOp = new LayoutOperation({ translate: new Point(getPageSize(target).x + getSpineSize(target).x, 0) });
    group.add(groupFront, frontOp);

    group.toCanvas(ctx);
    const img = await convertCanvasToImage(ctx.canvas);
    document.body.appendChild(img);
}

for(const key of Object.keys(TARGETS))
{
    createCover(key);
}
