import cardDrawerNaivigation from "games/naivigation/shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { GAME_DATA, MATERIAL, MISC, PASSENGER_BONUSES, PASSENGER_CURSES } from "../shared/dict";
import { CardType, PASSENGERS, TileType } from "games/naivigation/shared/dictShared";
import { MaterialVisualizer, ResourceGroup, TextConfig, ResourceText, LayoutOperation, Vector2, DropShadowEffect } from "lib/pq-games";


export default class Card extends MaterialNaivigation
{
    getGameData() { return GAME_DATA; }
    getData() 
    { 
        if(this.type == CardType.PASSENGER) { return PASSENGERS[this.key]; }
        return MATERIAL[this.type][this.key] ?? {}; 
    }
    getMisc() { return MISC; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        cardDrawerNaivigation(vis, group, this);
        this.drawPassenger(vis, group);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawPassenger(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != CardType.PASSENGER) { return; }

        // the two special texts
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.passengers.fontSize")
        }).alignCenter();

        const textBoxDims = vis.get("cards.passengers.textBoxDims");
        const bonus = "REWARD: " + PASSENGER_BONUSES[this.customData.bonus].desc;
        const resTextBonus = new ResourceText(bonus, textConfig);
        const opTextBonus = new LayoutOperation({
            pos: vis.get("cards.passengers.bonusPos"),
            size: textBoxDims,
            fill: "#000000",
            pivot: Vector2.CENTER
        });
        group.add(resTextBonus, opTextBonus);

        const curse = "CURSE: " + PASSENGER_CURSES[this.customData.curse].desc;
        const resTextCurse = new ResourceText(curse, textConfig);
        const opTextCurse = new LayoutOperation({
            pos: vis.get("cards.passengers.cursePos"),
            size: textBoxDims,
            fill: "#000000",
            pivot: Vector2.CENTER
        });
        group.add(resTextCurse, opTextCurse);

        // the icons for the preferred airport
        const iconOffset = vis.get("cards.passengers.iconOffset");
        const positions = [
            iconOffset.clone(),
            new Vector2(vis.size.x - iconOffset.x, iconOffset.y)
        ]

        const airportData = MATERIAL[TileType.MAP][this.customData.airport];
        const resIcon = vis.getResource("map_tiles");
        const effects = [new DropShadowEffect({ color: "#000000", blur: 0.1*textConfig.size })];
        for(const pos of positions)
        {
            const op = new LayoutOperation({
                pos: pos,
                size: vis.get("cards.passengers.airportIconSize"),
                frame: airportData.frame,
                pivot: Vector2.CENTER,
                effects: effects
            });
            group.add(resIcon, op);
        }
    }
}