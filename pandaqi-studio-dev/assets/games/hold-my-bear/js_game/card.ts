import createContext from "js/pq_games/layout/canvas/createContext";
import { ANIMALS, AnimalData } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import ColorLike from "js/pq_games/layout/color/colorLike";

export default class Card
{
    type: string;
    num: number;
    data: AnimalData;
    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;

    constructor(tp:string, num:number)
    {
        this.type = tp;
        this.num = num;
        this.data = ANIMALS[this.type];
    }

    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);

        await this.drawBackground();
        await this.drawMainIllustration();
        await this.drawCornerIcons();
        await this.drawSpecialPower();
        
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);

        return this.getCanvas();
    }

    async drawBackground()
    {
        const bgColor = CONFIG.inkFriendly ? "#FFFFFF" : this.data.color;
        fillCanvas(this.ctx, bgColor);

        // @TODO: plaster random watercolor stuff on top to create shadow and background for main illustration
    }

    async drawMainIllustration()
    {
        let key = "animal_icons";
        if(this.data.expansion) { key += "_expansion"; }

        const res : ResourceImage = CONFIG.resLoader.getResource(key);
        const spriteSize = CONFIG.cards.illustration.sizeFactor * this.sizeUnit;
        const frame = this.data.frame;
        const effects = [];
        if(CONFIG.inkFriendly)
        {
            effects.push(new GrayScaleEffect());
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

    async drawCornerIcons()
    {
        const baseOffset = CONFIG.cards.icons.offset.clone();
        const offset = baseOffset.scaleFactor(this.sizeUnit);
        const positions = [
            offset.clone(), // first one is top left corner
            new Point(this.size.x-offset.x, offset.y),
            new Point(this.size.x-offset.x, this.size.y-offset.y),
            new Point(offset.x, this.size.y-offset.y)
        ]

        let spriteKey = "type_icons";
        if(this.data.expansion) { spriteKey += "_expansion"; }

        const textColor = "#FFFFFF"; // @TODO: hardcode? automatic contrast calculation?
        const fontSize = CONFIG.cards.icons.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const iconSize = CONFIG.cards.icons.scaleFactor * this.sizeUnit;
        const effects = [];
        if(CONFIG.inkFriendly)
        {
            effects.push(new GrayScaleEffect());
        }

        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const displayNumber = i % 2 == 1;
            const displayIcon = !displayNumber;
            
            const op = new LayoutOperation({
                pivot: new Point(0.5),
                translate: pos,
                dims: new Point(iconSize),
                effects: effects,
            })

            // @TODO: no matter what it is, there needs to be some watercolor decoration behind it

            let res
            if(displayNumber)
            {
                res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
                op.fill = new ColorLike(textColor);
            }

            if(displayIcon)
            {
                res = CONFIG.resLoader.getResource(spriteKey);
            }

            res.toCanvas(this.ctx, op);
        }
    }

    async drawSpecialPower()
    {
        const power = this.data.power;
        if(!power) { return; }

        // @TODO: print power text (using CONFIG.fonts.body) + some vague-watercolor-y background to make it legible
    }
}