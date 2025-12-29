import { TERRAINS, TerrainType, TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import pawnDrawerNaivigation from "games/naivigation/shared/pawnDrawerNaivigation";
import tileDrawerNaivigation from "games/naivigation/shared/tileDrawerNaivigation";
import { MATERIAL, MISC, TREASURE_BONUSES, TREASURE_CONDITIONS } from "../shared/dict";
import { MaterialVisualizer, ResourceGroup, LayoutOperation, Vector2, TextConfig, ResourceText, StrokeAlign, DropShadowEffect } from "lib/pq-games";

export default class Tile extends MaterialNaivigation
{
    terrainUsesGrayscale = true

    getData() { return MATERIAL[this.type][this.key] ?? {}; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        if(this.type == TileType.VEHICLE) {
            tileDrawerNaivigation(vis, group, this);
        } else if(this.type == TileType.MAP) {
            this.drawMapTile(vis, group);
        } else if(this.type == TileType.PAWN) {
            pawnDrawerNaivigation(vis, group, this);
        } else if(this.type == TileType.CUSTOM) {
            this.drawCustomTile(vis, group);
        }
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    getCustomBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isCollectible()) { return false; }

        // first half = land, second half = water
        const res = vis.getResource("terrains");
        const frameLand = TERRAINS[TerrainType.GRASS].frame;
        const resOpLand = new LayoutOperation({
            pos: new Vector2(-0.5*vis.size.x, 0),
            size: vis.size,
            frame: frameLand,
            effects: vis.inkFriendlyEffect
        });

        const frameWater = TERRAINS[TerrainType.SEA].frame;
        const resOpWater = new LayoutOperation({
            pos: new Vector2(0.5*vis.size.x, 0),
            size: vis.size,
            frame: frameWater,
            effects: vis.inkFriendlyEffect
        });
        
        group.add(res, resOpLand);
        group.add(res, resOpWater);

        return true;
    }

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // do the general stuff
        tileDrawerNaivigation(vis, group, this);

        // add the ENEMY ICON if wanted
        if(this.customData.enemyIcon)
        {
            const res = vis.getResource("misc");
            const op = new LayoutOperation({
                pos: vis.get("tiles.enemyIcon.pos"),
                size: vis.get("tiles.enemyIcon.size"),
                pivot: Vector2.CENTER,
                frame: MISC.enemy_icon.frame,
                effects: vis.inkFriendlyEffect
            })
            group.add(res, op);
        }

        // add the WATER CURRENT if wanted
        if(this.customData.waterCurrent)
        {
            // actual icon
            const rot = this.customData.waterCurrent.dir * 0.5 * Math.PI;
            const res = vis.getResource("misc");
            const op = new LayoutOperation({
                pos: vis.center,
                rot: rot,
                size: vis.get("tiles.waterCurrent.size"),
                pivot: Vector2.CENTER,
                composite: "overlay",
                frame: MISC.water_direction.frame
            });
            group.add(res, op);

            // strength indication
            const strength = this.customData.waterCurrent.strength ?? 1;
            if(strength != 1)
            {
                const textConfig = new TextConfig({
                    font: vis.get("fonts.heading"),
                    size: vis.get("tiles.waterCurrent.fontSize")
                }).alignCenter();
                const resText = new ResourceText(strength.toString(), textConfig);
        
                const opText = new LayoutOperation({
                    pos: vis.get("tiles.waterCurrent.textPos"),
                    size: vis.size,
                    fill: vis.get("tiles.waterCurrent.fontColor"),
                    pivot: Vector2.CENTER,
                    composite: "overlay",
                });
                group.add(resText, opText);
            }
        }
    }

    // draws the COMPASS, WIND and TREASURE special deck tiles
    drawCustomTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the background template
        const resBG = vis.getResource("misc");
        const opBG = new LayoutOperation({
            size: vis.size,
            frame: MISC[this.key + "_template"].frame,
            effects: vis.inkFriendlyEffect
        })
        group.add(resBG, opBG);

        if(this.key == "compass") { return; }
        
        if(this.key == "wind")
        {
            // the specific text
            const val = this.customData.num;
            let str = val.toString();
    
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("tiles.custom.fontSize")
            }).alignCenter();
            const resText = new ResourceText(str, textConfig);
    
            const opText = new LayoutOperation({
                pos: vis.center,
                size: vis.size,
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: vis.get("tiles.custom.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Vector2.CENTER
            });
            group.add(resText, opText);
        }

        // preferred harbor, condition, bonus
        if(this.key == "treasure")
        {
            // the two special texts
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("tiles.treasure.fontSize")
            }).alignCenter();

            const textBoxDims = vis.get("tiles.treasure.textBoxDims");
            const condition = TREASURE_CONDITIONS[this.customData.condition].desc;
            const resTextCond = new ResourceText(condition, textConfig);
            const opTextCond = new LayoutOperation({
                pos: vis.get("tiles.treasure.conditionPos"),
                size: textBoxDims,
                fill: "#000000",
                pivot: Vector2.CENTER
            });
            group.add(resTextCond, opTextCond);

            const bonus = TREASURE_BONUSES[this.customData.bonus].desc;
            const resTextBonus = new ResourceText(bonus, textConfig);
            const opTextBonus = new LayoutOperation({
                pos: vis.get("tiles.treasure.bonusPos"),
                size: textBoxDims,
                fill: "#000000",
                pivot: Vector2.CENTER
            });
            group.add(resTextBonus, opTextBonus);

            // the icons for the preferred harbor
            const iconOffset = vis.get("tiles.treasure.iconOffset");
            const positions = [
                iconOffset.clone(),
                new Vector2(vis.size.x - iconOffset.x, iconOffset.y)
            ]

            const harborData = MATERIAL[TileType.MAP][this.customData.harbor];
            const resIcon = vis.getResource("map_tiles");
            const effects = [new DropShadowEffect({ color: "#000000", blur: 0.05 * textConfig.size })];
            for(const pos of positions)
            {
                const op = new LayoutOperation({
                    pos: pos,
                    size: vis.get("tiles.treasure.harborIconSize"),
                    frame: harborData.frame,
                    pivot: Vector2.CENTER,
                    effects: effects
                });
                group.add(resIcon, op);
            }
        }
    }
}