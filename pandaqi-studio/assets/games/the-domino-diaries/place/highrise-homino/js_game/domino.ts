import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { DominoType, MISSIONS, MissionType } from "../js_shared/dict";
import DominoSide from "./dominoSide";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";

export default class Domino
{
    type:DominoType;
    sides:{ top:DominoSide, bottom:DominoSide }
    missionType: MissionType;
    missionKey:string;
    set:string;

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setMission(mt:MissionType, key: string)
    {
        this.missionType = mt;
        this.missionKey = key;
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

        if(this.type == DominoType.REGULAR || this.type == DominoType.TENANT) {
            this.drawBothParts(vis, group);
        } else if(this.type == DominoType.MISSION) {
            this.drawMission(vis, group);
        }

        this.drawSetIndicator(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const topRotation = (this.type == DominoType.TENANT) ? Math.PI : 0;
        const opTop = new LayoutOperation({
            pos: new Point(vis.center.x, 0.25*vis.size.y),
            rot: topRotation,
            pivot: Point.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            pos: new Point(vis.center.x, 0.75*vis.size.y),
            pivot: Point.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);

        group.add(this.sides.top.drawWalls(vis), opTop);
        group.add(this.sides.bottom.drawWalls(vis), opBottom);
    }

    drawMission(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the general background template
        const res = vis.getResource("mission_tiles");
        const frame = this.missionType == MissionType.GOAL ? 0 : 1;
        const op = new LayoutOperation({
            size: vis.size,
            frame: frame
        });
        group.add(res, op);

        // specific task text
        const data = MISSIONS[this.missionKey];
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("missions.fontSize"),
            style: TextStyle.ITALIC
        })
        const resTextTask = new ResourceText({ text: data.descTask, textConfig: textConfig });
        const textDims = vis.get("missions.textBoxDims");
        const opTextTask = new LayoutOperation({
            pos: vis.get("missions.taskTextPos"),
            size: textDims,
            fill: "#121212"
        })
        group.add(resTextTask, opTextTask);

        // specific reward text
        const defText = this.missionType == MissionType.GOAL ? "No extra reward." : "No extra penalty."
        const resTextReward = new ResourceText({ text: data.descReward ?? defText, textConfig: textConfig });
        const opTextReward = new LayoutOperation({
            pos: vis.get("missions.rewardTextPos"),
            size: textDims,
            fill: "#121212"
        });
        group.add(resTextReward, opTextReward);

        // the specific set this one belongs to
        const textConfigSet = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("missions.fontSizeSet")
        }).alignCenter();

        const setText = "Set: " + (data.set ?? "Base");
        const resTextSet = new ResourceText({ text: setText, textConfig: textConfigSet });
        const opTextSet = new LayoutOperation({
            pos: vis.get("missions.setTextPos"),
            size: textDims,
            fill: "#121212",
            alpha: vis.get("missions.setTextAlpha"),
            pivot: Point.CENTER
        });
        group.add(resTextSet, opTextSet);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base" || !this.set) { return; }

        const text = this.set.slice(0,1).toUpperCase();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            pos: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: vis.get("dominoes.setText.color"),
            alpha: vis.get("dominoes.setText.alpha"),
            stroke: vis.get("dominoes.setText.strokeColor"),
            strokeWidth: vis.get("dominoes.setText.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            size: new Point(2*textConfig.size)
        });
        group.add(resText, opText);
    }

}