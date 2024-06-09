import drawBackgroundEaster from "games/easter-eggventures/js_shared/drawBackgroundEaster";
import drawEggToken from "games/easter-eggventures/js_shared/drawEggToken";
import drawPawnsEaster from "games/easter-eggventures/js_shared/drawPawnsEaster";
import MaterialEaster from "games/easter-eggventures/js_shared/materialEaster";
import createContext from "js/pq_games/layout/canvas/createContext";
import Color from "js/pq_games/layout/color/color";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { MATERIAL, MISC_UNIQUE, TYPE_DATA, TileType } from "../js_shared/dict";

const HELPER_LABELS =
{
    [TileType.OBJECTIVE]: ["Secret Objective"],
    [TileType.ACTION]: ["Action"],
    [TileType.RULE]: ["Movement", "Rule"]
}

export default class Tile extends MaterialEaster
{
    type: TileType;
    key: string;
    customData: Record<string,any>

    constructor(t:TileType, k:string, cd:Record<string,any> = {})
    {
        super();
        this.type = t;
        this.key = k;
        this.customData = cd;
    }

    getTypeData() { return TYPE_DATA[this.type]; }
    getData() 
    { 
        if(this.type == TileType.RULE) { return this.customData.rulesDict[this.key]; }
        if(this.type == TileType.OBJECTIVE) { return this.customData; }
        return MATERIAL[this.type][this.key]; 
    }

    needsText() { return this.type == TileType.RULE || this.type == TileType.OBJECTIVE }

