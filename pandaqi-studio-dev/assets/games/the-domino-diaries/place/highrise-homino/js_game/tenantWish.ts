import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import { GeneralData, MISC, OBJECTS, TENANTS, WISHES, WishType } from "../js_shared/dict";

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

    getKeyID()
    {
        let str = this.key;
        if(this.subKey) { return str + "_" + this.subKey; }
        return str;
    }

    getScore()
    {
        let rawVal = 1.0 / (this.getData().prob ?? 1.0);
        if(this.getData().scoreVal) { rawVal = this.getData().scoreVal; }

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

    changeNumber(n:number)
    {
        this.num = Math.max(Math.min(this.num + n, CONFIG.generation.maxWishNumber), 1);
    }

    draw(vis:MaterialVisualizer, size:Point) : ResourceGroup
    {
        const group = new ResourceGroup();

        let resourceKey = "", frame = -1;

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

            if(this.key == "tenants")
            {
                resourceKey = "tenants";
                frame = TENANTS[this.subKey].frame;
            }

            if(this.key == "num_windows")
            {
                resourceKey = "misc";
                frame = MISC.wall_window.frame;
            }
        }

        const resMain = vis.getResource(resourceKey);
        const eff = new DropShadowEffect({ color: "#000000", blurRadius: 0.025*size.x });
        const opMain = new LayoutOperation({
            size: size,
            pivot: Point.CENTER,
            effects: [eff, vis.inkFriendlyEffect].flat(),
            frame: frame,
        });
        group.add(resMain, opMain);

        // if number matters (it's not the basic "1 of these"), add it on top
        if(this.num > 1)
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("dominoes.tenant.wishes.number.fontSize"),
            }).alignCenter();
    
            const resText = new ResourceText({ text: this.num.toString(), textConfig });
            const opText = new LayoutOperation({
                pos: vis.get("dominoes.tenant.wishes.number.pos"), 
                size: size,
                pivot: Point.CENTER,
                fill: vis.get("dominoes.tenant.wishes.number.textColor"),
                stroke: vis.get("dominoes.tenant.wishes.number.strokeColor"),
                strokeWidth: vis.get("dominoes.tenant.wishes.number.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE
            });
            group.add(resText, opText);
        }

        // if inverted, add cross over it
        if(this.invert)
        {
            const resMisc = vis.getResource("misc");
            const opInvert = new LayoutOperation({
                size: size.clone().scale(1.33),
                pivot: Point.CENTER,
                frame: MISC.invert_cross.frame
            })
            group.add(resMisc, opInvert);
        }

        return group;
    }
}