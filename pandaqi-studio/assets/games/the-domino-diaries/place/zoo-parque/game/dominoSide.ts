import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../shared/config";
import { ANIMALS, ITEMS, ItemType, MISC, TERRAINS, TerrainType } from "../shared/dict";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class DominoSide
{
    type:ItemType;
    key:string;
    terrain:TerrainType;
    fences: string[];
    fenceType: string; // for convenience; to prevent looping through FENCES to find the type
    fenceRotation: number;

    constructor(it:ItemType = ItemType.EMPTY, key:string = "")
    {
        this.type = it;
        this.key = key;
        this.fences = [];
        this.fenceRotation = 0; 
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

    setFences(num:number = 0, fenceType:string = "fence_weak")
    {
        // @EXCEPTION: ensure strong animals always have strong fence by default
        if(this.type == ItemType.ANIMAL)
        {
            if(this.getTypeData().strong)
            {
                fenceType = "fence_strong";
            }
        }

        // @EXCEPTION: the "rocks" object is a special one that should not have more than 1 fence otherwise it's a bit useless/complicated
        if(this.type == ItemType.OBJECT && this.key == "rocks")
        {
            num = Math.min(num, 1);
        }

        // just add fences into a full 4-index array (with "" for empty sides) 
        // for completely random distribution of them
        const arr = [];
        for(let i = 0; i < 4; i++)
        {
            const type = i < num ? fenceType : "";
            arr.push(type);
        }
        shuffle(arr);

        this.fences = arr;
        this.fenceType = fenceType;
        this.fenceRotation = 0;
    }

    removeFenceAt(idx:number)
    {
        this.fences[this.getFenceIndexAfterRotation(idx)] = "";
    }
    
    isOpenAt(idx:number)
    {
        return this.fences[this.getFenceIndexAfterRotation(idx)] == "";
    }

    getFenceIndexAfterRotation(idx:number)
    {
        return ((idx - this.fenceRotation) + 4) % 4;
    }

    rotateFences(dr:number = 1)
    {
        this.fenceRotation = (this.fenceRotation + dr + 4) % 4;
    }

    rotateFencesUntilClosedAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(!this.isOpenAt(rot)) { break; }
            this.rotateFences();
        }
    }

    hasFences()
    {
        if(this.fences.length <= 0) { return false; }
        for(const fence of this.fences)
        {
            if(fence != "") { return true; }
        }
        return false;
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
        return this.type != ItemType.EMPTY && this.type != ItemType.PATH && this.key != "";
    }

    isAnimal()
    {
        return this.type == ItemType.ANIMAL;
    }

    getAnimalDiet()
    {
        if(!this.isAnimal()) { return null; }
        return ANIMALS[this.key].diet;
    }
    
    getAnimalSocial()
    {
        if(!this.isAnimal()) { return null; }
        return ANIMALS[this.key].social;
    }

    draw(vis:MaterialVisualizer) : ResourceGroup
    {
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawMain(vis, group);
        this.drawOverlay(vis, group);

        return group;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const partSize = new Point(vis.size.x, 0.5*vis.size.y);
        const randRotation = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
        const op = new LayoutOperation({
            size: partSize,
            pivot: Point.CENTER,
            rot: randRotation
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
            op.size = vis.get("dominoes.bg.sizeTerrain");
            op.frame = TERRAINS[this.terrain].frame;
            const shadowEffect = new DropShadowEffect({ color: "#111111", blurRadius: vis.get("dominoes.bg.terrainShadowSize") });
            op.effects = [shadowEffect];
            group.add(res, op);
        }
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.needsMainElement()) { return; }

        const res = vis.getResource(this.getResourceKey());
        const isBackgroundDark = this.needsTerrainBackground() && TERRAINS[this.terrain].dark;
        const shadowColor = isBackgroundDark ? "#FFFFFF" : "#000000";

        const shadowEffect = new DropShadowEffect({ color: shadowColor, blurRadius: vis.get("dominoes.main.shadowSize") });
        const op = new LayoutOperation({
            frame: this.getTypeData().frame,
            size: vis.get("dominoes.main.size"),
            effects: [shadowEffect, vis.inkFriendlyEffect].flat(),
            pivot: Point.CENTER,
        })
        group.add(res, op);
    }

    drawFences(vis:MaterialVisualizer)
    {
        const groupFences = new ResourceGroup();

        if(!this.hasFences()) { return groupFences; }

        const FENCE_OFFSETS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

        const res = vis.getResource("misc");
        const partSize = new Point(vis.size.x, 0.5*vis.size.y);
        const fenceSize = vis.get("dominoes.fences.size");
        const shadow = new DropShadowEffect({ color: "#221100", blurRadius: 0.05*fenceSize.x });
        for(let i = 0; i < 4; i++)
        {
            const fenceIndex = (i - this.fenceRotation + 4) % 4;
            const elem = this.fences[fenceIndex];
            if(elem == "") { continue; }

            const offset = FENCE_OFFSETS[i].clone().scale(0.5 * partSize.x);
            const op = new LayoutOperation({
                pos: offset,
                size: fenceSize,
                frame: MISC[elem].frame,
                rot: i*0.5*Math.PI,
                effects: [shadow, vis.inkFriendlyEffect].flat(),
                pivot: Point.CENTER
            });
            groupFences.add(res, op);
        }
        return groupFences
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getTypeData();
        const partHeight = 0.5*vis.size.y;

        // extra explanatory text when needed
        if(data.desc && CONFIG.addText)
        {
            const textPos = new Point(0, 0.3*partHeight);
            const textDims = new Point(0.885*vis.size.x, 0.25*partHeight);
            const rectParams = { pos: textPos, size: textDims, color: "#111111", alpha: 0.75 };
            drawBlurryRectangle(rectParams, group);
    
            const text = data.desc;
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("dominoes.text.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText({ text, textConfig });
            const opText = new LayoutOperation({
                pos: textPos, 
                pivot: Point.CENTER,
                fill: "#FFEEEE",
                size: new Point(0.9*textDims.x, textDims.y)
            });
            group.add(resText, opText);
        }
 
    }
}