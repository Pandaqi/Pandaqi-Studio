import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { DominoType, EVENTS, MISC, MISSION_PENALTIES, MISSION_REWARDS, MISSION_TEXTS, ROLES } from "../js_shared/dict";
import DominoSide from "./dominoSide";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import MissionRequirement from "./missionRequirement";
import fromArray from "js/pq_games/tools/random/fromArray";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";

export default class Domino
{
    type:DominoType;
    sides:{ top:DominoSide, bottom:DominoSide }
    key: string;
    set: string;
    missionRequirements: MissionRequirement[];
    missionConsequence: string; // key into MISSION_REWARDS or MISSION_PENALTIES
    missionText:string; // key into MISSION_TEXTS
    missionShush:boolean;

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setMissionRequirements(r:MissionRequirement[])
    {
        this.missionRequirements = r.slice();
    }

    hasMissionConsequence() { return this.missionConsequence != undefined && this.missionConsequence != ""; }
    setMissionConsequence(c:string)
    {
        this.missionConsequence = c;
    }

    setMissionText(k:string)
    {
        this.missionText = k;
    }

    setMissionShush(s:boolean)
    {
        this.missionShush = s;
    }

    getMissionValue()
    {
        let sum = 0;
        for(const req of this.missionRequirements)
        {
            sum += req.getValue();
        }
        return sum;
    }

    missionIsBalanced()
    {
        const val = this.getMissionValue();
        return Math.abs(val - CONFIG.generation.targetMissionValue) <= CONFIG.generation.targetMissionValueMaxError;
    }

    cleanUpMission()
    {
        // the usual alphabetic sorting for consistent order
        this.missionRequirements.sort((a,b) => a.getID().localeCompare(b.getID()));

        // @EXCEPTION: if we happen to add multiple IDENTICAL requirements (same icon _and_ same scalar), 
        // just combine them into one
        // (at this point, all numbers are 1, so no number trickery needed)
        for(let i = 0; i < this.missionRequirements.length; i++)
        {
            const curWish = this.missionRequirements[i];
            let nextWish = this.missionRequirements[i+1];
            while(nextWish && curWish.getGeneralID() == nextWish.getGeneralID())
            {
                this.missionRequirements.splice(i+1, 1);
                nextWish = this.missionRequirements[i+1];
            }
        }

        // balance missions by doubling/halving the impact of elements until we're close
        // this is just a ballpark estimate thing, doesn't need to be exact
        const maxTries = 10;
        let numTries = 0;
        while(!this.missionIsBalanced() && numTries < maxTries)
        {
            const goHigher = this.getMissionValue() < CONFIG.generation.targetMissionValue;
            const randReq = fromArray(this.missionRequirements);
            const val = goHigher ? 2.0 : 0.5;
            randReq.factorNumber(val);
            
            numTries++;
        }
    }

