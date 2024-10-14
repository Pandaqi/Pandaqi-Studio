import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign, TextWeight } from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { ACTIONS, ACTIONS_THRILL, AGE_RANGES, AUTHORS, BOOK_TITLES, COLORS, CardType, GENRES, MISC } from "../js_shared/dict";
import InvertEffect from "js/pq_games/layout/effects/invertEffect";

export default class Card
{
    type:CardType
    title:string
    genre:string
    author:string
    age:string
    series:number // @NOTE: this is only > 0 if it's part of a series (in which case it's the precise index)
    action:string // @NOTE: this is only for the custom action cards and bookshelves; otherwise, action is taken from genre directly

    constructor(type:CardType = CardType.BOOK, title:string = "", genre:string = "", author:string = "", age: string = "", series:number = 0, action:string = "")
    {
        this.type = type;
        this.title = title;
        this.genre = genre;
        this.author = author;
        this.age = age;
        this.series = series;
        this.action = action;
    }

    getBookDimensions(vis:MaterialVisualizer)
    {
        const backgroundDims = vis.get("cards.background.size").clone();
        const offsetBook = new Point(0.5 * (vis.size.x - backgroundDims.x), 0.5 * (vis.size.y - backgroundDims.y) + 0.045*backgroundDims.y);
        const sizeBook = vis.get("cards.background.sizeOverlayRelative").clone().scale(backgroundDims);
        const rectBook = new Rectangle().fromTopLeft(offsetBook, sizeBook);

        const spineWidth = vis.get("cards.background.spineWidthRelative") * backgroundDims.x;
        const rectSpine = new Rectangle().fromTopLeft(offsetBook, new Point(spineWidth, sizeBook.y));

        const offsetInner = offsetBook.clone().add(new Point(spineWidth, 0));
        const rectInner = new Rectangle().fromTopLeft(offsetInner, new Point(sizeBook.x - spineWidth, sizeBook.y));

        return { rectBook, rectSpine, rectInner }
    }

    isEmptyObject(obj)
    {
        return Object.keys(obj).length <= 0
    }

    getInitial()
    {
        return BOOK_TITLES[this.title].initial ?? this.getTitle().slice(0,1).toUpperCase()
    }

    getTitle()
    {
        const title = BOOK_TITLES[this.title].label;
        if(this.series > 0) { return title + " " + this.series; }
        return title;
    }

    getAuthor()
    {
        if(!this.author || this.author == "Anonymous") { return "Anonymous"; }

        const authorData = AUTHORS[this.author] ?? {};
        const author = authorData.label;
        const freq = authorData.freq;
        if(freq <= 1) { return author; }
        return author + " (" + freq + ")";
    }

    getTargetAudience()
    {
        if(!this.age) { return "Any" };
        return AGE_RANGES[this.age].label;
    }

    getColorData(vis:MaterialVisualizer, bypassInkfriendly:boolean = false)
    {
        if(vis.inkFriendly && !bypassInkfriendly) { return COLORS.default; }
        return COLORS[this.getGenreData().color ?? "default"];
    }

    getGenreData()
    {
        if(!this.genre) { return {}; }
        return GENRES[this.genre];
    }

