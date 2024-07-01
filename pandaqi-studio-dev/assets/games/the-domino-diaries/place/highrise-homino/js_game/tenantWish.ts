import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import CONFIG from "../js_shared/config";
import { COLORS, FloorType, GeneralData, MISC, OBJECTS, TENANTS, UtilityType, WISHES, WishType } from "../js_shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import Circle from "js/pq_games/tools/geometry/circle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";

export default class TenantWish
{
    type: WishType
    key:string
    subKey:string
    num:number
    invert:boolean;

    constructor(t:WishType, k:string, num:number = 1, invert:boolean = false)
    {
        this.type = t;
        this.key = k;
        this.num = num;
        this.invert = invert;
    }

    getData() : GeneralData
    {
        if(this.type == WishType.OBJECT) { return OBJECTS[this.key]; }
        else if(this.type == WishType.SPECIAL) { return WISHES[this.key]; }
    }

    getScore()
    {
        const rawVal = 1.0 / (this.getData().prob ?? 1.0);
        let mult = CONFIG.generation.score.wishMultiplier ?? 1.0;
        if(this.invert) { mult *= CONFIG.generation.score.wishInverseMultiplier ?? 1.0; }

        return rawVal * mult * Math.sqrt(this.num);
    }

    setSubKey(k:string)
    {
        this.subKey = k;
    }

    needsSubKey()
    {
        return this.getData().subKey;
    }

    draw(vis:MaterialVisualizer, dims:Point) : ResourceGroup
    {
        const group = new ResourceGroup();

        let resourceKey = "", frame = -1;

        // a background circle for readability
        // (baked-in icons already have this circle; this is for the dynamic icons that would otherwise just be a floating icon)
        // (it also neatly clips anything that is too square, such as the floor type icons)
        const circ = new Circle({ radius: Math.min(dims.x, dims.y) });
        const bgColor = COLORS[this.getData().color].light ?? "#EEEEEE";
        const circOp = new LayoutOperation({ fill: bgColor });
        group.add(new ResourceShape(circ), circOp);

        // decide the main icon
        if(this.type == WishType.OBJECT)
        {
            resourceKey = "objects";
            frame = this.getData().frame;
        }

        if(this.type == WishType.SPECIAL)
        {
            resourceKey = "wishes";
            frame = this.getData().frame;

            // @EXCEPTIONS: these wishes need to pick some further icon or detail, instead of just using a default icon from spritesheet
            if(this.key == "floor_type")
            {
                resourceKey = "misc";
                frame = MISC["floor_" + this.subKey].frame
            }

            if(this.key == "utilities")
            {
                resourceKey = "misc";
                frame = MISC["utility_" + this.subKey].frame;
            }

            if(this.key == "tenant")
            {
                resourceKey = "tenants";
                frame = TENANTS[this.subKey].frame;
            }
        }

        const resMain = vis.getResource(resourceKey);
        const opMain = new LayoutOperation({
            dims: dims,
            pivot: Point.CENTER,
            frame: frame,
            clip: circ
        });
        group.add(resMain, opMain);

        // if number matters (it's not the basic "1 of these"), add it on top
        if(this.num > 1)
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("dominoes.wishes.number.fontSize"),
            }).alignCenter();
    
            const resText = new ResourceText({ text: this.num.toString(), textConfig });
            const opText = new LayoutOperation({
                translate: vis.get("dominoes.wishes.number.pos"), 
                dims: dims,
                pivot: Point.CENTER,
                fill: vis.get("dominoes.wishes.number.textColor"),
                stroke: vis.get("dominoes.wishes.number.strokeColor"),
                strokeWidth: vis.get("dominoes.wishes.number.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE
            });
            group.add(resText, opText);
        }

        // if inverted, add cross over it
        if(this.invert)
        {
            const resMisc = vis.getResource("misc");
            const opInvert = new LayoutOperation({
                dims: dims.clone().scale(1.33),
                pivot: Point.CENTER,
                frame: MISC.invert_cross.frame
            })
            group.add(resMisc, opInvert);
        }

        return group;
    }
}