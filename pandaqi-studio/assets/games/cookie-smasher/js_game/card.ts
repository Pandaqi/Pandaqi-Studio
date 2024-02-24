import createContext from "js/pq_games/layout/canvas/createContext";
import { COLORS, CardData, TYPES, Type } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import fromArray from "js/pq_games/tools/random/fromArray";
import LayoutNode from "js/pq_games/layout/layoutNode";
import TwoAxisValue from "js/pq_games/layout/values/twoAxisValue";
import { FlowDir, FlowType } from "js/pq_games/layout/values/aggregators/flowInput";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import DisplayValue from "js/pq_games/layout/values/displayValue";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import subdividePath from "js/pq_games/tools/geometry/paths/subdividePath";
import WonkyRectangle from "./wonkyRectangle";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import AlignValue from "js/pq_games/layout/values/alignValue";
import AnchorValue from "js/pq_games/layout/values/anchorValue";
import ColorLike from "js/pq_games/layout/color/colorLike";
import Color from "js/pq_games/layout/color/color";
import Path from "js/pq_games/tools/geometry/paths/path";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import calculateCenter from "js/pq_games/tools/geometry/paths/calculateCenter";
import calculateBoundingBox from "js/pq_games/tools/geometry/paths/calculateBoundingBox";
import movePath from "js/pq_games/tools/geometry/transform/movePath";
import Line from "js/pq_games/tools/geometry/line";
import Rectangle from "js/pq_games/tools/geometry/rectangle";

export default class Card
{
    food: string;
    type: Type;
    num: number;
    desc: string;
    safe: boolean;
    didSomething: boolean; // to track if safe food actually had an influence

    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;
    colorMain: string;

    poisoned: boolean;

    anyCustom: (string|number)[];
    typesCustom: string[];
    numbersCustom: number[];
    data: CardData;

    constructor(f:string, data:CardData)
    {
        this.food = f;
        this.num = -1;
        this.desc = "";
        this.data = data;
    }

    fill()
    {
        this.safe = this.data.safe;
        this.type = this.data.type;

        this.fillNumber();
        this.fillDescription();
    }

    fillNumber()
    {
        const data = this.data;

        let num = data.num;
        if(num <= 0 && data.numRange) 
        {
            num = data.numRange.randomInteger();
        }

        this.num = num;
    }

    fillDescription()
    {
        let desc = this.data.desc;
        const types = [];
        const numbers = [];
        const any = [];

        // replace any's
        let needle = "%any%"
        while(desc.includes(needle))
        {
            const displayType = Math.random() <= 0.5;
            let val;
            if(displayType) { val = this.getRandomType(types); types.push(val); }
            else { val = this.getRandomNumber(numbers); numbers.push(val); }
            any.push(val);
            desc = desc.replace(needle, this.toDescString(val));
        }

        // replace all randomly generated types
        needle = "%type%";
        while(desc.includes(needle))
        {
            const type = this.getRandomType(types);
            types.push(type);
            //const typeString = ; => replace string by image of icon, or is that done during draw?
            desc = desc.replace(needle, this.toDescString(type));
        }

        // replace with given number of this card
        needle = "%num%"
        while(desc.includes(needle))
        {
            const val = this.num;
            numbers.push(val);
            desc = desc.replace(needle, this.toDescString(val));
        }

        // replace custom keys
        // @TODO: this surely needs testing
        // @NOTE: for now, this only supports numbers (and expects them to be in that format)
        const regex = /\%(.+?)\%/g;
        let match;
        do 
        {
            match = regex.exec(desc);
            if(!match) { break; }

            const key = match[1]; // this is the captured group; match[0] is the full match
            const vals = this.data[key];
            const val = this.getRandomNumber(numbers, vals.asList());
            numbers.push(val);
            desc = desc.replace(match[0], this.toDescString(val));
        } while (match);

        this.anyCustom = any;
        this.typesCustom = types;
        this.numbersCustom = numbers;

        this.desc = desc;
    }

    toDescString(input:any)
    {
        return "$" + input.toString() + "$";
    }