    getActionData()
    {
        if(this.action) 
        { 
            // @NOTE: shelves have completely dynamic/custom actions so they don't have a key, 
            // just the final string saved in this.action, so return that inside object
            if(this.type == CardType.SHELF) { return { desc: this.action }; } 
            return ACTIONS_THRILL[this.action]; 
        }

        if(this.getGenreData().action)
        { 
            return ACTIONS[this.getGenreData().action];
        }

        return {};
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();

        this.drawBackground(vis, group);
        if(this.type == CardType.SHELF) {
            this.drawShelfContent(vis, group);
        } else {
            this.drawBookContent(vis, group);
        }

        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // solid background color
        const col = vis.inkFriendly ? "#FFFFFF" : "#462A00";
        fillResourceGroup(vis.size, group, col);

        // main background illustration template
        const res = vis.getResource("covers");
        const frame = (this.type == CardType.BOOK) ? 0 : 1;
        const op = new LayoutOperation({
            pos: vis.center,
            size: vis.get("cards.background.size"),
            frame: frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        })
        group.add(res, op);

        const needsColoredCover = (this.type == CardType.BOOK);
        if(!needsColoredCover) { return; }

        // on books, we get a random (faded, textural) cover on top of the actual book
        // (and we mask it to prevent overflowing the edges)
        const addSpecificCover = !vis.inkFriendly;
        if(addSpecificCover)
        {
            const coverOp = new LayoutOperation({
                pos: vis.center,
                size: vis.get("cards.background.size"),
                frame: vis.get("cards.background.cover.frameBounds").randomInteger(),
                pivot: Point.CENTER,
                alpha: vis.get("cards.background.cover.alpha"),
                mask: this.getMaskData(vis),
            })
            group.add(res, coverOp);

            // and we get the overlay rect that discolors the whole thing
            const colorData = this.getColorData(vis, true);
            const overlayOp = new LayoutOperation({
                pos: vis.center.clone(),
                size: vis.get("cards.background.size"),
                frame: vis.get("cards.background.overlay.frame"),
                pivot: Point.CENTER,
                composite: vis.get("cards.background.overlay.composite"),
                alpha: vis.get("cards.background.overlay.alpha"),
                effects: [new TintEffect(colorData.main)],
            });
            group.add(res, overlayOp);
        }
    }

    getMaskData(vis:MaterialVisualizer)
    {
        const maskResource = vis.getResource("covers");
        const maskOperation = this.getMaskOperation(vis);
        return { resource: maskResource, operation: maskOperation };
    }

    getMaskOperation(vis:MaterialVisualizer) : LayoutOperation
    {
        return new LayoutOperation({
            pos: vis.center.clone(),
            size: vis.get("cards.background.size"),
            frame: vis.get("cards.background.overlay.frame"),
            pivot: Point.CENTER,
        })
    }

    drawBlurredRect(vis:MaterialVisualizer, group:ResourceGroup, pos:Point, size:Point, color:string = "#FFFFFF", composite:GlobalCompositeOperation = "source-over", alpha:number = 1.0)
    {
        const blur = vis.get("cards.shared.rectBlur");
        const rect = new Rectangle({ center: pos, extents: size });
        const blurEffect = new BlurEffect(blur);
        const res = new ResourceShape(rect);
        const op = new LayoutOperation({
            fill: color,
            composite: composite,
            alpha: alpha,
            effects: [blurEffect]
        });
        group.add(res, op);
    }

    drawShelfContent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the main arrow + black blurred rect behind
        const resMisc = vis.getResource("misc");
        const arrowPos = vis.get("cards.bookShelf.arrow.pos");
        const arrowRectDims = vis.get("cards.bookShelf.arrow.sizeRect");

        this.drawBlurredRect(vis, group, arrowPos, arrowRectDims, "#00000088");
        const opArrow = new LayoutOperation({
            pos: arrowPos,
            size: vis.get("cards.bookShelf.arrow.size"),
            frame: MISC.bookshelf_arrow.frame,
            flipX: Math.random() <= 0.5,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(resMisc, opArrow);

        // the main text + white blurred rect behind
        const textPos = vis.get("cards.bookShelf.text.pos");
        const textDims = vis.get("cards.bookShelf.text.size");
        this.drawBlurredRect(vis, group, textPos, textDims, "#FFFFFFDD");

        const actionText = this.getActionData().desc;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.bookShelf.text.fontSize"),
        }).alignCenter();
        const resText = new ResourceText({ text: actionText, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: textPos,
            size: textDims,
            fill: vis.get("cards.bookShelf.text.color"),
            pivot: Point.CENTER
        });
        group.add(resText, opText);

