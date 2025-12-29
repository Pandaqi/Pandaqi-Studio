
import { MaterialVisualizer, createContext, fillCanvas, ResourceGroup, DropShadowEffect, fillResourceGroup, LayoutOperation, fromArray, TextConfig, ResourceText, Vector2, getPositionsCenteredAround } from "lib/pq-games";
import { CARD_TEMPLATES, CardType, MEDICINE, PATIENTS } from "../shared/dict";

export default class Card
{
    type:CardType
    key: string;
    num: number;
    numWildcard: boolean;
    requirements: string[];
    special: string;

    constructor(type:CardType, key:string = "")
    {
        this.type = type;
        this.key = key;
    }

    setNumber(n:number) { this.num = n; }
    getNumber(useReqs = false) 
    { 
        if(useReqs) { return (this.num ?? this.requirements.length) ?? 0; }
        return this.num ?? 0; 
    }
    setNumberWildcard(val = true) { this.numWildcard = val; }
    setRequirements(reqs:string[]) { this.requirements = reqs; }
    setSpecial(s:string) { this.special = s; }

    toRulesString()
    {
        if(this.type == CardType.MEDICINE) { return "MEDICINE (" + this.num + ")"; }
        if(this.type == CardType.SPECIAL) { return "SPECIAL (" + this.special + ")"; }
        if(this.type == CardType.PATIENT) 
        { 
            const reqsSorted = this.requirements.slice().sort((a,b) => a.localeCompare(b));
            return "PATIENT (" + this.num + " / " + reqsSorted.join(", ") + ")"; 
        }
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

        if(!vis.custom || !vis.custom.dropShadowEffect)
        {
            const shadowOffset = vis.get("cards.shared.shadowOffset");
            const shadowBlur = vis.get("cards.shared.shadowBlur");
            const shadowColor = vis.get("cards.shared.shadowColor");
            vis.custom = { dropShadowEffect: [new DropShadowEffect({ offset: shadowOffset, blurRadius: shadowBlur, color: shadowColor })] };
        }

        this.drawBackground(vis, group);
        this.drawMedicine(vis, group);
        this.drawPatient(vis, group);
        this.drawSpecial(vis, group);
        this.drawNumber(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = CARD_TEMPLATES[this.type];
        const resTemplate = vis.getResource("card_templates");

        // solid background color
        let col = data.bgColor;
        if(this.type == CardType.MEDICINE) { col = MEDICINE[this.key].bgColor; }
        if(vis.inkFriendly) { col = "#FFFFFF"; }
        fillResourceGroup(vis.size, group, col);

        // the halftone/duotone texture
        if(!vis.inkFriendly)
        {
            const options = ["bg_1", "bg_2"];
            const composite = data.invertTexture ? "source-over" : "multiply";
            const alpha = data.invertTexture ? 0.2 : 0.2;

            const opTexture = new LayoutOperation({
                pivot: Vector2.ZERO,
                size: vis.size,
                frame: CARD_TEMPLATES[fromArray(options)].frame,
                composite: composite,
                alpha: alpha
            })
            group.add(resTemplate, opTexture);
        }

        // the actual card template on top
        const opTemplate = new LayoutOperation({
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: data.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resTemplate, opTemplate);
    }

    drawNumber(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.number.fontSize")
        }).alignCenter();

        let col = (this.type != CardType.MEDICINE) ? vis.get("cards.number.defColor") : MEDICINE[this.key].textColor;
        if(vis.inkFriendly) { col = "#000000"; }

        const str = this.numWildcard ? "?" : this.num.toString();
        const resText = new ResourceText({ text: str, textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.number.pos"),
            size: vis.size,
            fill: col,
            pivot: Vector2.CENTER,
            effects: vis.custom.dropShadowEffect
        })
        group.add(resText, opText);
    }

    drawMedicine(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != CardType.MEDICINE) { return; }

        const resIcon = vis.getResource("medicine");
        const opIcon = new LayoutOperation({
            pos: vis.get("cards.medicine.pos"),
            size: vis.get("cards.medicine.iconDims"),
            frame: MEDICINE[this.key].frame,
            effects: vis.custom.dropShadowEffect,
            pivot: Vector2.CENTER
        })
        group.add(resIcon, opIcon);
    }

    drawPatient(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != CardType.PATIENT) { return; }

        // split the icons into neatly centered rows (of max 3 columns)
        const resIcon = vis.getResource("medicine");
        const iconDims = vis.get("cards.patient.iconDims");
        const anchor = vis.get("cards.patient.posAnchor");

        const reqsSorted = this.requirements.slice();
        reqsSorted.sort((a,b) => { return a.localeCompare(b) });

        let reqsRows = [];
        if(reqsSorted.length <= 3) { reqsRows = [reqsSorted]; }
        if(reqsSorted.length == 4) { reqsRows = [reqsSorted.slice(0,2), reqsSorted.slice(2,4)]; }
        if(reqsSorted.length > 4) { reqsRows = [reqsSorted.slice(0,3), reqsSorted.slice(3)]; }

        let anchorPositions = [];
        if(reqsRows.length == 1) { anchorPositions = [anchor]; }
        if(reqsRows.length == 2) {
            anchorPositions = [
                anchor.clone().sub(new Vector2(0, 0.5*iconDims.y)),
                anchor.clone().add(new Vector2(0, 0.5*iconDims.y))
            ]
        }

        // display that distribution
        for(let i = 0; i < reqsRows.length; i++)
        {
            const reqsRow = reqsRows[i];
            const anchorPos = anchorPositions[i];
            const numIconsInRow = reqsRow.length;

            const iconPositions = getPositionsCenteredAround({ 
                pos: anchorPos, 
                num: numIconsInRow, 
                size: iconDims 
            })

            for(let a = 0; a < numIconsInRow; a++)
            {
                const pos = iconPositions[a];
                const req = reqsRow[a];
                const opIcon = new LayoutOperation({
                    pos: pos,
                    size: iconDims,
                    frame: MEDICINE[req].frame,
                    effects: vis.custom.dropShadowEffect,
                    pivot: Vector2.CENTER
                })
                group.add(resIcon, opIcon);
            }
        }

        // display a small circle with the (animal) "patient" for decorative purposes
        const resPatients = vis.getResource("patients");
        const frame = PATIENTS.patient_circle.frame;
        const posPatient = vis.get("cards.patient.illustration.pos");
        const opPatientCircle = new LayoutOperation({
            pos: posPatient,
            size: vis.get("cards.patient.illustration.sizeCircle"),
            frame: frame,
            pivot: Vector2.CENTER,
            effects: vis.custom.dropShadowEffect
        })
        group.add(resPatients, opPatientCircle);

        const opPatient = new LayoutOperation({
            pos: posPatient,
            size: vis.get("cards.patient.illustration.sizeIcon"),
            frame: PATIENTS[this.key].frame,
            pivot: Vector2.CENTER,
        })
        group.add(resPatients, opPatient);
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != CardType.SPECIAL) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.special.fontSize")
        }).alignCenter();

        const resText = new ResourceText({ text: this.special, textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.special.textBoxPos"),
            size: vis.get("cards.special.textBoxDims"),
            fill: vis.get("cards.special.textColor"),
            pivot: Vector2.CENTER
        })
        group.add(resText, opText);
    }
}