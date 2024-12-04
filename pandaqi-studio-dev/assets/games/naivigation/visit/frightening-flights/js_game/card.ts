import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { GAME_DATA, MATERIAL, MISC, PASSENGER_BONUSES, PASSENGER_CURSES } from "../js_shared/dict";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import { CardType, TileType } from "games/naivigation/js_shared/dictShared";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";

export default class Card extends MaterialNaivigation
{
    getGameData() { return GAME_DATA; }
    getData() { return MATERIAL[this.type][this.key]; }
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
        const bonus = "REWARD:" + PASSENGER_BONUSES[this.customData.bonus].desc;
        const resTextBonus = new ResourceText(bonus, textConfig);
        const opTextBonus = new LayoutOperation({
            pos: vis.get("cards.passengers.bonusPos"),
            size: textBoxDims,
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resTextBonus, opTextBonus);

        const curse = "CURSE: " + PASSENGER_CURSES[this.customData.curse].desc;
        const resTextCurse = new ResourceText(curse, textConfig);
        const opTextCurse = new LayoutOperation({
            pos: vis.get("cards.passengers.cursePos"),
            size: textBoxDims,
            fill: "#000000",
            pivot: Point.CENTER
        });
        group.add(resTextCurse, opTextCurse);

        // the icons for the preferred airport
        const iconOffset = vis.get("cards.passengers.iconOffset");
        const positions = [
            iconOffset.clone(),
            new Point(vis.size.x - iconOffset.x, iconOffset.y)
        ]

        const airportData = MATERIAL[TileType.MAP][this.customData.airport];
        const resIcon = vis.getResource("map_tiles");
        for(const pos of positions)
        {
            const op = new LayoutOperation({
                pos: pos,
                size: vis.get("cards.passengers.airportIconSize"),
                frame: airportData.frame
            });
            group.add(resIcon, op);
        }
    }
}