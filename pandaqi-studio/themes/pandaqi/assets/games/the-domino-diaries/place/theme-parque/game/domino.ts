import { fromArray, MaterialVisualizer, createContext, fillCanvas, ResourceGroup, Vector2, LayoutOperation, TextConfig, ResourceText, StrokeAlign } from "lib/pq-games";
import { CHALLENGES, ChallengeType, DYNAMIC_REPLACEMENTS, DominoType, EVENTS, EventVibe, MISC } from "../shared/dict";
import DominoSide from "./dominoSide";

export default class Domino
{
    type:DominoType;
    pawnIndex:number = -1; // just a quick hack to also reuse this class for drawing the pawns/claim cubes
    sides:{ top:DominoSide, bottom:DominoSide }
    entrance: boolean = false;
    set:string;
    eventData:{ eventKey: string, challengeKey: string, challengeText?: string, numChosen?:number }

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setPawnIndex(i:number)
    {
        this.pawnIndex = i;
    }

    setSides(a:DominoSide, b:DominoSide)
    {
        this.sides.top = a;
        this.sides.bottom = b;
    }

    setSet(s:string)
    {
        this.set = s;
    }

    setEvent(ed:string, ch:string)
    {
        const challengeData = CHALLENGES[ch];
        const numScale = challengeData.numScale ?? [0];
        const chooseNum = Math.floor(Math.random() * numScale.length);
        
        // fill in dynamic values
        let textConverted = challengeData.desc;
        textConverted = textConverted.replace("%num%", numScale[chooseNum].toString());
        for(const [key,options] of Object.entries(DYNAMIC_REPLACEMENTS))
        {
            if(!textConverted.includes(key)) { continue; }
            textConverted = textConverted.replace(key, fromArray(options).toString());
        }

        this.eventData = {
            eventKey: ed,
            challengeKey: ch,
            challengeText: textConverted,
            numChosen: chooseNum,
        }
    }

    getEventData()
    {
        return EVENTS[this.eventData.eventKey] ?? {};
    }

    getChallengeData()
    {
        return CHALLENGES[this.eventData.challengeKey] ?? {};
    }

    getChallengeText()
    {
        return this.eventData.challengeText ?? this.getChallengeData().desc;
    }

    getEventScore()
    {
        const scoreEvent = this.getEventData().vibe == EventVibe.BAD ? 1 : 0;
        const scoreChallenge = (this.getChallengeData().value ?? 1) + this.eventData.numChosen;
        const score = scoreEvent + scoreChallenge;
        return Math.min(Math.max(Math.round(score), 1), 6);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(this.type == DominoType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == DominoType.EVENT) {
            this.drawEvent(vis, group);
        } else if(this.type == DominoType.REGULAR) {
            this.drawBothParts(vis, group);
            this.drawSetIndicator(vis, group);
            this.drawEntrance(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("pawns");
        const size = new Vector2(vis.sizeUnit);
        
        const opTop = new LayoutOperation({
            pos: new Vector2(vis.size.x, vis.center.y),
            frame: this.pawnIndex,
            size: size,
            rot: Math.PI
        });
        group.add(res, opTop);

        const opBottom = new LayoutOperation({
            pos: new Vector2(0, vis.center.y),
            frame: this.pawnIndex,
            size: size
        });
        group.add(res, opBottom);
    }

    drawEvent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // background
        const res = vis.getResource("events");
        const frame = (this.getChallengeData().type == ChallengeType.WIN) ? 0 : 1;
        const op = new LayoutOperation({
            size: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);

        // specifics
        // > the score/value of this card
        const score = this.getEventScore();
        const textConfigScore = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.events.score.fontSize")
        }).alignCenter();
        const resTextScore = new ResourceText(score.toString(), textConfigScore);
        const scoreOffset = vis.get("dominoes.events.score.offset");
        const positions = [scoreOffset.clone(), new Vector2(vis.size.x-scoreOffset.x, scoreOffset.y)];
        for(const pos of positions)
        {
            const opTextScore = new LayoutOperation({
                pos: pos,
                size: new Vector2(3.0 * textConfigScore.size),
                pivot: Vector2.CENTER,
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: vis.get("dominoes.events.score.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE
            })    
            group.add(resTextScore, opTextScore);
        }

        // > the event text
        const textBoxSize = vis.get("dominoes.events.textBoxSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.events.fontSize")
        }).alignCenter();
        const resTextEvent = new ResourceText("<i>" + this.getEventData().desc + "</i> " + this.getEventData().descPower, textConfig);
        const opTextEvent = new LayoutOperation({
            pos: vis.get("dominoes.events.posEvent"),
            fill: "#000000",
            size: textBoxSize,
            pivot: Vector2.CENTER,
        })
        group.add(resTextEvent, opTextEvent);

        // > the challenge text
        const resTextChallenge = new ResourceText(this.getChallengeText(), textConfig);
        const opTextChallenge = new LayoutOperation({
            pos: vis.get("dominoes.events.posChallenge"),
            fill: "#000000",
            size: textBoxSize,
            pivot: Vector2.CENTER,
        })
        group.add(resTextChallenge, opTextChallenge);

        // expansions needed
        const textConfigExpansions = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.events.expansions.fontSize")
        }).alignCenter();
        const challengeSets = this.getChallengeData().sets ?? ["base"];
        const strExp = challengeSets.join(", ");
        const resTextExpansions = new ResourceText(strExp, textConfigExpansions);
        const opTextExpansions = new LayoutOperation({
            pos: vis.get("dominoes.events.expansions.pos"),
            size: textBoxSize,
            fill: "#000000",
            alpha: vis.get("dominoes.events.expansions.alpha"),
            pivot: Vector2.CENTER
        })
        group.add(resTextExpansions, opTextExpansions);
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const opTop = new LayoutOperation({
            pos: new Vector2(vis.center.x, 0.25*vis.size.y),
            pivot: Vector2.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            pos: new Vector2(vis.center.x, 0.75*vis.size.y),
            pivot: Vector2.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base") { return; }

        let setID = "B";
        if(this.set == "wishneyland") { setID = "W"; }
        else if(this.set == "unibearsal") { setID = "U"; }
        else if(this.set == "rollercoasters") { setID = "R"; }

        const text = setID;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            pos: new Vector2(1.33*textConfig.size), 
            pivot: Vector2.CENTER,
            fill: "#FFFFFF",
            alpha: 0.75,
            size: new Vector2(2*textConfig.size)
        });
        group.add(resText, opText);
    }

    drawEntrance(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.entrance) { return; }

        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            frame: MISC.entrance.frame,
            pos: new Vector2(vis.center.x, 0.25*vis.size.y),
            size: vis.get("dominoes.entrance.size"),
            pivot: Vector2.CENTER
        });
        group.add(res, op);
    }

}