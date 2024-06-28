import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import { ITEMS, ItemType, MISC, TerrainType } from "../js_shared/dict";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class DominoSide
{
    type:ItemType;
    key:string;
    terrain:TerrainType;
    numFences:number;
    typeFences:string;

    constructor(it:ItemType = ItemType.EMPTY, key:string = "")
    {
        this.type = it;
        this.key = key;
    }

    getTypeData()
    {
        return ITEMS[this.type][this.key] ?? {};
    }

    getResourceKey()
    {
        return this.type.toString() + "s";
    }

    setTerrain(t:TerrainType)
    {
        this.terrain = t;
    }

    setFences(num:number, type:string)
    {
        this.numFences = num;
        this.typeFences = type;
    }

    needsTerrainBackground()
    {
        return this.terrain != undefined;
    }

    needsPathBackground()
    {
        return this.type == ItemType.PATH || this.type == ItemType.STALL;
    }

    needsMainElement()
    {
        return this.type != ItemType.EMPTY && this.key != "";
    }

    draw(vis:MaterialVisualizer) : ResourceGroup
    {
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawMain(vis, group);
        this.drawFences(vis, group);
        this.drawOverlay(vis, group);

        return group;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const partSize = new Point(vis.size.x, 0.5*vis.size.y);
        const randRotation = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
        const op = new LayoutOperation({
            dims: partSize,
            pivot: Point.CENTER,
            rotation: randRotation
        });

        if(this.needsPathBackground())
        {
            const res = vis.getResource("misc");
            op.frame = MISC.path.frame;
            group.add(res, op);
        }

        if(this.needsTerrainBackground())
        {
            const res = vis.getResource("terrains");
            op.frame = this.getTypeData().frame;
            group.add(res, op);
        }
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.needsMainElement()) { return; }

        const res = vis.getResource(this.getResourceKey());
        const shadowEffect = new DropShadowEffect({ color: "#000000", blurRadius: 0.05*vis.sizeUnit });
        const op = new LayoutOperation({
            frame: this.getTypeData().frame,
            dims: vis.get("dominoes.main.dims"),
            effects: [shadowEffect, vis.inkFriendlyEffect].flat(),
            pivot: Point.CENTER,
        })
        group.add(res, op);
    }

    drawFences(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.numFences <= 0) { return; }

        const arr = [];
        for(let i = 0; i < 4; i++)
        {
            const type = i < this.numFences ? this.typeFences : "";
            arr.push(type);
        }
        shuffle(arr);

        const FENCE_OFFSETS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

        const res = vis.getResource("misc");
        const partSize = new Point(vis.size.x, 0.5*vis.size.y);
        for(let i = 0; i < 4; i++)
        {
            const elem = arr[i];
            if(elem == "") { continue; }

            const offset = FENCE_OFFSETS[i].clone().scale(0.5 * partSize.x);
            const op = new LayoutOperation({
                translate: offset,
                dims: partSize,
                frame: MISC[elem].frame,
                rotation: i*0.5*Math.PI,
                pivot: Point.CENTER
            });
            group.add(res, op);
        }
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getTypeData();
        const partHeight = 0.5*vis.size.y;

        // extra explanatory text when needed
        if(data.desc && CONFIG.addText)
        {
            const textPos = new Point(0, 0.33*partHeight);
            const textDims = new Point(0.9*vis.size.x, 0.275*partHeight);
            const rectParams = { pos: textPos, dims: textDims, color: "#111111", alpha: 0.75 };
            drawBlurryRectangle(rectParams, group);
    
            const text = data.desc;
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("dominoes.text.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText({ text, textConfig });
            const opText = new LayoutOperation({
                translate: textPos, 
                pivot: Point.CENTER,
                fill: "#FFEEEE",
                dims: new Point(0.9*textDims.x, textDims.y)
            });
            group.add(resText, opText);
        }
 
    }
}