    setPoisoned(val:boolean)
    {
        if(this.data.safe) { return; } // safe cards are NEVER poisoned
        this.poisoned = val;
    }

    flipPoisoned() 
    {
        this.setPoisoned(!this.poisoned);
    }

    changeNum(dn:number)
    {
        // @TODO: certain situations in which this isn't allowed?
        this.num += dn;
    }

    getRandomNumber(exclude = [], list = CONFIG.possibleNumbers)
    {
        let num = list.slice();
        exclude = exclude.slice();
        exclude.push(this.num); // never pick our main num for custom numbers
        for(const elem of exclude)
        {
            const idx = num.indexOf(elem);
            if(idx < 0) { continue; }
            num.splice(idx, 1);
        }
        return fromArray(num);
    }

    getRandomType(exclude = [], list = CONFIG.possibleTypes)
    {
        const types = CONFIG.possibleTypes.slice();
        exclude = exclude.slice();
        exclude.push(this.type); // never pick our main type for custom types
        for(const elem of exclude)
        {
            const idx = types.indexOf(elem);
            if(idx < 0) { continue; }
            types.splice(idx, 1);
        }
        return fromArray(types);
    }

    async drawForRules(cfg)
    {
        const size = cfg.cardSize.clone();
        const sizeUnit = Math.min(size.x, size.y);
        const ctx = createContext({ size: size });

        const colorMain = COLORS[ cfg.possibleCards[this.food].color ];

        // background + stroke
        ctx.fillStyle = colorMain;
        ctx.fillRect(0, 0, size.x, size.y);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, size.x, size.y);

        // text
        const fontSize = 0.2*sizeUnit;
        ctx.textAlign = "center";
        ctx.font = fontSize + "px " + cfg.fontFamily;
        ctx.fillStyle = "#000000";

        // > main food
        const textPos = new Point(0.5*size.x, 0.5*size.y + 0.33*fontSize);
        ctx.fillText(this.food, textPos.x, textPos.y);

        // > numbers
        const numberOffset = 0.1*sizeUnit;
        const extraY = 0.66 * fontSize;
        const positions = [
            new Point(numberOffset, numberOffset),
            new Point(size.x-numberOffset, numberOffset)
        ]

        for(const pos of positions)
        {
            ctx.fillText(this.num.toString(), pos.x, pos.y + extraY);
        }

        // > type
        const typePos = new Point(0.5*size.x, numberOffset);
        ctx.fillText(this.type, typePos.x, typePos.y + extraY);

        // desc
        const descFontSize = 0.66 * fontSize;
        const textConfig = new TextConfig({
            font: cfg.fontFamily,
            size: descFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            lineHeight: 1.1
        })

        let desc = this.desc;
        // @ts-ignore
        desc = desc.replaceAll("$", "");

        const res = new ResourceText({ text: desc, textConfig: textConfig });
        const descPos = new Point(0.5*size.x, 0.75*size.y);
        const descDims = new Point(0.9*size.x, 0.4*size.y);
        const op = new LayoutOperation({
            translate: descPos,
            dims: descDims,
            pivot: new Point(0.5),
            fill: "#000000"
        })
        await res.toCanvas(ctx, op);

