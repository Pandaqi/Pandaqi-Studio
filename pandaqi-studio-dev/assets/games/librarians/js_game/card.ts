import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ACTIONS, ACTIONS_THRILL, AUTHORS, BOOK_TITLES, COLORS, CardType, GENRES, MISC } from "../js_shared/dict";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig, { TextAlign, TextWeight } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import MaskEffect from "js/pq_games/layout/effects/maskEffect";

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
        const backgroundDims = vis.get("cards.background.size");
        const offsetBook = new Point(0.5 * (vis.size.x - backgroundDims.x), 0.5 * (vis.size.y - backgroundDims.y));
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

    getTitle()
    {
        const title = BOOK_TITLES[this.title].label;
        if(this.series > 0) { return title + " " + this.series; }
        return title;
    }

    getAuthor()
    {
        if(!this.author) { return ""; }
        const authorData = AUTHORS[this.author] ?? {};
        const author = authorData.label;
        const freq = authorData.freq;
        if(freq <= 1) { return author; }
        return author + " (" + freq + ")";
    }

    getTargetAudience()
    {
        return this.age;
    }

    getColorData()
    {
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
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        if(this.type == CardType.SHELF) {
            this.drawShelfContent(vis, group);
        } else {
            this.drawBookContent(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // solid background color
        const col = "#462A00";
        fillResourceGroup(vis.size, group, col);

        // main background illustration template
        const res = vis.getResource("covers");
        const frame = (this.type == CardType.BOOK) ? 0 : 1;
        const op = new LayoutOperation({
            pos: vis.center,
            size: vis.get("cards.background.size"),
            frame: frame,
            pivot: Point.CENTER
        })
        group.add(res, op);

        const needsColoredCover = (this.type == CardType.BOOK);
        if(!needsColoredCover) { return; }

        // on books, we get a random (faded, textural) cover on top of the actual book
        const coverOp = op.clone(true);
        coverOp.frame = vis.get("cards.background.cover.frameBounds").randomInteger();
        coverOp.alpha = vis.get("cards.background.cover.alpha");
        group.add(res, coverOp);

        // and we get the overlay rect that discolors the whole thing
        const colorData = this.getColorData();
        const overlayOp = this.getMaskOperation(vis);
        overlayOp.composite = vis.get("cards.background.overlay.composite");
        overlayOp.alpha = vis.get("cards.background.overlay.alpha");
        overlayOp.effects = [new TintEffect(colorData.main)];
        group.add(res, overlayOp);
    }

    getMaskOperation(vis:MaterialVisualizer) : LayoutOperation
    {
        return new LayoutOperation({
            pos: vis.center.clone(),
            size: vis.get("cards.background.size"),
            frame: vis.get("cards.background.overlay.frame"),
            pivot: Point.CENTER,
            composite: vis.get("cards.background.overlay.composite"),
            alpha: vis.get("cards.background.overlay.alpha")
        })
    }

    drawBlurredRect(vis:MaterialVisualizer, group:ResourceGroup, pos:Point, size:Point, color:string = "#FFFFFF", composite:GlobalCompositeOperation = "source-over")
    {
        const blur = vis.get("cards.shared.rectBlur");
        const rect = new Rectangle({ center: pos, extents: size });
        const blurEffect = new BlurEffect(blur);
        const res = new ResourceShape(rect);
        const op = new LayoutOperation({
            fill: color,
            composite: composite,
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

        this.drawBlurredRect(vis, group, arrowPos, arrowRectDims, "#000000");
        const opArrow = new LayoutOperation({
            pos: arrowPos,
            size: vis.get("cards.bookShelf.arrow.size"),
            frame: MISC.bookshelf_arrow.frame,
            flipX: Math.random() <= 0.5,
            pivot: Point.CENTER
        });
        group.add(resMisc, opArrow);

        // the main text + white blurred rect behind
        const textPos = vis.get("cards.bookShelf.text.pos");
        const textDims = vis.get("cards.bookShelf.text.size");
        this.drawBlurredRect(vis, group, textPos, textDims, "#FFFFFF");

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
            new Point(textPos.x - 0.5*textDims.x, textPos.y + 0.5*textDims.y - 0.5*arrowVertDims.y),
            new Point(textPos.x + 0.5*textDims.x, textPos.y + 0.5*textDims.y - 0.5*arrowVertDims.y)
        ]
        for(const pos of positions)
        {
            const op = new LayoutOperation({
                pos: pos,
                size: arrowVertDims,
                frame: MISC.bookshelf_arrow.frame,
                rot: 0.5*Math.PI,
                pivot: Point.CENTER
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

        const maskResource = vis.getResource("covers");
        
        for(let i = 0; i < corners.length; i++)
        {
            const posRect = cornersNoOffset[i].clone().add(bookCoverOffset);
            const posIcon = corners[i].clone().add(bookCoverOffset);

            // This SHOULD make sure the edges are clipped to make sure it neatly stays on the book
            // @TODO: might be offset slightly wrong or scaled wrong, have to test
            const maskOperation = this.getMaskOperation(vis);
            const maskEffect = new MaskEffect({ resource: maskResource, operation: maskOperation });

            const opRect = new LayoutOperation({
                pos: posRect,
                composite: vis.get("cards.genre.compositeRect"),
                size: vis.get("cards.genre.sizeRect"),
                frame: MISC.rect_rounded.frame,
                pivot: Point.CENTER,
                effects: [maskEffect]
            });
            group.add(resMisc, opRect);

            const opIcon = new LayoutOperation({
                pos: posIcon,
                size: vis.get("cards.genre.sizeIcon"),
                frame: genreData.frame,
                pivot: Point.CENTER,
                effects: [maskEffect]
            })
            group.add(resGenreIcons, opIcon);
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

        const textOffsetY = vis.get("cards.genre.textOffsetY");
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
            alignHorizontal: TextAlign.START
        })

        const textConfigAge = textConfigAuthor.clone(true);
        textConfigAge.alignHorizontal = TextAlign.END;

        const author = "<em>" + this.getAuthor() + "</em>";
        const rotation = 0.5 * Math.PI;
        const textColor = vis.get("cards.metadata.textColor");
        const textAlpha = vis.get("cards.metadata.textAlpha");

        // author icon (anchored top)
        const resIcon = vis.getResource("misc");
        const edgeMargin = vis.get("cards.metadata.edgeMargin");
        const posIcon = new Point(rectSpine.center.x, rectSpine.getTopLeft().y + edgeMargin);
        const sizeIcon = vis.get("cards.metadata.sizeIcon");
        const compositeIcon = vis.get("cards.metadata.compositeIcon");
        const opIconAuthor = new LayoutOperation({
            pos: posIcon,
            size: sizeIcon,
            frame: MISC.author_icon.frame,
            composite: compositeIcon,
            pivot: Point.CENTER
        });
        group.add(resIcon, opIconAuthor);

        // author text (anchored top, after icon)
        const resTextAuthor = new ResourceText({ text: author, textConfig: textConfigAuthor });
        const opTextAuthor = new LayoutOperation({
            pos: posIcon.clone().add(new Point(0, 0.5*sizeIcon.x)),
            pivot: new Point(0, 0.5),
            fill: textColor,
            alpha: textAlpha,
            rot: rotation
        })
        group.add(resTextAuthor, opTextAuthor)

        // age/target audience icon (anchored bottom)
        const posIconBottom = new Point(rectSpine.center.x, rectSpine.getBottomLeft().y - edgeMargin); 
        const opIconAge = new LayoutOperation({
            pos: posIconBottom,
            size: sizeIcon,
            frame: MISC.age_icon.frame,
            composite: compositeIcon,
            pivot: Point.CENTER
        })
        group.add(resIcon, opIconAge);

        // age/target audience text (anchored bottom, before icon)
        const targetAudienceText = "<em>" + this.getTargetAudience() + "</em>";
        const resTextAge = new ResourceText({ text: targetAudienceText, textConfig: textConfigAge });
        const opTextAge = new LayoutOperation({
            pos: posIconBottom.clone().add(new Point(0, -0.5*sizeIcon.x)),
            pivot: new Point(1, 0.5),
            fill: textColor,
            alpha: textAlpha,
            rot: rotation
        });
        group.add(resTextAge, opTextAge);
    }

    drawTitle(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const title = this.getTitle();
        const initial = title.slice(0,1).toUpperCase();
        const colorData = this.getColorData();

        const { rectBook, rectSpine, rectInner } = this.getBookDimensions(vis);

        // the huge drop cap at the top
        const dropCapSize = vis.get("cards.dropCap.fontSize");
        const dropCapOffsetY = vis.get("cards.dropCap.offsetY") * rectInner.getSize().y;
        const dropCapPos = new Point(rectInner.center.x, rectInner.getTopLeft().y + dropCapOffsetY)
        this.drawBlurredRect(vis, group, dropCapPos, new Point(1.25*dropCapSize), "#FFFFFF");

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
                new Point(dropCapPos.x - 0.66 * dropCapSize, dropCapPos.y),
                new Point(dropCapPos.x + 0.66 * dropCapSize, dropCapPos.y)
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
        this.drawBlurredRect(vis, group, titlePos, titleDims, "#FFFFFF", "overlay");

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

        const colorData = this.getColorData();

        const { rectBook, rectSpine, rectInner } = this.getBookDimensions(vis);

        // blurred rect behind it all 
        const offsetY = vis.get("cards.action.offsetY") * rectInner.getSize().y;
        const sizeY = vis.get("cards.action.sizeY") * rectInner.getSize().y;
        const actionPos = new Point(rectInner.center.x, rectInner.getTopLeft().y + offsetY);
        const actionDims = new Point(rectInner.extents.x, sizeY);
        this.drawBlurredRect(vis, group, actionPos, actionDims, "#FFFFFF", "overlay");

        // "header" of action
        // > first the icon (on the left)
        const resIcon = vis.getResource("actions");
        const sizeIcon = vis.get("cards.action.sizeIcon");
        const posHeader = actionPos.clone().add(new Point(-0.5*actionDims.x + 0.5*sizeIcon.x, -0.5*actionDims.y + 0.5*sizeIcon.y));        
        const opIcon = new LayoutOperation({
            pos: posHeader,
            size: sizeIcon,
            frame: actionData.frame
        });
        group.add(resIcon, opIcon);

        // > then the action title (on the right)
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.fontSize")
        }).alignCenter();
        const textLabel = "<b>" + actionData.label + "</b>"
        const resTextTitle = new ResourceText({ text: textLabel, textConfig: textConfig });
        const opTextTitle = new LayoutOperation({
            pos: posHeader.clone().add(0.5 * (actionDims.x - sizeIcon.x)),
            size: actionDims,
            pivot: Point.CENTER,
            fill: colorData.dark,
        });
        group.add(resTextTitle, opTextTitle);
        
        // if enabled, also the full explanation of the action
        const addActionExplanation = vis.get("addActionExplanation");
        if(addActionExplanation)
        {
            const actionExplanation = "<em>" + actionData.desc + "</em>";
            const resTextAction = new ResourceText({ text: actionExplanation, textConfig: textConfig });
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