
import { MaterialVisualizer, createContext, ResourceGroup, LayoutOperation, Vector2, TextConfig, DropShadowEffect, ResourceText, StrokeAlign, TextStyle, getPositionsCenteredAround } from "lib/pq-games";
import { CARD_TEMPLATES, CardSubType, CardType, ICONS, LawDataRaw, MISC, SideDetails } from "../shared/dict";

export default class Card
{
    type: CardType;
    subType: CardSubType;
    num: number = -1;
    voteStorage:number = -1;
    sides: SideDetails;
    law: string = "";
    lawDataRaw:LawDataRaw;

    constructor(t:CardType, s:CardSubType)
    {
        this.type = t;
        this.subType = s;
    }

    setLaw(obj: { resultString: string, rawData: LawDataRaw }) 
    { 
        this.law = obj.resultString; 
        this.lawDataRaw = obj.rawData; 
    }
    
    hasLaw() { return this.law != ""; }
    getLawData() { return this.lawDataRaw; }

    setVoteStorage(n:number) { this.voteStorage = n; }
    setSides(s: SideDetails) { this.sides = s; }
    hasSideDetails() { return this.sides != undefined; }

    setNumber(n:number) { this.num = n; }
    hasNumber() { this.num != -1; }
    isVote() { return this.type == CardType.VOTE; }
    isDecree() { return this.type == CardType.DECREE; }

    getSideIfFlipped(flipped = false)
    {
        if(!this.sides) { return []; }

        let details = this.sides.goodIcons ?? this.sides.goodText;
        if(flipped) { details = this.sides.badIcons ?? this.sides.badText; }
        details = Array.isArray(details) ? details.slice() : details;
        return details;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawVoteDetails(vis, group);
        this.drawGoodBadSides(vis, group);
        this.drawLawText(vis, group);
        this.drawVoteStorage(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("card_templates");
        const key = this.type + "_" + this.subType;
        const frame = CARD_TEMPLATES[key].frame;
        const op = new LayoutOperation({
            pos: Vector2.ZERO,
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    drawVoteDetails(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isVote()) { return; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("votes.number.fontSize"),
        }).alignCenter();

        const textColor = vis.inkFriendly ? "#000000" : vis.get("votes.number.textColors." + this.subType);
        const strokeColor = vis.inkFriendly ? "#FFFFFF" : vis.get("votes.number.colorStroke");
        const pos = vis.get("votes.number.pos");
        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});

        const str = this.num.toString();
        const resText = new ResourceText({ text: str, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: pos,
            size: vis.size,
            fill: textColor,
            stroke: strokeColor,
            strokeWidth: vis.get("votes.number.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Vector2.CENTER,
            effects: [dropShadowEffect]
        });
        group.add(resText, opText);

    }

    drawGoodBadSides(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isDecree()) { return; }
        if(!this.hasSideDetails()) { return; }

        const resMisc = vis.getResource("misc");

        const offsetY = vis.get("cards.sides.offset").y;
        const anchors = [
            new Vector2(vis.center.x, offsetY),
            new Vector2(vis.center.x, vis.size.y - offsetY)
        ];

        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});
        const iconEffects = [dropShadowEffect, vis.inkFriendlyEffect].flat();

        const dropShadowEffectSubtle = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius") * 0.33 });
        const defImgOp = new LayoutOperation({ effects: [dropShadowEffectSubtle] }); 
        

        const textBoxDims = vis.get("cards.sides.textBoxDims");
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.sides.fontSize"),
            style: TextStyle.ITALIC,
            resLoader: vis.resLoader,
            defaultImageOperation: defImgOp
        }).alignCenter();

        const iconDims = vis.get("cards.sides.iconDims");
        const sides = ["good", "bad"];
       
        for(let s = 0; s < 2; s++)
        {
            const side = sides[s];
            const data = this.sides[side+"Icons"] ?? this.sides[side+"Text"];
            
            const isIcons = Array.isArray(data);
            const isText = !isIcons;

            const rot = s == 0 ? 0 : Math.PI;
            const anchor = anchors[s];

            if(isText) 
            {
                const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.sides.textColors." + side);

                const resText = new ResourceText({ text: data, textConfig: textConfig });
                const opText = new LayoutOperation({
                    pos: anchor,
                    size: textBoxDims,
                    rot: rot,
                    pivot: Vector2.CENTER,
                    fill: textColor,
                })
                group.add(resText, opText);
            } 

            if(isIcons)
            {
                const positions = getPositionsCenteredAround({ 
                    pos: anchor, 
                    num: data.length,
                    size: iconDims.clone().scale(1.05)
                });

                for(let i = 0; i < positions.length; i++)
                {
                    const posTemp = positions[i];
                    const dataTemp = data[i] == "support" ? MISC.support : ICONS[data[i]];
                    const opIcon = new LayoutOperation({
                        pos: posTemp,
                        size: iconDims,
                        rot: rot,
                        pivot: Vector2.CENTER,
                        frame: dataTemp.frame,
                        effects: iconEffects
                    })
                    group.add(resMisc, opIcon)
                }
            }

        }
    }

    drawLawText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isDecree()) { return; }
        if(!this.hasLaw()) { return; }

        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius") * 0.45 });
        const defImgOp = new LayoutOperation({ effects: [dropShadowEffect] }); // @NOTE; adds shadow behind only the images/icons in text, not entire text block

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.laws.fontSize"),
            style: TextStyle.ITALIC,
            resLoader: vis.resLoader,
            defaultImageOperation: defImgOp
        }).alignCenter();

        const str = this.law;
        const resText = new ResourceText({ text: str, textConfig: textConfig });

        const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.laws.textColor");
        const opText = new LayoutOperation({
            pos: vis.get("cards.laws.pos"),
            size: vis.get("cards.laws.textBoxDims"),
            fill: textColor,
            pivot: Vector2.CENTER
        })

        group.add(resText, opText);
    }

    drawVoteStorage(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isDecree()) { return; }
        if(this.hasLaw()) { return; }

        const reducedSize = this.sides.badText || this.sides.goodText;
        const reducedSizeFactor = 0.735;

        const offsetX = vis.get("cards.voteStorage.offset").x;
        const positions = [
            new Vector2(offsetX, vis.center.y),
            new Vector2(vis.size.x - offsetX, vis.center.y)
        ];

        const resMisc = vis.getResource("misc");
        const iconDims = vis.get("cards.voteStorage.iconDims").clone();
        if(reducedSize) { iconDims.scale(reducedSizeFactor); }
    
        let fontSize = vis.get("cards.voteStorage.fontSize");
        if(reducedSize) { fontSize *= reducedSizeFactor; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();

        const str = this.voteStorage.toString();
        const resText = new ResourceText({ text: str, textConfig: textConfig });

        const textColor = vis.inkFriendly ? "#000000" : vis.get("cards.voteStorage.textColor");
        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});

        for(let i = 0; i < positions.length; i++)
        {
            // the "seal" icon behind the text
            const pos = positions[i];
            const rot = i == 0 ? 0 : Math.PI;
            const opIcon = new LayoutOperation({
                pos: pos,
                size: iconDims,
                rot: rot,
                frame: MISC.vote_storage.frame,
                pivot: Vector2.CENTER,
                effects: [dropShadowEffect]
            });
            group.add(resMisc, opIcon);

            // the text itself
            const opText = new LayoutOperation({
                pos: pos,
                size: iconDims,
                rot: rot,
                fill: textColor,
                pivot: Vector2.CENTER
            })
            group.add(resText, opText);
        }
    }

}