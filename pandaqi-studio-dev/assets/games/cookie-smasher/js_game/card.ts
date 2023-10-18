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

export default class Card
{
    food: string;
    type: Type;
    num: number;
    desc: string;
    safe: boolean;

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
        this.type = this.data.type; // bit confusing, but it is what it is

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
            const val = vals.randomInteger();
            numbers.push(val);
            desc = desc.replace(match[0], val);
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

    flipPoisoned() 
    {
        if(this.data.safe) { return; } // safe cards are NEVER poisoned
        this.poisoned = !this.poisoned; 
    }

    changeNum(dn:number)
    {
        // @TODO: certain situations in which this isn't allowed?
        this.num += dn;
    }

    getRandomNumber(exclude = [])
    {
        let num = CONFIG.possibleNumbers.slice();
        for(const elem of exclude)
        {
            const idx = num.indexOf(elem);
            if(idx < 0) { continue; }
            num.splice(idx, 1);
        }
        return fromArray(num);
    }

    getRandomType(exclude = [])
    {
        const types = CONFIG.possibleTypes.slice();
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
        const positions = [
            new Point(numberOffset, textPos.y),
            new Point(size.x-numberOffset, textPos.y)
        ]

        for(const pos of positions)
        {
            ctx.fillText(this.num.toString(), pos.x, pos.y);
        }

        // desc
        const descFontSize = 0.66 * fontSize;
        const textConfig = new TextConfig({
            font: cfg.fontFamily,
            size: descFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            lineHeight: 1.1
        })

        const res = new ResourceText({ text: this.desc, textConfig: textConfig });
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
        await this.drawMetaData();
        await this.drawPower();
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
        rect.generate();
        await rect.draw(this.ctx, this.colorMain);

        // draw the actual image
        const res : ResourceImage = CONFIG.resLoader.getResource(this.data.textureKey);
        const spriteSize = CONFIG.cards.illustration.sizeFactor * this.sizeUnit;
        const frame = this.data.frame;
        const effects = [];
        if(CONFIG.inkFriendly) { effects.push(new GrayScaleEffect()); }
        if(CONFIG.cards.illustration.addShadow)
        {
            const rad = CONFIG.cards.illustration.shadowRadius * spriteSize;
            const offset = CONFIG.cards.illustration.shadowOffset.scaleFactor(spriteSize);
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
        // @TODO: through all this, take rotation/side into account
        // @TODO: draw main trapezium
        
        // @TODO: draw corner rectangle (color of type) + type icon (color of background) + repeat for top and bottom

        // @TODO: draw number (if not safe, body font) + card name (in heading font)
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

        const gap = CONFIG.cards.power.gapIconAndText * this.sizeUnit;
        const flex = new LayoutNode({
            size: new TwoAxisValue().setFullSize(),
            dir: FlowDir.VERTICAL,
            gap: gap,
            flow: FlowType.GRID
        })
        root.addChild(flex);

        const iconRes = CONFIG.resLoader.getResource("misc");
        const frame = this.data.safe ? 1 : 0;
        const icon = new LayoutNode({
            resource: iconRes,
            frame: frame,
        })
        flex.addChild(icon);

        const textCont = new LayoutNode({
            size: new TwoAxisValue().setFullSize()
        });
        flex.addChild(textCont);

        // @TODO: optimization to just create this ONCE and re-use everywhere
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: CONFIG.cards.power.fontSize * this.sizeUnit,
        })

        // the description is split into parts (regular text, number text, image icon)
        // so we can render each as an individual node
        const descSplit = this.desc.split("$");
        for(const str of descSplit)
        {
            const isNumber = !isNaN(parseInt(str)); // @TODO: add unique styling to numbers?
            const isType = CONFIG.possibleTypes.includes(str);

            let res;
            const effects = [];
            if(isType) {
                const frame = TYPES[str].frame;
                const tintCol = COLORS[TYPES[str].color];
                res = (CONFIG.resLoader.getResource("types") as ResourceImage).getImageFrameAsResource(frame);
                effects.push( new TintEffect({ color: tintCol }) );
            } else {
                res = new ResourceText({ text: str, textConfig: textConfig });
            }

            const node = new LayoutNode({
                resource: res,
                display: DisplayValue.INLINE,
                effects: effects
            })
            textCont.addChild(node);
        }

        await root.toCanvas(this.ctx);
    }
}