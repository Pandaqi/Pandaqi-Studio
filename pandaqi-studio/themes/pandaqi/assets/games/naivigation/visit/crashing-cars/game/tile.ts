import { TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import pawnDrawerNaivigation from "games/naivigation/shared/pawnDrawerNaivigation";
import tileDrawerNaivigation from "games/naivigation/shared/tileDrawerNaivigation";
import { MATERIAL, MISC, NETWORK_TYPES } from "../shared/dict";
import { MaterialVisualizer, ResourceGroup, TextConfig, ResourceText, LayoutOperation, StrokeAlign, Vector2, DropShadowEffect, getRectangleCornersWithOffset } from "lib/pq-games";

export default class Tile extends MaterialNaivigation
{
    getData() { return MATERIAL[this.type][this.key] ?? {}; }
    getNetworkData() { return NETWORK_TYPES[this.networkKey]; }
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

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        tileDrawerNaivigation(vis, group, this);

        // the semi-unique numbers on top of shops
        if(this.isCollectible())
        {
            const num = this.customData.num.toString();
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("tiles.shop.fontSize")
            }).alignCenter();
            const resText = new ResourceText(num, textConfig);
            const opText = new LayoutOperation({
                pos: vis.center,
                size: vis.size,
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: vis.get("tiles.shop.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: Vector2.CENTER
            });
            group.add(resText, opText);
        }

        // the car orientation on top of parking lots
        if(this.key == "parking_lot")
        {
            const res = vis.getResource("map_tiles");
            const randVehicleRot = this.customData.carOrientation*0.5*Math.PI;
            const vehicleOp = new LayoutOperation({
                pos: vis.center,
                frame: MATERIAL[TileType.VEHICLE].vehicle_0.frame,
                size: vis.get("tiles.parkingLot.vehicleIcon.dims"),
                rot: randVehicleRot,
                alpha: vis.get("tiles.parkingLot.vehicleIcon.alpha"),
                composite: vis.get("tiles.parkingLot.vehicleIcon.composite"),
                effects: [new DropShadowEffect({ color: "#000000", blurRadius: vis.get("tiles.parkingLot.vehicleIcon.shadowBlur" )})],
                pivot: Vector2.CENTER
            })
            group.add(res, vehicleOp);

            const vehicleDimsSmall = vis.get("tiles.parkingLot.vehicleIcon.dimsSmall");
            const cornerOffset = vehicleDimsSmall.clone().scale(0.5);
            const corners = getRectangleCornersWithOffset(vis.size, cornerOffset);
            for(const corner of corners)
            {
                const op = vehicleOp.clone();
                op.pos = corner;
                op.size = vehicleDimsSmall;
                op.effects = [];
                group.add(res, op);
            }
        }
    }

    // draws the GEAR special deck tiles
    drawCustomTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the background template
        const resBG = vis.getResource("misc");
        const opBG = new LayoutOperation({
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: MISC[this.key + "_template"].frame,
            effects: vis.inkFriendlyEffect
        })
        group.add(resBG, opBG);

        // the specific text
        const val = this.customData.num;
        const str = val > 0 ? "+" + val : val.toString();

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
}