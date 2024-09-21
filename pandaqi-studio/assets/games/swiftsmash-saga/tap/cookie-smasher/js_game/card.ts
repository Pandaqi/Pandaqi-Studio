import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Line from "js/pq_games/tools/geometry/line";
import calculateBoundingBox from "js/pq_games/tools/geometry/paths/calculateBoundingBox";
import calculateCenter from "js/pq_games/tools/geometry/paths/calculateCenter";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import movePath from "js/pq_games/tools/geometry/transform/movePath";
import fromArray from "js/pq_games/tools/random/fromArray";
import { COLORS, CardData, SETS, TYPES, Type } from "../js_shared/dict";
import WonkyRectangle from "./wonkyRectangle";

export default class Card
{
    food: string;
    type: Type;
    num: number;
    desc: string;
    safe: boolean;
    didSomething: boolean; // to track if safe food actually had an influence

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

    fill(possibleTypes, possibleNumbers)
    {
        this.safe = this.data.safe;
        this.type = this.data.type;

        this.fillNumber();
        this.fillDescription(possibleTypes, possibleNumbers);
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

    fillDescription(possibleTypes, possibleNumbers)
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
            if(displayType) { val = this.getRandomType(types, possibleTypes); types.push(val); }
            else { val = this.getRandomNumber(numbers, possibleNumbers); numbers.push(val); }
            any.push(val);
            desc = desc.replace(needle, this.toDescString(val));
        }

        // replace all randomly generated types
        needle = "%type%";
        while(desc.includes(needle))
        {
            const type = this.getRandomType(types, possibleTypes);
            types.push(type);
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

    getRandomNumber(exclude = [], list)
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

    getRandomType(exclude = [], list)
    {
        const types = list.slice();
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

    async drawForRules(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, this.getColor());

        const fontSize = 0.2*vis.sizeUnit;
        const textConfigMain = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
        }).alignCenter();

        const textPos = new Point(0.5*vis.size.x, 0.5*vis.size.y + 0.33*fontSize);
        const opMain = new LayoutOperation({
            translate: textPos,
            dims: vis.size,
            fill: "#000000",
            pivot: Point.CENTER,
        });

        // > main food
        const resTextFood = new ResourceText({ text: this.food, textConfig: textConfigMain });
        resTextFood.toCanvas(ctx, opMain);

        // > numbers
        const numberOffset = 0.1*vis.sizeUnit;
        const positions = [
            new Point(numberOffset, numberOffset),
            new Point(vis.size.x-numberOffset, numberOffset)
        ]

        for(const pos of positions)
        {
            const op = new LayoutOperation({
                translate: pos,
                dims: vis.size,
                fill: "#000000",
                pivot: Point.CENTER,
            });
            const res = new ResourceText({ text: this.num.toString(), textConfig: textConfigMain });
            res.toCanvas(ctx, op);
        }

        // > type
        const typePos = new Point(0.5*vis.size.x, numberOffset);
        const opType = new LayoutOperation({
            translate: new Point(typePos.x, typePos.y),
            dims: vis.size,
            fill: "#000000",
            pivot: Point.CENTER,
        })
        const resTextType = new ResourceText({ text: this.type, textConfig: textConfigMain });
        resTextType.toCanvas(ctx, opType);

