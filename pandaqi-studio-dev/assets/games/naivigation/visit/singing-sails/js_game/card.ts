import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { GAME_DATA, MATERIAL, MISC, WEATHER_CARDS } from "../js_shared/dict";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";

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

    getCustomIllustration(vis:MaterialVisualizer, card:MaterialNaivigation, op:LayoutOperation) : ResourceImage
    {
        if(this.key != "weather") { return null; }

        const canvSize = new Point(vis.sizeUnit);
        const ctx = createContext({ size: canvSize });
        const group = new ResourceGroup();
        const weatherData = WEATHER_CARDS[this.customData.weatherKey];

        // draw main weather icon
        const resIcon = vis.getResource("weather_cards");
        const opIcon = new LayoutOperation({
            size: new Point(vis.sizeUnit),
            frame: weatherData.frame
        });
        group.add(resIcon, opIcon);

        // draw is number => @TODO: might bake this into it in the end
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.weather.fontSize")
        }).alignCenter();

        const num = weatherData.num;
        const str = num > 0 ? "+" + num : num.toString();
        const resText = new ResourceText(str, textConfig);
        const opText = new LayoutOperation({
            pos: vis.center,
            size: vis.size,
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: 0.1*textConfig.size,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        group.add(resText, opText);

        // Finally, turn that all into a resource image to give back
        group.toCanvas(ctx);
        return new ResourceImage(ctx.canvas);
    }
}