import { MaterialVisualizer, createContext, fillCanvas, ResourceGroup, LayoutOperation, getRectangleCornersWithOffset, TextConfig, ResourceText, Vector2, DropShadowEffect, StrokeAlign, ResourceShape, Circle, getPositionsCenteredAround } from "lib/pq-games";
import { TEMPLATES, SPECIAL_CARDS } from "../shared/dict";

const NUMBERS_WRITTEN = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];

export default class Card
{
    color: string;
    num: number;
    key: string;
    numNotes: number;
    
    constructor(color:string, num:number, key:string = "", nn:number = 1)
    {
        this.color = color;
        this.num = num;
        this.key = key;
        this.numNotes = nn;
    }

    toString()
    {
        return "<i>" + this.num + " of " + this.color + "</i>";
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
        this.drawNumbers(vis, group);
        this.drawNotes(vis, group);
        this.drawExtra(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    isSpecialCard()
    {
        return this.key != "";
    }

    getWrittenCardType()
    {
        const number = NUMBERS_WRITTEN[this.num] ?? "Something";
        const type = TEMPLATES[this.color].written;
        return number + " of " + type;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("templates");
        const alpha = vis.inkFriendly ? 0.5 : 1.0;
        const op = new LayoutOperation({
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: TEMPLATES[this.color].frame,
            effects: vis.inkFriendlyEffect,
            alpha: alpha
        });
        group.add(res, op);
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const offset = vis.get("cards.numbers.offset");
        const textColor = vis.get("cards.numbers.textColor");
        const positions = getRectangleCornersWithOffset(vis.size, offset);

        // add the 4 numbers in the corners
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        const textDims = new Vector2(3 * textConfig.size);

        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const rot = i < 2 ? 0 : Math.PI;
            const opText = new LayoutOperation({
                pos: pos,
                rot: rot,
                size: textDims,
                fill: textColor,
                pivot: Vector2.CENTER
            })
            group.add(resText, opText);
        }

        // add the big number in the center
        const textConfigBig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numberCenter.fontSize")
        }).alignCenter();
        const resTextBig = new ResourceText({ text: this.num.toString(), textConfig: textConfigBig });
        const shadowEffect = new DropShadowEffect({ color: "#000000", blur: 0.05*textConfigBig.size });
        const opTextBig = new LayoutOperation({
            pos: vis.get("cards.numberCenter.textPos"),
            size: vis.size,
            fill: textColor,
            stroke: vis.get("cards.numberCenter.strokeColor"),
            strokeWidth: vis.get("cards.numberCenter.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Vector2.CENTER,
            effects: [shadowEffect]
        })
        group.add(resTextBig, opTextBig);

        // add the typical indicator for 6/9 difference
        if(this.num == 6 || this.num == 9)
        {
            // get center of number, then offset towards lower right (roughly)
            const circlePos = opTextBig.pos.clone().add(new Vector2(0.275*textConfigBig.size, 0.35*textConfigBig.size));
            const circleRadius = 0.0875*textConfigBig.size;
            const circle = new ResourceShape(new Circle({ center: circlePos, radius: circleRadius }));
            // black circle, match white number stroke to make sure it's visible
            const opCircle = new LayoutOperation({ fill: "#000000", stroke: "#FFFFFF", strokeWidth: opTextBig.strokeWidth, effects: [shadowEffect] });
            group.add(circle, opCircle);
        }

        // add written version of card at top and bottom
        const offsetWritten = vis.get("cards.typeWritten.offset");
        const textConfigWritten = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.typeWritten.fontSize")
        }).alignCenter();
        const resTextWritten = new ResourceText({ text: this.getWrittenCardType(), textConfig: textConfigWritten });
        const positionsWritten = [
            new Vector2(0.5*vis.size.x, 0).add(offsetWritten),
            new Vector2(0.5*vis.size.x, vis.size.y).sub(offsetWritten)
        ];
        
        for(let i = 0; i < 2; i++)
        {
            const opTextWritten = new LayoutOperation({
                pos: positionsWritten[i],
                rot: i <= 0 ? 0 : Math.PI,
                pivot: Vector2.CENTER,
                fill: "#000000",
                size: new Vector2(vis.size.x, 2*textConfigWritten.size),
                composite: "overlay"
            })
            group.add(resTextWritten, opTextWritten);
        }
    }

    drawNotes(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resNote = vis.getResource("misc");
        const noteFrame = TEMPLATES.note.frame;
        const noteSize = vis.get("cards.notes.noteSize");
        const lineOffset = vis.get("cards.notes.lineOffset");
        const positions = getPositionsCenteredAround({ 
            pos: Vector2.ZERO,
            num: this.numNotes,
            size: noteSize
        })

        // create the group of notes (randomly placed on sheet music line)
        const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blur: 0.025*noteSize.y });
        const groupNotes = new ResourceGroup();
        for(let i = 0; i < positions.length; i++)
        {
            const randYOffset = Math.floor(Math.random() * 3) * lineOffset;
            const opNote = new LayoutOperation({
                pos: positions[i].add(new Vector2(0, -randYOffset)),
                size: noteSize,
                frame: noteFrame,
                effects: [glowEffect],
                pivot: new Vector2(0.5, 1.0)
            })
            groupNotes.add(resNote, opNote);
        }

        // then use it twice on left and right
        const offsetGroup = vis.get("cards.notes.offsetGroup");
        const positionsGroups = [
            new Vector2(0, vis.center.y).add(offsetGroup),
            new Vector2(vis.size.x, vis.center.y).sub(offsetGroup)
        ]
        for(let i = 0; i < 2; i++)
        {
            const opGroup = new LayoutOperation({
                pos: positionsGroups[i],
                rot: i <= 0 ? -0.5*Math.PI : 0.5*Math.PI,
            });
            group.add(groupNotes, opGroup);
        }

    }

    drawExtra(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isSpecialCard()) { return; }

        const data = SPECIAL_CARDS[this.key];

        // add the special icon (+background) above main number
        const resBG = vis.getResource("misc");
        const opBG = new LayoutOperation({
            pos: vis.get("cards.special.iconPos"),
            size: vis.get("cards.special.iconBGDims"),
            frame: TEMPLATES.special_bg.frame,
            pivot: Vector2.CENTER
        })
        group.add(resBG, opBG);

        const resIcon = vis.getResource("special_cards");
        const opIcon = new LayoutOperation({
            pos:vis.get("cards.special.iconPos"),
            size: vis.get("cards.special.iconDims"),
            frame: data.frame,
            effects: vis.inkFriendlyEffect,
            pivot: Vector2.CENTER
        });
        group.add(resIcon, opIcon);

        // add the explanatory text below main number
        // @NOTE: we do these string shenanigans because I decided italics looked better, but only for the latter portion of the desc
        const descSplit = data.desc.split("</b>");
        const desc = descSplit.join("</b><i>") + "</i>";

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.special.fontSize"),
        }).alignCenter();
        const resText = new ResourceText({ text: desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.special.textPos"),
            size: vis.get("cards.special.textDims"),
            fill: vis.get("cards.special.textColor"),
            pivot: Vector2.CENTER
        })
        group.add(resText, opText);
    }
}