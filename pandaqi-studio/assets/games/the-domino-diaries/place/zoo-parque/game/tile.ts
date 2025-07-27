import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ANIMALS, AnimalDetailData, AnimalDiet, AnimalSocial, AnimalType, MISC, TERRAINS, TerrainType } from "../shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig, { TextAlign, TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";

export default class Tile
{
    animal: AnimalType

    constructor(a:AnimalType)
    {
        this.animal = a;
    }

    getAnimalData() : AnimalDetailData
    {
        return ANIMALS[this.animal];
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        this.drawTemplate(vis, group);
        this.drawPassport(vis, group);
        this.drawDetails(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawTemplate(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("animal_passport");
        const op = new LayoutOperation({ size: vis.size, effects: vis.inkFriendlyEffect });
        group.add(res, op);
    }

    drawPassport(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getAnimalData();

        // image of the actual animal
        const res = vis.getResource("animals");
        const frame = data.frame;
        const op = new LayoutOperation({
            pos: vis.get("tiles.animal.pos"),
            size: vis.get("tiles.animal.size"),
            frame: frame,
            pivot: Point.CENTER
        })
        group.add(res, op);

        // optional extinct sign
        if(data.extinct)
        {
            const res = vis.getResource("misc");
            const op = new LayoutOperation({
                pos: vis.get("tiles.extinct.pos"),
                size: vis.get("tiles.extinct.size"),
                frame: MISC.extinct_stamp.frame,
                pivot: Point.CENTER,
                rot: -0.25*Math.PI + (Math.random() - 0.5) * 0.1 * Math.PI
            })
            group.add(res, op);
        }

        // fun fact/detail text below
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("tiles.funFact.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();
        const text = "<b>Fun Fact!</b> " + data.funFact;
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("tiles.funFact.pos"),
            size: vis.get("tiles.funFact.size"),
            fill: "#221100",
            pivot: Point.CENTER,
        })
        group.add(resText, opText);
    }

    drawDetails(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getAnimalData();

        // preferred terrains
        // @NOTE: remove wildcard terrain because it's just needed for nice code/generation, but obviously the entire idea is that wildcard terrain is EVERY terrain
        // @NOTE: sort alphabetically, because consistent terrain order across all passports is just nice (aesthetically)
        const terrains = data.terrains.slice();
        if(terrains.includes(TerrainType.WILDCARD))
        {
            terrains.splice(terrains.indexOf(TerrainType.WILDCARD));
        }
        terrains.sort((a,b) => a.localeCompare(b));

        const resTerrains = vis.getResource("terrains");
        const anchor = vis.get("tiles.terrains.posAnchor");
        const terrainIconDims = vis.get("tiles.terrains.size");
        const positions = getPositionsCenteredAround({ pos: anchor, num: terrains.length, size: terrainIconDims });
        const dropShadowEffect = [ new DropShadowEffect({ color: "#000000", blurRadius: vis.get("tiles.terrains.shadowBlur") }) ];
        for(let i = 0; i < positions.length; i++)
        {
            const op = new LayoutOperation({
                pos: positions[i],
                size: terrainIconDims,
                frame: TERRAINS[terrains[i]].frame,
                effects: dropShadowEffect,
                pivot: Point.CENTER
            })
            group.add(resTerrains, op);
        }

        // text for food requirements
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.food.fontSize"),
            alignHorizontal: TextAlign.END,
            alignVertical: TextAlign.MIDDLE,
        })

        let foodText = "";
        for(let i = 0; i < data.food; i++) { foodText += "|"; }

        const text = "Food: " + foodText;
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const glowBlur = 0.05*textConfig.size;
        const glowEffect = [ new DropShadowEffect({ color: "#001100", blurRadius: glowBlur }) ];
        console.log(glowEffect);
        const opText = new LayoutOperation({
            pos: vis.get("tiles.food.pos"),
            size: vis.get("tiles.food.size"),
            fill: "#BBFF99",
            stroke: "#001100",
            strokeWidth: 0.5*glowBlur,
            strokeAlign: StrokeAlign.OUTSIDE,
            effects: glowEffect,
            pivot: new Point(1, 0.5)
        })
        group.add(resText, opText);

        // optional checkmark for strong property
        if(data.strong)
        {
            this.placeCheckmark(vis, group, "strong");
        }

        // diet + social choices
        this.placeCheckmark(vis, group, (data.diet == AnimalDiet.CARNI) ? "carnivore" : "herbivore");
        this.placeCheckmark(vis, group, (data.social == AnimalSocial.HERD) ? "social" : "solitary");

        // text for power
        const textConfigPower = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("tiles.power.fontSize"),
            style: TextStyle.ITALIC,
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.START
        })
        const textPower = data.power ?? "None.";
        const resTextPower = new ResourceText({ text: textPower, textConfig: textConfigPower });
        const opTextPower = new LayoutOperation({
            pos: vis.get("tiles.power.pos"),
            size: vis.get("tiles.power.size"),
            fill: "#221100",
        })
        group.add(resTextPower, opTextPower);
    }

    // @TODO: slight randomization of rotation + translation for checkmarks?
    placeCheckmark(vis:MaterialVisualizer, group:ResourceGroup, key:string)
    {
        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            pos: vis.get("tiles.checkmarks." + key),
            size: vis.get("tiles.checkmarks.size"),
            frame: MISC.checkmark.frame,
            pivot: Point.CENTER,
        })
        group.add(res, op);
    }
}