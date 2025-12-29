
import { MaterialVisualizer, ResourceGroup, Vector2, LayoutOperation, TextConfig, TextAlign, ResourceText } from "lib/pq-games";
import { ICONS } from "lib/pq-rulebook";
import { MISSION_SCALARS } from "../shared/dict";

export default class MissionRequirement
{
    icon: string;
    scalar: string;
    num: number = 1;

    constructor(i:string, s:string)
    {
        this.icon = i;
        this.scalar = s;
    }

    getGeneralID()
    {
        return this.icon + "_" + this.scalar;
    }

    getID()
    {
        return this.icon + "_" + this.scalar + "_" + Math.round(this.num);
    }

    factorNumber(f:number)
    {
        this.num = Math.min(Math.max(this.num * f, 0.25), 4.0);
    }

    getValue()
    {
        return (MISSION_SCALARS[this.scalar].value ?? 1.0) * this.num;
    }

    draw(vis:MaterialVisualizer, group:ResourceGroup, anchor:Vector2)
    {
        // draw our icon on the left
        const subGroup = new ResourceGroup();
        const resIcon = vis.getResource("icons");
        const opIcon = new LayoutOperation({
            pos: vis.get("dominoes.mission.requirements.posIcon"),
            size: vis.get("dominoes.mission.requirements.size"),
            frame: ICONS[this.icon].frame,
            pivot: Vector2.CENTER
        });
        subGroup.add(resIcon, opIcon);

        // write out the specific number of them needed on the right
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.mission.requirements.fontSize"),
            alignHorizontal: TextAlign.END,
            alignVertical: TextAlign.MIDDLE
        });
        
        let text = MISSION_SCALARS[this.scalar].desc;
        if(this.num != 1)
        {
            text = Math.round(this.num * 100) / 100.0 + " x " + text;
        }

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("dominoes.mission.requirements.posText"),
            size: new Vector2(0.75*vis.size.x, 3*textConfig.size),
            fill: "#121212",
            pivot: new Vector2(1, 0.5),
        })
        subGroup.add(resText, opText);

        const opGroup = new LayoutOperation({
            pos: anchor.clone()
        })
        group.add(subGroup, opGroup);
    }

}