    setKey(k:string)
    {
        this.key = k;
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

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(this.type == DominoType.ROLE) {
            this.drawRole(vis, group);
        } else if(this.type == DominoType.MISSION) {
            this.drawMission(vis, group);
        } else if(this.type == DominoType.EVENT) {
            this.drawEvent(vis, group);
        } else if(this.type == DominoType.REGULAR) {
            this.drawBothParts(vis, group);
            this.drawSetIndicator(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawRole(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // background template
        // actually, this is everything, decided to just bake it in there
        const res = vis.getResource("templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: ROLES[this.key].frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    drawMission(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // background template
        const res = vis.getResource("templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: CONFIG.dominoes.missionTemplateFrame, 
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);

        // flavor text at the top
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.mission.fontSize"),
            lineHeight: 1.05,
            style: TextStyle.ITALIC
        });
        const resText = new ResourceText({ text: MISSION_TEXTS[this.missionText].desc, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("dominoes.mission.posFlavorText"),
            size: vis.get("dominoes.mission.sizeFlavorText"),
            fill: "#121212"
        });
        group.add(resText, opText);

        // the list of specific requirements below that
        const anchor = vis.get("dominoes.mission.requirements.pos").clone();
        const size = vis.get("dominoes.mission.requirements.size");
        for(const req of this.missionRequirements)
        {
            req.draw(vis, group, anchor);
            anchor.y += size.y * 1.125;
        }

        // optional penalty/reward
        if(this.hasMissionConsequence())
        {
            const resHeader = vis.getResource("misc");
            const headerKey = MISSION_REWARDS[this.missionConsequence] ? "mission_reward" : "mission_penalty";

            const rectParams = { pos: vis.get("dominoes.mission.consequence.posText"), size: vis.get("dominoes.mission.consequence.sizeText"), color: "#FFFFFF", alpha: 0.85 };
            drawBlurryRectangle(rectParams, group);

            const opHeader = new LayoutOperation({
                pos: vis.get("dominoes.mission.consequence.posHeader"),
                size: vis.get("dominoes.mission.consequence.sizeHeader"),
                pivot: Point.CENTER,
                frame: MISC[headerKey].frame,
                effects: vis.inkFriendlyEffect
            })
            group.add(resHeader, opHeader);

            // the actual penalty text
            let text = headerKey == "mission_reward" ? MISSION_REWARDS[this.missionConsequence].desc : MISSION_PENALTIES[this.missionConsequence].desc;
            text = text.replaceAll("%neutral%", "Neutral strength");
            
            const textConfigConseq = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("dominoes.mission.fontSize"),
                lineHeight: 1.05,
                style: TextStyle.ITALIC
            }).alignCenter();
            const resText = new ResourceText({ text: text, textConfig: textConfigConseq });
            const opText = new LayoutOperation({
                pos: vis.get("dominoes.mission.consequence.posText"),
                size: vis.get("dominoes.mission.consequence.sizeText"),
                fill: "#121212",
                pivot: Point.CENTER
            });
            group.add(resText, opText);
        }

        // optional shush icon (for secret missions in cooperative play)
        if(this.missionShush)
        {
            const res = vis.getResource("misc");
            const op = new LayoutOperation({
                pos: vis.get("dominoes.mission.shushIcon.pos"),
                size: vis.get("dominoes.mission.shushIcon.size"),
                frame: MISC.shush.frame,
                pivot: Point.CENTER
            })
            group.add(res, op);
        }
    }

    drawEvent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = EVENTS[this.key];

        // background template
        const res = vis.getResource("templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: CONFIG.dominoes.eventTemplateFrame, 
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);

        // event name
        const textConfigHeader = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.events.fontSizeHeader"),
            lineHeight: 1.05
        }).alignCenter();
        const resTextHeader = new ResourceText({ text: data.label, textConfig: textConfigHeader });
        const opTextHeader = new LayoutOperation({
            pos: vis.get("dominoes.events.posHeader"),
            size: new Point(0.85*vis.size.x, 0.5*vis.size.y),
            fill: "#121212",
            pivot: Point.CENTER
        });
        group.add(resTextHeader, opTextHeader);

        // event text
        const textConfigBody = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.events.fontSizeBody"),
        }).alignCenter();
        const resTextBody = new ResourceText({ text: data.desc, textConfig: textConfigBody });
        const opTextBody = new LayoutOperation({
            pos: vis.get("dominoes.events.posBody"),
            size: new Point(0.85*vis.size.x, 0.5*vis.size.y),
            fill: "#121212",
            pivot: Point.CENTER
        });
        group.add(resTextBody, opTextBody);
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const opTop = new LayoutOperation({
            pos: new Point(vis.center.x, 0.25*vis.size.y),
            pivot: Point.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            pos: new Point(vis.center.x, 0.75*vis.size.y),
            pivot: Point.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base" || !this.set) { return; }

        let ID = this.set.toUpperCase().slice(0,1);
        if(this.set == "startingDomino") { ID = "Starting Domino" }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text: ID, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: this.set == "startingDomino" ? "#FFFFFF" : vis.get("dominoes.setText.color"),
            alpha: vis.get("dominoes.setText.alpha"),
            size: new Point(2*textConfig.size)
        });

        // @NOTE: I double-use this code to mark the starting domino as well
        // but that requires the text written in full, so a few changes are needed
        if(this.set == "startingDomino")
        {
            textConfig.alignCenter();
            textConfig.size *= 1.33;
            opText.pos = new Point(vis.center.x, 0.966*vis.size.y);
            opText.size = new Point(vis.size.x, 0.1*vis.size.y);
        }

        group.add(resText, opText);
    }

}