    async draw(vis)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == TileType.PAWN) {
            drawPawnsEaster(this, vis, group);
        } else if(this.type == TileType.EGG) {
            drawEggToken(this, vis, group);
        } else if(this.type == TileType.MAP) {
            this.drawMapTile(vis, group);
        } else {
            // @NOTE: the rule, action and objective tiles are grouped together here because of how extremely similar they are in look (not function)
            this.drawBackground(vis, group);
            this.drawIllustration(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // just apply the standard background function
        drawBackgroundEaster(this, vis, group);

        // the actual unique illustration
        const res = vis.getResource(this.getTypeData().textureKey);
        const frame = this.getData().frame;
        const op = new LayoutOperation({
            translate: vis.center,
            frame: frame,
            dims: vis.get("tiles.map.iconDims"),
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the actual background image
        const res = vis.getResource("misc_unique");
        const frame = (this.type == TileType.OBJECTIVE) ? MISC_UNIQUE.bg_objective.frame : MISC_UNIQUE.bg.frame;
        const op = new LayoutOperation({
            translate: new Point(),
            dims: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect
        })
        group.add(res, op);

        // the helper text(s)
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.helperText.fontSize"),
            weight: TextWeight.BOLD
        }).alignCenter();

        const yOffset = vis.get("tiles.helperText.yOffset");
        let positions = [new Point(vis.center.x, vis.center.y - yOffset), new Point(vis.center.x, vis.center.y + yOffset)];
        if(this.type == TileType.ACTION) { positions = [positions[1]]; }
        if(this.type == TileType.OBJECTIVE) { positions = [new Point(vis.center.x, vis.size.y - 1*yOffset)]; }

        const color = (this.type == TileType.OBJECTIVE && !vis.inkFriendly) ? "#7F0100" : "#000000";
        const composite = (this.type == TileType.OBJECTIVE || vis.inkFriendly) ? "source-over" : "overlay";

        const labels = HELPER_LABELS[this.type].slice();
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const label = labels[i];
            const textRes = new ResourceText({ text: label, textConfig: textConfig });
            const textOp = new LayoutOperation({
                translate: pos,
                pivot: Point.CENTER,
                dims: new Point(0.5*vis.size.x, 2*textConfig.size),
                fill: color,
                composite: composite
            })
            group.add(textRes, textOp);
        }  
    }

    drawMovementGrid(vis:MaterialVisualizer) : ResourceImage
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        const data = this.customData.movement;
        const gridDims = data.dims;
        const validSpaces = data.valid;
        const rectOuterSize = Math.min(vis.size.x / gridDims.x, vis.size.y / gridDims.y);
        const rectInnerSize = new Point(0.9 * rectOuterSize);

        // @NOTE: this is just an easy way to allow us to draw a _square_ image here, centered, which is easily positioned and resized like literally all other images used
        // (regardless of the size of the grid, as I'm not sure what that will be yet)
        const yCentering = new Point(0.5 * rectOuterSize, 0.5 * (vis.size.y - gridDims.y*rectOuterSize) + 0.5*rectOuterSize);

        const strokeWidth = vis.get("tiles.movementGrid.strokeWidth");
        const darkenVal = vis.get("tiles.movementGrid.strokeDarkenValue");

        const resMisc = vis.getResource("misc_unique");

        for(let x = 0; x < gridDims.x; x++)
        {
            for(let y = 0; y < gridDims.y; y++)
            {
                const pos = new Point(x,y).scale(rectOuterSize).add(yCentering);
                const id = x + gridDims.x * y;

                // the background rectangle
                const rectInner = new Rectangle({ center: pos, extents: rectInnerSize });
                const isValid = validSpaces.includes(id);
                const isCenter = (x == Math.floor(0.5*gridDims.x) && y == Math.floor(0.5*gridDims.y));
                const color = new Color(isCenter ? "#9A6324" : (isValid ? "#D8FFBE" : "#FFC6BE"));
                const op = new LayoutOperation({
                    fill: color,
                    stroke: color.lighten(darkenVal),
                    strokeWidth: strokeWidth
                })
                const resShape = new ResourceShape(rectInner);
                group.add(resShape, op);

                // the icon to help colorblind
                const iconFrame = isCenter ? MISC_UNIQUE.pawn.frame : (isValid ? MISC_UNIQUE.checkmark.frame : MISC_UNIQUE.cross.frame);
                const opIcon = new LayoutOperation({
                    translate: pos,
                    dims: rectInnerSize.clone().scale(0.825),
                    frame: iconFrame,
                    pivot: Point.CENTER
                })
                group.add(resMisc, opIcon)
            }
        }

        group.toCanvas(ctx);
        return new ResourceImage(ctx.canvas);
    }

    drawIllustration(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const blurRadius = vis.get("tiles.shared.effectBlurRadius");
        const glowEffect = new DropShadowEffect({ blurRadius: blurRadius, color: "#FFFFFF" });
        const shadowEffect = new DropShadowEffect({ blurRadius: blurRadius, color: "#000000" });

        if(this.type == TileType.ACTION)
        {
            const res = vis.getResource("action_tiles");
            const effects = [glowEffect, vis.inkFriendlyEffect].flat();
            const op = new LayoutOperation({
                translate: vis.get("tiles.action.iconPos"),
                dims: vis.get("tiles.action.iconDims"),
                frame: this.getData().frame,
                pivot: Point.CENTER,
                effects: effects
            })
            group.add(res, op);
        }

        if(this.type == TileType.OBJECTIVE)
        {
            const res = vis.getResource("misc_unique");
            const frame = MISC_UNIQUE.icon_objective.frame;
            const effects = [shadowEffect, vis.inkFriendlyEffect].flat();
            const op = new LayoutOperation({
                translate: vis.get("tiles.objective.iconPos"),
                dims: vis.get("tiles.objective.iconDims"),
                frame: frame,
                pivot: Point.CENTER,
                effects: effects
            });
            group.add(res, op);
        }

        if(this.type == TileType.RULE)
        {
            const res = this.drawMovementGrid(vis);
            const effects = [shadowEffect, vis.inkFriendlyEffect].flat();
            const op = new LayoutOperation({
                translate: vis.get("tiles.movementGrid.pos"),
                dims: vis.get("tiles.movementGrid.dims"),
                pivot: Point.CENTER,
                effects: effects
            });
            group.add(res, op);
        }

        const fontSize = this.type == TileType.OBJECTIVE ? vis.get("tiles.objective.fontSize") : vis.get("tiles.powerText.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            resLoader: vis.resLoader
        }).alignCenter();
        
        const text = this.getData().desc;

        const pos = this.type == TileType.OBJECTIVE ? vis.get("tiles.objective.textBoxPos") : vis.get("tiles.powerText.textBoxPos");
        const color = (this.type == TileType.OBJECTIVE && !vis.inkFriendly) ? "#000000" : "#FFFFFF";
        const effects = (this.type == TileType.OBJECTIVE && !vis.inkFriendly) ? [] : [shadowEffect];

        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const op = new LayoutOperation({
            translate: pos,
            dims: vis.get("tiles.powerText.textBoxDims"),
            pivot: Point.CENTER,
            effects: effects,
            fill: color
        })
        group.add(textRes, op);
    }
}