        // the vertical arrows on top, at the left/right edges
        const arrowVertDims = vis.get("cards.bookShelf.arrow.sizeVertical");
        const positions = [
            new Point(textPos.x - 0.55*textDims.x, textPos.y + 0.5*textDims.y - 0.5*arrowVertDims.y),
            new Point(textPos.x + 0.55*textDims.x, textPos.y + 0.5*textDims.y - 0.5*arrowVertDims.y)
        ]
        for(const pos of positions)
        {
            const op = new LayoutOperation({
                pos: pos,
                size: arrowVertDims,
                frame: MISC.bookshelf_arrow.frame,
                rot: 0.5*Math.PI,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            });
            group.add(resMisc, op);
        }
    }

    drawBookContent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        this.drawGenre(vis, group);
        this.drawMetadata(vis, group);
        this.drawTitle(vis, group);
        this.drawAction(vis, group);
    }

    drawGenre(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const genreData = this.getGenreData();
        if(this.isEmptyObject(genreData)) { return; }

        // draw the icons in the corners + rect behind them
        const { rectBook, rectSpine, rectInner } = this.getBookDimensions(vis);

        const bookCoverSize = rectInner.getSize();
        const bookCoverOffset = rectInner.getTopLeft();
        
        const cornerOffset = vis.get("cards.genre.cornerOffset");
        const corners = getRectangleCornersWithOffset(bookCoverSize, cornerOffset);
        const cornersNoOffset = getRectangleCornersWithOffset(bookCoverSize, new Point());
        
        const resMisc = vis.getResource("misc");
        const resGenreIcons = vis.getResource("genres");

        if(vis.get("addGenreIcons"))
        {
            const effects = vis.inkFriendly ? vis.inkFriendlyEffect : [new InvertEffect()];
            for(let i = 0; i < corners.length; i++)
            {
                const posRect = cornersNoOffset[i].clone().add(bookCoverOffset);
                const posIcon = corners[i].clone().add(bookCoverOffset);
    
                // This MASK property SHOULD make sure the edges are clipped to make sure it neatly stays on the book
                const opRect = new LayoutOperation({
                    pos: posRect,
                    composite: vis.get("cards.genre.compositeRect"),
                    size: vis.get("cards.genre.sizeRect"),
                    frame: MISC.rect_rounded.frame,
                    pivot: Point.CENTER,
                    mask: this.getMaskData(vis),
                });
                group.add(resMisc, opRect);
    
                const opIcon = new LayoutOperation({
                    pos: posIcon,
                    size: vis.get("cards.genre.sizeIcon"),
                    frame: genreData.frame,
                    pivot: Point.CENTER,
                    effects: effects
                })
                group.add(resGenreIcons, opIcon);
            }
        }

        // write out the genre name top and bottom
        const label = genreData.label;
        const fontSize = vis.get("cards.genre.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            weight: TextWeight.BOLD
        }).alignCenter();

        const resText = new ResourceText({ text: label, textConfig: textConfig });

        const textOffsetY = vis.get("cards.genre.textOffsetY").y;
        const positions = [
            new Point(bookCoverOffset.x + 0.5*bookCoverSize.x, bookCoverOffset.y + textOffsetY),
            new Point(bookCoverOffset.x + 0.5*bookCoverSize.x, bookCoverOffset.y + bookCoverSize.y - textOffsetY)
        ]

        for(const pos of positions)
        {
            const opText = new LayoutOperation({
                pos: pos,
                size: new Point(bookCoverSize.x, 2*fontSize),
                pivot: Point.CENTER,
                fill: vis.get("cards.genre.textColor"),
                composite: vis.get("cards.genre.textComposite") 
            });
            group.add(resText, opText);
        }
    }

    drawMetadata(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.getAuthor() && !this.getTargetAudience()) { return; }

        const { rectBook, rectSpine, rectInner } = this.getBookDimensions(vis);

        const fontSize = vis.get("cards.metadata.fontSize");
        const textConfigAuthor = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            alignVertical: TextAlign.MIDDLE,
            alignHorizontal: TextAlign.END
        })

        const textConfigAge = textConfigAuthor.clone(true);
        textConfigAge.alignHorizontal = TextAlign.START;

        const author = "<em>" + this.getAuthor() + "</em>";
        const rotation = -0.5 * Math.PI;
        const textColor = vis.get("cards.metadata.textColor");
        const strokeColor = vis.get("cards.metadata.strokeColor");
        const textAlpha = vis.get("cards.metadata.textAlpha");

        // author icon (anchored top)
        const resIcon = vis.getResource("misc");
        const edgeMargin = vis.get("cards.metadata.edgeMargin");
        const posIcon = new Point(rectSpine.getCenter().x, rectSpine.getTopLeft().y + edgeMargin);
        const sizeIcon = vis.get("cards.metadata.sizeIcon");
        const effects = vis.inkFriendlyEffect; // decided against using glow, just didn't look great, especially not combined with composite here
        const compositeIcon = vis.get("cards.metadata.compositeIcon");
        const opIconAuthor = new LayoutOperation({
            pos: posIcon,
            rot: rotation,
            size: sizeIcon,
            frame: MISC.author_icon.frame,
            composite: compositeIcon,
            pivot: Point.CENTER,
            effects: effects
        });
        group.add(resIcon, opIconAuthor);

        // author text (anchored top, after icon)
        const resTextAuthor = new ResourceText({ text: author, textConfig: textConfigAuthor });
        const textBoxSize = new Point(rectSpine.getSize().y, rectSpine.getSize().x);
        const strokeWidth = 0.1*textConfigAuthor.size;
        const opTextAuthor = new LayoutOperation({
            pos: posIcon.clone().add(new Point(0, 0.5*sizeIcon.x)),
            size: textBoxSize,
            rot: rotation,
            pivot: new Point(1, 0.5),
            fill: textColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            alpha: textAlpha,
        })
        group.add(resTextAuthor, opTextAuthor)

        // age/target audience icon (anchored bottom)
        const posIconBottom = new Point(rectSpine.center.x, rectSpine.getBottomLeft().y - edgeMargin); 
        const opIconAge = new LayoutOperation({
            pos: posIconBottom,
            rot: rotation,
            size: sizeIcon,
            frame: MISC.age_icon.frame,
            composite: compositeIcon,
            pivot: Point.CENTER,
            effects: effects
        })
        group.add(resIcon, opIconAge);

        // age/target audience text (anchored bottom, before icon)
        const targetAudienceText = "<em>" + this.getTargetAudience() + "</em>";
        const resTextAge = new ResourceText({ text: targetAudienceText, textConfig: textConfigAge });
        const opTextAge = new LayoutOperation({
            pos: posIconBottom.clone().add(new Point(0, -0.5*sizeIcon.x)),
            size: textBoxSize,
            rot: rotation,
            pivot: new Point(0, 0.5),
            fill: textColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            alpha: textAlpha,
        });
        group.add(resTextAge, opTextAge);
    }

    drawTitle(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const title = this.getTitle();
        const initial = this.getInitial();
        const colorData = this.getColorData(vis);

        const { rectBook, rectSpine, rectInner } = this.getBookDimensions(vis);

        // the huge drop cap at the top
        const dropCapSize = vis.get("cards.dropCap.fontSize");
        const dropCapOffsetY = vis.get("cards.dropCap.offsetY") * rectInner.getSize().y;
        const dropCapPos = new Point(rectInner.center.x, rectInner.getTopLeft().y + dropCapOffsetY)
        this.drawBlurredRect(vis, group, dropCapPos, new Point(dropCapSize), "#FFFFFF");

        const textConfigDropCap = new TextConfig({
            font: vis.get("fonts.special"),
            size: dropCapSize
        }).alignCenter();
        const resTextDropCap = new ResourceText({ text: initial, textConfig: textConfigDropCap });
        const opDropCap = new LayoutOperation({
            pos: dropCapPos,
            size: new Point(2.0 * dropCapSize),
            pivot: Point.CENTER,
            fill: colorData.dark
        });
        group.add(resTextDropCap, opDropCap);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.title.fontSize")
        }).alignCenter();

        // the numbers for alphabet position to left and right (optional; behind toggle)
        const addNumbers = vis.get("addHelpNumbers");
        if(addNumbers)
        {
            const positions = [
                new Point(dropCapPos.x - 0.6 * dropCapSize, dropCapPos.y),
                new Point(dropCapPos.x + 0.6 * dropCapSize, dropCapPos.y)
            ]

            const alphabetIndex = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").indexOf(initial) + 1;
            const resTextNumber = new ResourceText({ text: alphabetIndex.toString(), textConfig: textConfig });
            for(const pos of positions)
            {
                const opNumber = new LayoutOperation({
                    pos: pos,
                    size: new Point(1.5*textConfig.size),
                    pivot: Point.CENTER,
                    fill: vis.get("cards.title.helpNumbersColor"),
                    alpha: vis.get("cards.title.helpNumbersAlpha")
                });
                group.add(resTextNumber, opNumber);
            }
        }

        // the actual spelled out title below
        const titleOffsetY = vis.get("cards.title.offsetY") * rectInner.getSize().y;
        const titlePos = new Point(rectInner.center.x, rectInner.getTopLeft().y + titleOffsetY);
        const titleDims = vis.get("cards.title.size");
        this.drawBlurredRect(vis, group, titlePos, titleDims, "#FFFFFF", "source-over", 0.85);

        const titleText = "<em>" + title + "</em>";
        const resText = new ResourceText({ text: titleText, textConfig: textConfig });
        const op = new LayoutOperation({
            pos: titlePos,
            size: titleDims,
            pivot: Point.CENTER,
            fill: colorData.dark,
        });
        group.add(resText, op);
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const actionData = this.getActionData();
        if(this.isEmptyObject(actionData)) { return; }

        const colorData = this.getColorData(vis);

        const { rectBook, rectSpine, rectInner } = this.getBookDimensions(vis);

        // blurred rect behind it all 
        const offsetY = vis.get("cards.action.offsetY") * rectInner.getSize().y;
        const sizeY = vis.get("cards.action.sizeY") * rectInner.getSize().y;
        const actionPos = new Point(rectInner.center.x, rectInner.getTopLeft().y + offsetY);
        const actionDims = new Point(rectInner.extents.x, sizeY);
        const fontSizeTitle = vis.get("cards.action.fontSize");
        this.drawBlurredRect(vis, group, actionPos.clone().add(new Point(0, 0.33*fontSizeTitle)), actionDims, "#FFFFFF", "source-over", 0.7);

        // "header" of action
        const sizeIcon = vis.get("cards.action.sizeIcon");
        const posHeader = actionPos.clone().add(new Point(-0.5*actionDims.x + 0.5*sizeIcon.x, -0.5*actionDims.y + 0.5*sizeIcon.y));  
        const iconFrame = actionData.frame ?? -1; 
        const shouldDrawIcon = vis.get("addActionIcon") && iconFrame != -1;  
        if(shouldDrawIcon)
        {
            // > first the icon (on the left)
            const resIcon = vis.getResource("actions");
            const opIcon = new LayoutOperation({
                pos: posHeader,
                size: sizeIcon,
                frame: iconFrame,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            });
            group.add(resIcon, opIcon);
        }

        // > then the action title (on the right)
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSizeTitle,
            alignHorizontal: shouldDrawIcon ? TextAlign.END : TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const posTitle = posHeader.clone().add(new Point(0.5 * (actionDims.x - sizeIcon.x) , 0));
        if(shouldDrawIcon) { posTitle.x -= 0.75*textConfig.size; }

        const textLabel = "<b>" + actionData.label + "</b>";
        const resTextTitle = new ResourceText({ text: textLabel, textConfig: textConfig });
        const opTextTitle = new LayoutOperation({
            pos: posTitle,
            size: new Point(actionDims.x, sizeIcon.y),
            pivot: Point.CENTER,
            fill: colorData.dark,
        });
        group.add(resTextTitle, opTextTitle);
        
        // if enabled, also the full explanation of the action
        const textConfigExplanation = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSizeTitle,
        }).alignCenter();

        const addActionExplanation = vis.get("addActionExplanation");
        if(addActionExplanation)
        {
            const actionExplanation = "<em>" + actionData.desc + "</em>";
            const resTextAction = new ResourceText({ text: actionExplanation, textConfig: textConfigExplanation });
            const opTextAction = new LayoutOperation({
                pos: actionPos.clone().add(new Point(0, 0.5 * sizeIcon.y)),
                size: actionDims,
                pivot: Point.CENTER,
                fill: colorData.dark
            });
            group.add(resTextAction, opTextAction);
        }
    }


}