import cardDrawerNaivigation from "games/naivigation/shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { GAME_DATA, MATERIAL, MISC, WEATHER_CARDS } from "../shared/dict";

export default class Card extends MaterialNaivigation
{
    getGameData() { return GAME_DATA; }
    getData() { return MATERIAL[this.type][this.key]; }
    getMisc() { return MISC; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        cardDrawerNaivigation(vis, group, this);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    getCustomIllustration(vis:MaterialVisualizer, op:LayoutOperation) : ResourceGroup
    {
        if(this.key != "weather") { return null; }

        const group = new ResourceGroup();
        const weatherData = WEATHER_CARDS[this.customData.weatherKey];

        // draw main weather icon
        const resIcon = vis.getResource("weather_cards");
        const opIcon = new LayoutOperation({
            size: op.size,
            frame: weatherData.frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(resIcon, opIcon);

        // draw its number => @TODO: might bake this into drawing in the end
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.weather.fontSize")
        }).alignCenter();

        const num = weatherData.num;
        const str = num > 0 ? "+" + num : num.toString();
        const resText = new ResourceText(str, textConfig);
        const opText = new LayoutOperation({
            size: op.size,
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: 0.1*textConfig.size,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        group.add(resText, opText);
        return group;
    }
}