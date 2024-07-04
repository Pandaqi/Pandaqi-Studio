import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { DominoType, ROLES } from "../js_shared/dict";
import DominoSide from "./dominoSide";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import MissionRequirement from "./missionRequirement";
import fromArray from "js/pq_games/tools/random/fromArray";

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
        const res = vis.getResource("templates");
        const op = new LayoutOperation({
            dims: vis.size,
            frame: ROLES[this.key].frame,
        });
        group.add(res, op);

        // @TODO: unique ICON + TERRAIN
        // @TODO: number
        // @TODO: power
        // @TODO: reportPhase
    }

    drawMission(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // background template
        const res = vis.getResource("templates");
        const op = new LayoutOperation({
            dims: vis.size,
            frame: CONFIG.dominoes.missionTemplateFrame, 
        });
        group.add(res, op);

        // @TODO: the specific requirements
        // @TODO: optional penalty/reward
    }

    drawEvent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("templates");
        const op = new LayoutOperation({
            dims: vis.size,
            frame: CONFIG.dominoes.eventTemplateFrame, 
        });
        group.add(res, op);

        // @TODO: event name
        // @TODO: event text
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const opTop = new LayoutOperation({
            translate: new Point(vis.center.x, 0.25*vis.size.y),
            pivot: Point.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            translate: new Point(vis.center.x, 0.75*vis.size.y),
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
            translate: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: "#121212",
            alpha: 0.75,
            dims: new Point(2*textConfig.size)
        });

        // @NOTE: I double-use this code to mark the starting domino as well
        // but that requires the text written in full, so a few changes are needed
        if(this.set == "startingDomino")
        {
            textConfig.alignCenter();
            opText.translate = new Point(vis.center.x, 0.9*vis.size.y);
            opText.dims = new Point(vis.size.x, 0.1*vis.size.y);
        }

        group.add(resText, opText);
    }

}