        // desc
        const descFontSize = 0.66 * fontSize;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: descFontSize,
            lineHeight: 1.1
        }).alignCenter();

        let desc = this.desc;
        desc = desc.replaceAll("$", "");

        const res = new ResourceText({ text: desc, textConfig: textConfig });
        const descPos = new Point(0.5*vis.size.x, 0.75*vis.size.y);
        const descDims = new Point(0.9*vis.size.x, 0.4*vis.size.y);
        const op = new LayoutOperation({
            translate: descPos,
            dims: descDims,
            pivot: Point.CENTER,
            fill: "#000000",
        })
        res.toCanvas(ctx, op);

        // turn the whole thing into an image
        const img = await convertCanvasToImage(ctx.canvas);
        img.classList.add("playful-example");
        return img;
    }

    getColor() { return COLORS[ this.data.color ]; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.prepareDraw();
        fillResourceGroup(vis.size, group, vis.get("cards.bg.color"));
        this.drawMainIllustration(vis, group);
        this.drawPower(vis, group);
        this.drawMetaData(vis, group);
        return await vis.finishDraw(group);
    }

    drawMainIllustration(vis:MaterialVisualizer, group: ResourceGroup)
    {
        // draw the random cutout background box
        const bgSize = vis.get("cards.illustration.bgSize").clone().scaleFactor(vis.sizeUnit);
        const bgCenter = vis.size.clone().scaleFactor(0.5);
        const rect = new WonkyRectangle(bgCenter, bgSize);
        const rectColor = vis.inkFriendly ? COLORS.grayLight : this.getColor();
        rect.generate();
        rect.draw(group, rectColor);

        // draw the actual image
        const res : ResourceImage = vis.resLoader.getResource(this.data.textureKey);
        const spriteSize = vis.get("cards.illustration.sizeFactor") * vis.sizeUnit;
        const frame = this.data.frame;
        const effects = [];
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }
        if(vis.get("cards.illustration.addShadow"))
        {
            const rad = vis.get("cards.illustration.shadowRadius") * spriteSize;
            const offset = vis.get("cards.illustration.shadowOffset").clone().scaleFactor(spriteSize);
            effects.push(new DropShadowEffect({ blurRadius: rad, offset: offset }));
        }

        const op = new LayoutOperation({
            frame: frame,
            translate: vis.size.clone().scaleFactor(0.5),
            dims: new Point(spriteSize),
            pivot: new Point(0.5),
            effects: effects
        })
        group.add(res, op);
    }

    drawMetaData(vis:MaterialVisualizer, group: ResourceGroup)
    {
        this.drawMetaDataSingle(vis, group);
        this.drawMetaDataSingle(vis, group, Math.PI);
    }

    drawMetaDataSingle(vis:MaterialVisualizer, group: ResourceGroup, rotation = 0)
    {
        // draw main trapezium
        let anchorX = (rotation == 0) ? 0 : vis.size.x;
        let dirX = (rotation == 0) ? 1 : -1;

        const pos = new Point(anchorX, 0.5*vis.size.y);
        const mainIconSize = vis.get("cards.illustration.bgSize");
        const trapHeight = vis.get("cards.icons.trapeziumHeight");
        const trapSize = new Point(0.5 * (1.0 - mainIconSize.x - vis.get("cards.icons.gapToIllustration")), trapHeight).scaleFactor(vis.sizeUnit);
        const shrinkFactor = vis.get("cards.icons.trapeziumShortSideShrinkFactor");
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

        const trapFill = vis.inkFriendly ? COLORS.grayLight : this.getColor();
        const trapOp = new LayoutOperation({
            fill: trapFill
        })
        group.add(trapezium, trapOp);

        // draw corner rectangly-things with type icon rotated properly
        // @NOTE: this is MESSY but I see no better way for this precise shape/arrangement
        const typeColor = COLORS[TYPES[this.type].color];
        const triOp = new LayoutOperation({
            fill: typeColor
        })
        const iconEffects = [ new TintEffect({ color: vis.get("cards.bg.color") }) ];
        const gapIconToTrap = 0.01 * vis.sizeUnit;
        const offsetIntoCardEdge = 0.035 * vis.sizeUnit;
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
            group.add(triangle, triOp);

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

            const res = vis.resLoader.getResource("types");
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
            group.add(res, iconOp);
        }
        
        // draw number + card name
        // prepare positions (invert for rotated)
        let numberPos = new Point(trapHalfLine.x, trapHalfLine.y - dirX*0.25*trapSize.y);
        let namePos = new Point(trapHalfLine.x, trapHalfLine.y + dirX*0.1*trapSize.y);
        let positions = [numberPos, namePos];

        // draw number
        const fontSizeNumber = vis.get("cards.icons.fontSizeNumber") * vis.sizeUnit;
        const textConfigNumber = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSizeNumber,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        // @NOTE: after playtest, added line below 6 and 9 to differentiate them properly
        const addUnderline = (this.num == 6 || this.num == 9);
        if(addUnderline)
        {
            const translate = positions[0].clone();
            if(rotation == 0) { translate.add(new Point(0, 0.5*fontSizeNumber)); }
            else { translate.add(new Point(0, -0.5*fontSizeNumber)); }

            const rect = new Rectangle({ extents: new Point(0.8*fontSizeNumber, 0.12*fontSizeNumber) });
            const underlineRes = new ResourceShape(rect);
            const underlineOp = new LayoutOperation({
                translate: translate,
                fill: "#000000",
            })
            group.add(underlineRes, underlineOp);
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
        group.add(cardNumber, numOp);

        // draw card name
        const fontSizeName = vis.get("cards.icons.fontSizeName") * vis.sizeUnit;
        const textConfigName = new TextConfig({
            font: vis.get("fonts.heading"),
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
        group.add(cardName, nameOp);
    }

    drawPower(vis:MaterialVisualizer, group: ResourceGroup)
    {
        this.drawPowerToCanvas(vis, group, 0);
        this.drawPowerToCanvas(vis, group, 1);
    }
    
    drawPowerToCanvas(vis:MaterialVisualizer, group: ResourceGroup, id = 0)
    {
        const anchorOffset = 0.125*vis.size.y;
        const rotation = id == 0 ? 0 : Math.PI;
        const positions = [
            new Point(vis.center.x, anchorOffset),
            new Point(vis.center.x, vis.size.y - anchorOffset)
        ];

        // @NOTE: added after playtest that revealed text at bottom might be obscured by fingers and thus be annoying
        if(vis.get("textPlacement") == "bottom")
        {
            id = (id + 1) % 2;
        }

        // prepare a sub container (and already add it)
        const subGroup = new ResourceGroup();
        const subGroupOp = new LayoutOperation({
            translate: positions[id],
            rotation: rotation,
            pivot: Point.CENTER
        });
        group.add(subGroup, subGroupOp);

        // draw the main icon (dangerous/safe)
        const contHeight = 0.275*vis.size.y;
        const iconRes = vis.resLoader.getResource("misc");
        const frame = this.data.safe ? 1 : 0;
        const imgHeight = vis.get("cards.power.iconHeight") * contHeight;
        const iconOp = new LayoutOperation({
            translate: new Point(-0.66*vis.center.x, 0), // all of this is centered around (0,0) middle of subGroup
            dims: new Point(imgHeight),
            frame: frame,
            effects: vis.inkFriendlyEffect,
            pivot: Point.CENTER
        })
        subGroup.add(iconRes, iconOp);

        // draw the explanatory text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.power.fontSize") * vis.sizeUnit,
            lineHeight: vis.get("cards.power.lineHeight"),
            resLoader: vis.resLoader
        }).alignCenter();

        const textOp = new LayoutOperation({
            translate: new Point(0.25*vis.center.x, 0),
            dims: new Point(0.66*vis.size.x, 2*contHeight),
            fill: "#000000",
            pivot: Point.CENTER
        });

        // fill the images in the text with their actual icons
        // @NOTE: The things that need to be set dynamically are "%x%" => once we know their final value, they're saved as "$x$", so the string we're workin with now should ONLY have dollar signs with definite values inside
        const descSplit = this.desc.split("$");
        const descOutput = [];
        for(let str of descSplit)
        {
            const isType = vis.get("possibleTypes").includes(str);
            const isFood = vis.get("possibleCards").includes(str);
            const isSafe = (str == "safe");
            
            if(isType) {
                const frame = TYPES[str].frame;
                str = '<img id="types_tinted" frame="' + frame + '">';
                // I decided to just bake the tint into the icons, cheaper and simpler
                //const tintCol = COLORS[TYPES[str].color];
                //effects.push( new TintEffect({ color: tintCol }) );
            } else if(isFood) {
                const data = this.getDataForFood(str);
                str = '<img id="' + data.textureKey + '" frame="'+ data.frame + '">';
            } else if(isSafe) {
                str = '<img id="misc" frame="1">';
            }

            descOutput.push(str);
        }

        const textFinal = descOutput.join("");
        const resText = new ResourceText({ text: textFinal, textConfig: textConfig });
        subGroup.add(resText, textOp);
    }

    // @NOTE: bit inefficient, but it's fine for the ~5 lookups (max) we'll get
    getDataForFood(keyTarget:string)
    {
        for(const [set, setData] of Object.entries(SETS))
        {  
            for(const [key,data] of Object.entries(setData))
            {
                if(key == keyTarget)
                {
                    return data;
                }
            }
        }
    }
}