        // turn the whole thing into an image
        const img = await convertCanvasToImage(ctx.canvas);
        img.classList.add("playful-example");
        return img;
    }

    getData() { return CONFIG.possibleCards[this.food]; }
    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);
        this.colorMain = COLORS[this.data.color];

        this.drawBackground();
        await this.drawMainIllustration();
        await this.drawPower();
        await this.drawMetaData();
        this.drawOutline();

        return this.getCanvas();
    }

    drawBackground()
    {
        const bgColor = CONFIG.cards.bg.color;
        fillCanvas(this.ctx, bgColor);
    }

    drawOutline()
    {
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }

    async drawMainIllustration()
    {
        // draw the random cutout background box
        const bgSize = CONFIG.cards.illustration.bgSize.clone().scaleFactor(this.sizeUnit);
        const bgCenter = this.size.clone().scaleFactor(0.5);
        const rect = new WonkyRectangle(bgCenter, bgSize);
        const rectColor = CONFIG.inkFriendly ? COLORS.grayLight : this.colorMain;
        rect.generate();
        await rect.draw(this.ctx, rectColor);

        // draw the actual image
        const res : ResourceImage = CONFIG.resLoader.getResource(this.data.textureKey);
        const spriteSize = CONFIG.cards.illustration.sizeFactor * this.sizeUnit;
        const frame = this.data.frame;
        const effects = [];
        if(CONFIG.inkFriendly) { effects.push(new GrayScaleEffect()); }
        if(CONFIG.cards.illustration.addShadow)
        {
            const rad = CONFIG.cards.illustration.shadowRadius * spriteSize;
            const offset = CONFIG.cards.illustration.shadowOffset.clone().scaleFactor(spriteSize);
            effects.push(new DropShadowEffect({ blurRadius: rad, offset: offset }));
        }

        const op = new LayoutOperation({
            frame: frame,
            translate: this.size.clone().scaleFactor(0.5),
            dims: new Point(spriteSize),
            pivot: new Point(0.5),
            effects: effects
        })
        await res.toCanvas(this.ctx, op);
    }

    async drawMetaData()
    {
        await this.drawMetaDataSingle();
        await this.drawMetaDataSingle(Math.PI);
    }

    async drawMetaDataSingle(rotation = 0)
    {
        // draw main trapezium
        let anchorX = (rotation == 0) ? 0 : this.size.x;
        let dirX = (rotation == 0) ? 1 : -1;

        const pos = new Point(anchorX, 0.5*this.size.y);
        const mainIconSize = CONFIG.cards.illustration.bgSize;
        const trapHeight = CONFIG.cards.icons.trapeziumHeight;
        const trapSize = new Point(0.5 * (1.0 - mainIconSize.x - CONFIG.cards.icons.gapToIllustration), trapHeight).scaleFactor(this.sizeUnit);
        const shrinkFactor = CONFIG.cards.icons.trapeziumShortSideShrinkFactor;
        const path = [
            new Point(pos.x, pos.y - 0.5*trapSize.y),
            new Point(pos.x + dirX * trapSize.x, pos.y - 0.5*trapSize.y*shrinkFactor),
            new Point(pos.x + dirX * trapSize.x, pos.y + 0.5*trapSize.y*shrinkFactor),
            new Point(pos.x, pos.y + 0.5*trapSize.y)
        ]
        const trapezium = new ResourceShape({ shape: new Path({ points: path }) });
        const trapHalfLine = new Point(pos.x + 0.5 * dirX * trapSize.x, pos.y);

        const angle = new Line(
            path[0], 
            new Point(pos.x + trapSize.x, pos.y - 0.5*trapSize.y*shrinkFactor)
        ).angle();

        const trapFill = CONFIG.inkFriendly ? COLORS.grayLight : this.colorMain;
        const trapOp = new LayoutOperation({
            fill: trapFill
        })
        await trapezium.toCanvas(this.ctx, trapOp);

        // draw corner rectangly-things with type icon rotated properly
        // @NOTE: this is MESSY but I see no better way for this precise shape/arrangement
        const typeColor = COLORS[TYPES[this.type].color];
        const triOp = new LayoutOperation({
            fill: typeColor
        })
        const iconEffects = [ new TintEffect({ color: CONFIG.cards.bg.color }) ];
        const gapIconToTrap = 0.01 * this.sizeUnit;
        const offsetIntoCardEdge = 0.035 * this.sizeUnit;
        const pointyEndOvershoot = 1.5;
        const iconScaleFactor = 0.45;
        for(let i = 0; i < 2; i++)
        {
            let idx = (i == 0) ? 0 : 2;
            let points = [ path[idx].clone(), path[idx+1].clone() ]
            let thirdPointMove = (i == 0) ? (points[0].y - points[1].y) : (points[1].y - points[0].y);

            // essentially, the bottom triangle winds the other way (and uses the bottom edge of trapezium)
            // which is why everything needs to be inverted
            let thirdPoint = new Point(points[1].x, points[1].y + thirdPointMove*pointyEndOvershoot);
            if(i == 1) { thirdPoint = new Point(points[0].x, points[0].y + thirdPointMove*pointyEndOvershoot); }
            
            let fourthPoint = new Point(points[0].x, thirdPoint.y - thirdPointMove*0.125);
            if(i == 1) { fourthPoint = new Point(points[1].x, thirdPoint.y - thirdPointMove*0.125); }

            if(i == 0) {
                points.push(thirdPoint);
                points.push(fourthPoint);
            } else {
                points.push(fourthPoint);
                points.push(thirdPoint);
            }

            let offsetDir = (i == 0) ? -1 : 1;
            points = movePath(points, new Point(0, offsetDir).scaleFactor(gapIconToTrap));

            let vec = points[0].clone().sub(points[1]).normalize();
            if(i == 1) { vec = points[1].clone().sub(points[0]).normalize(); }
            points = movePath(points, vec.scaleFactor(offsetIntoCardEdge));
            
            const triangle = new ResourceShape({ shape: new Path({ points: points })});
            await triangle.toCanvas(this.ctx, triOp);

            const midPoint = calculateCenter(points);
            midPoint.x = trapHalfLine.x; // to align it with trapezium stuff

            const iconDims = calculateBoundingBox(points).getSize();
            const iconSize = Math.min(iconDims.x, iconDims.y) * iconScaleFactor;

            const flipX = rotation != 0;
            const flipY = (i == 1);

            const iconFrame = TYPES[this.type].frame;
            const shouldRotate = (this.type != Type.FRUIT && this.type != Type.SPICE);
            let iconRotation = 0;
            if(shouldRotate)
            {
                iconRotation = angle;
                if(flipX && !flipY) { iconRotation *= -1; }
                if(flipY && !flipX) { iconRotation *= -1; }
            }

            const res = CONFIG.resLoader.getResource("types");
            const iconOp = new LayoutOperation({
                frame: iconFrame,
                translate: midPoint,
                dims: new Point(iconSize),
                pivot: new Point(0.5),
                flipX: flipX,
                flipY: flipY,
                rotation: iconRotation,
                effects: iconEffects
            })    
            await res.toCanvas(this.ctx, iconOp);
        }
        
        // draw number + card name
        // prepare positions (invert for rotated)
        let numberPos = new Point(trapHalfLine.x, trapHalfLine.y - dirX*0.25*trapSize.y);
        let namePos = new Point(trapHalfLine.x, trapHalfLine.y + dirX*0.1*trapSize.y);
        let positions = [numberPos, namePos];

        // draw number
        const fontSizeNumber = CONFIG.cards.icons.fontSizeNumber * this.sizeUnit;
        const textConfigNumber = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSizeNumber,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        // @NOTE: after playtest, added line below 6 and 9 to differentiate them properly
        // @TODO: Untested! (added in a rush)
        const addUnderline = (this.num == 6 || this.num == 9);
        if(addUnderline)
        {
            const translate = positions[0].clone();
            if(rotation == 0) { translate.add(new Point(0, 0.5*fontSizeNumber)); }
            else { translate.add(new Point(0, -0.5*fontSizeNumber)); }

            const rect = new Rectangle({ extents: new Point(fontSizeNumber, 0.166*fontSizeNumber) });
            const underlineRes = new ResourceShape(rect);
            const underlineOp = new LayoutOperation({
                translate: translate,
                fill: "#000000",
            })
            await underlineRes.toCanvas(this.ctx, underlineOp);
        }

        const cardNumber = new ResourceText({ text: this.num.toString(), textConfig: textConfigNumber });
        const textDims = new Point(trapSize.y, trapSize.x);
        const numOp = new LayoutOperation({
            rotation: rotation,
            translate: positions[0],
            fill: "#000000",
            pivot: new Point(0.5),
            dims: textDims,
        })
        await cardNumber.toCanvas(this.ctx, numOp);

        // draw card name
        const fontSizeName = CONFIG.cards.icons.fontSizeName * this.sizeUnit;
        const textConfigName = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSizeName,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const cardName = new ResourceText({ text: this.food, textConfig: textConfigName });
        const nameOp = new LayoutOperation({
            rotation: rotation + 0.5*Math.PI,
            translate: positions[1],
            fill: "#000000",
            pivot: new Point(0.5),
            dims: textDims
        })
        await cardName.toCanvas(this.ctx, nameOp);
    }

    async drawPower()
    {
        await this.drawPowerToCanvas();
        await this.drawPowerToCanvas(Math.PI);
    }
    
    async drawPowerToCanvas(rotation = 0)
    {
        // use my layout system to create flex container
        // (needed to easily support images inside text)
        const root = new LayoutNode({
            size: this.size.clone(),
            rotation: rotation,
        })

        // @NOTE: added after playtest that revealed text at bottom might be obscured by fingers and thus be annoying
        const anchor = CONFIG.textPlacement == "top" ? AnchorValue.TOP_LEFT : AnchorValue.BOTTOM_LEFT;

        const contHeight = 0.275*this.size.y;
        const gap = CONFIG.cards.power.gapIconAndText * this.sizeUnit;
        const padding = CONFIG.cards.power.padding * this.sizeUnit;
        const flex = new LayoutNode({
            size: new Point(this.size.x, contHeight),
            dir: FlowDir.HORIZONTAL,
            gap: gap,
            flow: FlowType.GRID,
            alignFlow: AlignValue.SPACE_EVENLY,
            alignStack: AlignValue.MIDDLE,
            anchor: anchor,
            padding: padding
        })
        root.addChild(flex);

        const iconRes = CONFIG.resLoader.getResource("misc");
        const frame = this.data.safe ? 1 : 0;
        const imgHeight = CONFIG.cards.power.iconHeight * contHeight;
        const iconEffects = [];
        if(CONFIG.inkFriendly) { iconEffects.push(new GrayScaleEffect()); }
        const icon = new LayoutNode({
            resource: iconRes,
            size: new Point(imgHeight),
            frame: frame,
            shrink: 0,
            effects: iconEffects
        })
        flex.addChild(icon);

        const textCont = new LayoutNode({
            size: new TwoAxisValue().setAuto(),
        });
        flex.addChild(textCont);

        // @TODO: optimization to just create this ONCE and re-use everywhere
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: CONFIG.cards.power.fontSize * this.sizeUnit,
            lineHeight: CONFIG.cards.power.lineHeight
        })

        const typeIconSize = CONFIG.cards.power.inlineIconHeight * textConfig.size;

        // the description is split into parts (regular text, number text, image icon)
        // so we can render each as an individual node
        const descSplit = this.desc.split("$");
        for(const str of descSplit)
        {
            const isNumber = !isNaN(parseInt(str)); // @TODO: add unique styling to numbers?
            const isImage = !isNumber;
            const isType = CONFIG.possibleTypes.includes(str);
            const isFood = Object.keys(CONFIG.possibleCards).includes(str);
            const isSafe = (str == "safe");
            const isPoisoned = (str == "poisoned"); // not sure if I want to use symbol for that, might be confusing

            let res;
            const effects = [];
            if(isType) {
                const frame = TYPES[str].frame;
                const tintCol = COLORS[TYPES[str].color];
                res = (CONFIG.resLoader.getResource("types") as ResourceImage).getImageFrameAsResource(frame);
                effects.push( new TintEffect({ color: tintCol }) );
            } else if(isFood) {
                const data = CONFIG.possibleCards[str];
                const frame = data.frame;
                res = CONFIG.resLoader.getResource(data.textureKey).getImageFrameAsResource(frame);
            } else if(isSafe) {
                res = CONFIG.resLoader.getResource("misc").getImageFrameAsResource(1);                
            } else {
                res = new ResourceText({ text: str, textConfig: textConfig });
            }

            let fill = Color.TRANSPARENT;
            let size = new TwoAxisValue(typeIconSize, typeIconSize);

            if(res instanceof ResourceText) 
            { 
                fill = Color.BLACK; 
                size = new TwoAxisValue().setAuto();
            }

            const node = new LayoutNode({
                resource: res,
                display: DisplayValue.INLINE,
                effects: effects,
                size: size,
                fill: fill
            })

            textCont.addChild(node);
        }

        await root.toCanvas(this.ctx);
    }
}