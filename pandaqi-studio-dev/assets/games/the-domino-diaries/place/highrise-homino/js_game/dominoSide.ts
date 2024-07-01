import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import shuffle from "js/pq_games/tools/random/shuffle";
import { FloorType, GeneralData, ItemType, MISC, OBJECTS, TENANTS } from "../js_shared/dict";
import TenantWish from "./tenantWish";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import CONFIG from "../js_shared/config";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class DominoSide
{
    type:ItemType;
    key:string; // the key of the item on this side, or the key of the person if tenant, otherwise "empty"
    floor:FloorType;

    walls:string[];
    wallRotation:number;

    wishes:TenantWish[];
    score:number;

    constructor(it:ItemType = ItemType.OBJECT, key:string = "")
    {
        this.type = it;
        this.key = key;
        this.walls = [];
        this.wallRotation = 0;
    }

    getTypeData() : GeneralData
    {
        if(this.type == ItemType.EMPTY) { return {}; }
        if(this.type == ItemType.OBJECT) { return OBJECTS[this.key]; }
        return TENANTS[this.key];
    }
    
    setWishes(w:TenantWish[])
    {
        this.wishes = w;
    }

    setScore(s:number)
    {
        this.score = s;
    }

    hasTenant()
    {
        return this.type == ItemType.TENANTPROP || this.type == ItemType.TENANTWISH;
    }

    isEmpty() { return this.type == ItemType.EMPTY; }

    hasFloor() { return this.floor != undefined; }
    setFloor(f:FloorType)
    {
        this.floor = f;
    }

    getWallAt(idx:number)
    {
        return this.walls[this.getWallIndexAfterRotation(idx)];
    }

    isDoorAt(idx:number)
    {
        return this.getWallAt(idx) == "door";
    }

    removeWallAt(idx:number)
    {
        this.walls[this.getWallIndexAfterRotation(idx)] = "";
    }

    isClosedAt(idx:number)
    {
        return !this.isOpenAt(idx);
    }
    
    isOpenAt(idx:number)
    {
        return this.getWallAt(idx) == "";
    }

    getWallIndexAfterRotation(idx:number)
    {
        return ((idx - this.wallRotation) + 4) % 4;
    }

    rotateWalls(dr:number = 1)
    {
        this.wallRotation = (this.wallRotation + dr + 4) % 4;
    }

    rotateWallsUntilClosedAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(!this.isOpenAt(rot)) { break; }
            this.rotateWalls();
        }
    }

    hasWalls()
    {
        if(this.walls.length <= 0) { return false; }
        for(const wall of this.walls)
        {
            if(wall != "") { return true; }
        }
        return false;
    }

    setWalls(num:number, door:boolean)
    {
        const arr = [];
        for(let i = 0; i < 4; i++)
        {
            let val = "";
            if(i < num) { val = "wall"; }
            if(door && i <= 0) { val = "door"; }
            arr.push(val);
        }
        shuffle(arr);
        this.walls = arr;

        console.log(arr);
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
        // the floor, which is the most important element here
        if(this.hasFloor())
        {
            const resFloor = vis.getResource("misc");
            const opFloor = new LayoutOperation({
                frame: MISC["floor_" + this.floor].frame,
                dims: new Point(vis.sizeUnit),
                pivot: Point.CENTER
            });
            group.add(resFloor, opFloor);
        }

        // some custom background (a very faint grid pattern or something) on tenants?
        // @TODO: this might be replaced by giving ALL tenants a floor requirement (by default), and making THAT the full background
        if(this.hasTenant())
        {
            const resBG = vis.getResource("misc");
            const opBG = new LayoutOperation({
                frame: MISC.tenant_bg.frame,
                dims: new Point(vis.sizeUnit),
                pivot: Point.CENTER,
                rotation: Math.floor(Math.random() * 4) * 0.5 * Math.PI
            });
            group.add(resBG, opBG);
        }
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.isEmpty()) { return; }

        const data = this.getTypeData();

        // the main, centered, big illustration of the tile
        const resourceKey = this.type + "s";
        const resMain = vis.getResource(resourceKey);
        const dims = vis.get("dominoes." + this.type + ".main.dims");
        const opMain = new LayoutOperation({
            frame: data.frame,
            dims: dims,
            pivot: Point.CENTER
        })
        group.add(resMain, opMain);
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.isEmpty()) { return; }

        const data = this.getTypeData();
        const partHeight = 0.5*vis.size.y;
        
        const resMisc = vis.getResource("misc");
        const tenantDetailsY = vis.get("dominoes.tenant.detailsYHeight");

        // fixed tenant properties (only score is unique, depends on wishes)
        if(this.type == ItemType.TENANTPROP)
        {
            // a big centered star + tenant score
            const scoreDims = vis.get("dominoes.tenant.score.dims");
            const opStar = new LayoutOperation({
                translate: new Point(0, tenantDetailsY),
                dims: scoreDims,
                frame: MISC.score_star.frame,
                pivot: Point.CENTER
            });
            group.add(resMisc, opStar);

            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("dominoes.tenant.score.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText({ text: this.score.toString(), textConfig });
            const opText = new LayoutOperation({
                translate: opStar.translate, 
                pivot: Point.CENTER,
                fill: vis.get("dominoes.tenant.score.textColor"),
                dims: scoreDims
            });
            group.add(resText, opText);

            // the properties are _around_ it (alternating left/right)
            const propsEnabled = [];
            for(const [key,enabled] of Object.entries(this.getTypeData().props))
            {
                if(!enabled) { continue; }
                propsEnabled.push(key);
            }
            const numPropsToShow = propsEnabled.length;

            if(numPropsToShow > 0)
            {

                propsEnabled.sort((a,b) => a.localeCompare(b));

                const positions = vis.get("dominoes.tenant.props.xPosititions")[numPropsToShow];
                for(let i = 0; i < numPropsToShow; i++)
                {
                    const opProp = new LayoutOperation({
                        translate: new Point(positions[i] * vis.size.x, tenantDetailsY),
                        dims: vis.get("dominoes.tenant.props.dims"),
                        frame: MISC["property_" + propsEnabled[i]],
                        pivot: Point.CENTER
                    })
                    group.add(resMisc, opProp)
                }
            }
        }

        // dynamically generated tenant wishes
        if(this.type == ItemType.TENANTWISH)
        {
            const numWishes = this.wishes.length;
            const anchor = new Point(vis.center.x, tenantDetailsY);
            const wishDims = vis.get("dominoes.tenant.wishes.dims");
            const positions = getPositionsCenteredAround({ pos: anchor, dims: wishDims, num: numWishes });

            // drawing these is a little more involved, so we ask the class to draw itself and give back the final result
            for(let i = 0; i < numWishes; i++)
            {
                const op = new LayoutOperation({
                    translate: positions[i],
                });
                group.add(this.wishes[i].draw(vis, wishDims), op);
            }
        }

        // extra explanatory text when needed
        if(data.desc && CONFIG.addText)
        {
            const textPos = new Point(0, 0.3*partHeight);
            const textDims = new Point(0.885*vis.size.x, 0.25*partHeight);
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

    drawWalls(vis:MaterialVisualizer)
    {
        const groupFences = new ResourceGroup();
        if(!this.hasWalls()) { return groupFences; }

        const FENCE_OFFSETS = [Point.RIGHT, Point.DOWN, Point.LEFT, Point.UP];

        const res = vis.getResource("misc");
        const partSize = new Point(vis.size.x, 0.5*vis.size.y);
        const fenceSize = vis.get("dominoes.walls.dims");
        for(let i = 0; i < 4; i++)
        {
            const elem = this.getWallAt(i);
            if(elem == "") { continue; }

            let frame = (elem == "door") ? MISC.wall_door.frame : MISC.wall.frame;

            const offset = FENCE_OFFSETS[i].clone().scale(0.5 * partSize.x);
            const op = new LayoutOperation({
                translate: offset,
                dims: fenceSize,
                frame: frame,
                rotation: i*0.5*Math.PI,
                pivot: Point.CENTER
            });
            groupFences.add(res, op);
        }
        return groupFences
    }
}