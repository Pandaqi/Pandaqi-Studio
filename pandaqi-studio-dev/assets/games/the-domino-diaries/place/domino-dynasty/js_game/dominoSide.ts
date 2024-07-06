import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import { ICONS, PATHS, TERRAINS, TerrainType } from "../js_shared/dict";

export default class DominoSide
{
    key:string;
    terrain:TerrainType;
    pathRotation:number;
    pathKey:string;
    pathDirected:boolean;
    
    clone() : DominoSide
    {
        const ds = new DominoSide();
        ds.setIcon(this.key);
        ds.setTerrain(this.terrain);
        ds.setPath(this.pathKey, this.pathDirected);
        return ds
    }

    getTypeData()
    {
        return ICONS[this.key];
    }

    getPathData()
    {
        return PATHS[this.pathKey];
    }

    setTerrain(t:TerrainType)
    {
        this.terrain = t;
    }

    setPath(k:string, directed:boolean)
    {
        this.pathKey = k;
        this.pathDirected = directed;
        this.pathRotation = Math.floor(Math.random() * 4);
    }

    setIcon(k:string)
    {
        this.key = k;
    }

    isCapital()
    {
        if(!this.hasIcon()) { return false; }
        return this.getTypeData().mainIcon;
    }

    hasIcon()
    {
        return this.key != undefined && this.key != "empty";
    }

    getPathIndexAfterRotation(idx:number)
    {
        return ((idx - this.pathRotation) + 4) % 4;
    }

    
    hasPathAt(rot:number)
    {
        return this.getPathData().sides[this.getPathIndexAfterRotation(rot)];
    }

    isCompletelyOpen()
    {
        return this.pathKey == "all";
    }

    rotate(dr = 1)
    {
        this.pathRotation = (this.pathRotation + dr + 4) % 4;
    }

    rotateUntilPathAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(this.hasPathAt(rot)) { break; }
            this.rotate();
        }
    }

    rotateUntilNoPathAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(!this.hasPathAt(rot)) { break; }
            this.rotate();
        }
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

        // the terrain
        const resTerrain = vis.getResource("terrains");
        const opTerrain = new LayoutOperation({
            frame: TERRAINS[this.terrain].frame,
            dims: partSize,
            pivot: Point.CENTER,
            rotation: randRotation
        });
        group.add(resTerrain, opTerrain);

        // the path
        const resPath = vis.getResource("terrains");
        const frameOffset = this.pathDirected ? 5 : 0;
        const frame = PATHS[this.pathKey].frame + frameOffset;
        const opPath = new LayoutOperation({
            frame: frame,
            dims: partSize,
            pivot: Point.CENTER,
            rotation: this.pathRotation * 0.5 * Math.PI
        });
        group.add(resPath, opPath);

    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasIcon()) { return; }

        const res = vis.getResource("icons");
        const shadowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.05*vis.sizeUnit });
        const dims = this.isCapital() ? vis.get("dominoes.main.dimsCapital") : vis.get("dominoes.main.dims");
        const op = new LayoutOperation({
            frame: this.getTypeData().frame,
            dims: dims,
            effects: [shadowEffect, vis.inkFriendlyEffect].flat(),
            pivot: Point.CENTER,
        })
        group.add(res, op);
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getTypeData();
        if(!data.desc || !CONFIG.addText) { return; }

        // extra explanatory text when needed
        const partHeight = 0.5*vis.size.y;
        const textPos = new Point(0, 0.33*partHeight);
        const textDims = new Point(0.9*vis.size.x, 0.275*partHeight);
        const rectParams = { pos: textPos, dims: textDims, color: vis.get("dominoes.powerText.rectColor"), alpha: vis.get("dominoes.powerText.rectAlpha") };
        drawBlurryRectangle(rectParams, group);

        const text = data.desc;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.powerText.fontSize"),
        }).alignCenter();

        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            translate: textPos, 
            pivot: Point.CENTER,
            fill: vis.get("dominoes.powerText.color"),
            dims: new Point(0.9*textDims.x, textDims.y)
        });
        group.add(resText, opText);
 
    }
}