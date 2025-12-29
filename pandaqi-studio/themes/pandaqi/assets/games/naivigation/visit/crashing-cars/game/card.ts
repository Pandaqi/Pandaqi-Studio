
import cardDrawerNaivigation from "games/naivigation/shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import { MaterialVisualizer, ResourceGroup, TextConfig, ResourceText, LayoutOperation, Vector2 } from "lib/pq-games";
import { GAME_DATA, MATERIAL, MISC, PASSENGER_BONUSES, PASSENGER_CURSES } from "../shared/dict";
import { CardType, PASSENGERS, TileType } from "games/naivigation/shared/dictShared";

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

        // the icons for the preferred shop
        const iconOffset = vis.get("cards.passengers.iconOffset");
        const positions = [
            iconOffset.clone(),
            new Vector2(vis.size.x - iconOffset.x, iconOffset.y)
        ]

        const shopData = MATERIAL[TileType.MAP][this.customData.shop];
        const resIcon = vis.getResource("map_tiles");
        for(const pos of positions)
        {
            const op = new LayoutOperation({
                pos: pos,
                size: vis.get("cards.passengers.shopIconSize"),
                frame: shopData.frame,
                pivot: Vector2.CENTER
            });
            group.add(resIcon, op);
        }
    }
}