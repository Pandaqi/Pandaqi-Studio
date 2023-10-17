import createContext from "js/pq_games/layout/canvas/createContext";
import { COLORS, TYPES } from "../js_shared/dict";
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
import TextConfig from "js/pq_games/layout/text/textConfig";
import DisplayValue from "js/pq_games/layout/values/displayValue";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import subdividePath from "js/pq_games/tools/geometry/paths/subdividePath";
import WonkyRectangle from "./wonkyRectangle";

export default class Card
{
    type: string;
    num: number;
    desc: string;

    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;
    colorMain: string;

    constructor(tp:string)
    {
        this.type = tp;
    }

    fill()
    {
        this.fillNumber();
        this.fillDescription();
    }

    fillNumber()
    {
        const data = this.getData();

        let num = data.num;
        if(num <= 0 && data.numRange) 
        {
            num = data.numRange.randomInteger();
        }

        this.num = num;
    }

    fillDescription()
    {
        let desc = this.getData().desc;
        const types = [];
        const numbers = [];

        // replace any's
        let needle = "%any%"
        while(desc.includes(needle))
        {
            const displayType = Math.random() <= 0.5;
            let val;
            if(displayType) { val = this.getRandomType(types); types.push(val); }
            else { val = this.getRandomNumber(numbers); numbers.push(val); }
            desc.replace(needle, this.toDescString(val));
        }

        // replace all randomly generated types
        needle = "%type%";
        while(desc.includes(needle))
        {
            const type = this.getRandomType(types);
            types.push(type);
            //const typeString = ; => replace string by image of icon, or is that done during draw?
            desc.replace(needle, this.toDescString(type));
        }

        // replace custom keys
        // @TODO: this surely needs testing
        const regex = /\%(.+?)\%/g;
        let match;
        do 
        {
            match = regex.exec(desc);
            if(!match) { break; }

            const vals = this.getData()[match];
            const val = vals.randomInteger();
            desc.replace(match, val);
        } while (match);

        this.desc = desc;
    }

    toDescString(input:any)
    {
        return "$" + input.toString() + "$";
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

    getData() { return CONFIG.possibleCards[this.type]; }
    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);
        this.colorMain = COLORS[this.getData().color];

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
        const res : ResourceImage = CONFIG.resLoader.getResource(this.getData().textureKey);
        const spriteSize = CONFIG.cards.illustration.sizeFactor * this.sizeUnit;
        const frame = this.getData().frame;
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
        const frame = this.getData().safe ? 1 : 0;
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